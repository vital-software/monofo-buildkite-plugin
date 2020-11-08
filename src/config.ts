import { promises as fs } from 'fs';
import { join, basename } from 'path';
import { promisify } from 'util';
import debug from 'debug';
import globAsync from 'glob';
import { safeLoad } from 'js-yaml';
import _ from 'lodash';
import toposort from 'toposort';

const glob = promisify(globAsync);
const log = debug('monofo:config');

const PIPELINE_FILE = /^pipeline\.(?<name>.*)\.yml$/;
const PIPELINE_FILE_GLOB = '**/pipeline*.yml';
const PIPELINE_FILE_IGNORE_GLOB = ['**/node_modules/**'];
const BUILDKITE_REQUIRED_ENV = [
  'BUILDKITE_BRANCH',
  'BUILDKITE_COMMIT',
  'BUILDKITE_ORGANIZATION_SLUG',
  'BUILDKITE_PIPELINE_DEFAULT_BRANCH',
  'BUILDKITE_PIPELINE_SLUG',
  'BUILDKITE_SOURCE',
  'BUILDKITE_API_ACCESS_TOKEN',
];

function thrw<T>(e: Error): T {
  throw e;
}

/**
 * Whether we could read the monorepo info out of the config file
 */
function isConfig(c: ConfigFile): c is Config {
  return typeof (c as Config).monorepo === 'object';
}

/**
 * Searches for all pipeline files anywhere in the current working directory, and returns their file locations
 */
async function getConfigFiles(): Promise<ConfigFile[]> {
  const cwd = process.cwd();

  try {
    const pipelines = await glob(PIPELINE_FILE_GLOB, {
      dot: true,
      cwd,
      ignore: PIPELINE_FILE_IGNORE_GLOB,
    });

    return pipelines.map((path) => {
      return {
        basePath: cwd,
        path,
      };
    });
  } catch (e) {
    log(e);
    return [];
  }
}

function strings(v: undefined | string[] | string): string[] {
  if (!v || v.length <= 0) {
    return [];
  }
  if (_.isArray(v)) {
    return v;
  }
  return [String(v)];
}

function nameFromFilename(config: ConfigFile): string | undefined {
  const match = PIPELINE_FILE.exec(basename(config.path));
  return match?.groups?.name || undefined;
}

async function readConfig(config: ConfigFile): Promise<ConfigFile> {
  return fs.readFile(join(config.basePath, config.path)).then((buf) => {
    const { monorepo, steps, env } = (safeLoad(buf.toString()) as unknown) as Config;

    if (_.isArray(env)) {
      // Fail noisily rather than missing the merge of the env vars
      throw new Error('TODO: monofo cannot cope with env being an array yet (split to object)');
    }

    const name = monorepo?.name || nameFromFilename(config);

    if (!name) {
      log(`Skipping ${config.path} because it has no pipeline name`);
      return Promise.resolve(config);
    }

    if (!monorepo || typeof monorepo !== 'object') {
      log(`Skipping ${name} because it has no monorepo configuration`);
      return config;
    }

    return {
      ...config,
      monorepo: {
        ...monorepo,
        name,
        expects: strings(monorepo.expects),
        produces: strings(monorepo.produces),
        matches: strings(monorepo.matches),
        depends_on: strings(monorepo.depends_on),
        excluded_steps: monorepo.excluded_steps || [],
        excluded_env: monorepo.excluded_env || {},
      },
      steps,
      env,
    };
  });
}

/**
 * Indexes the configs by the artifacts each produces, and the depends_on list, and sorts them into dependency order
 *
 * We presort by name (which might not just come from the file name any longer). This makes toposort tie-breaker order
 * independent of location on the filesystem
 */
function sort(configs: Config[]): Config[] {
  const byName = Object.fromEntries(configs.map((c) => [c.monorepo.name, c]));
  const byProducerOf = Object.fromEntries(configs.flatMap((c) => c.monorepo.produces.map((p) => [p, c])));

  const sorted = toposort.array(
    Object.keys(byName).sort(),
    configs.flatMap((c) => {
      // The constraints on ordering are:
      return [
        // the producer of an expected artifact must happen before the current config
        ...c.monorepo.expects.map((expected): [string, string] => {
          return byProducerOf[expected]
            ? [byProducerOf[expected].monorepo.name, c.monorepo.name]
            : thrw(new Error(`Could not find a component that produces "${expected}"`));
        }),
        // configs we depend_on must happen before the current config
        ...c.monorepo.depends_on.map((dependency): [string, string] => {
          return byName[dependency]
            ? [dependency, c.monorepo.name]
            : thrw(new Error(`Could not find a config named "pipeline.${dependency}.yml"`));
        }),
      ];
    })
  );

  log(`Will apply pipelines in order: [${sorted.join(', ')}]`);
  return sorted.map((name) => byName[name]);
}

/**
 * Reads pipeline.foo.yml files from .buildkite/*, parses them, and returns them as Config objects in the right order
 * to be processed
 */
export default async function getConfigs(): Promise<Config[]> {
  return getConfigFiles()
    .then((configs) => Promise.all(configs.map(readConfig)))
    .then((configs) => sort(configs.filter(isConfig)));
}

export function getBuildkiteInfo(e: NodeJS.ProcessEnv = process.env): BuildkiteEnvironment {
  if (typeof e !== 'object') {
    throw new Error('Invalid configuration source object');
  }

  BUILDKITE_REQUIRED_ENV.forEach((req) => {
    if (!e[req]) {
      throw new Error(`Expected to find ${req} env var`);
    }
  });

  return {
    // We probably actually want the Github default branch, but close enough:
    defaultBranch: e.BUILDKITE_PIPELINE_DEFAULT_BRANCH,
    org: e.BUILDKITE_ORGANIZATION_SLUG,
    pipeline: e.BUILDKITE_PIPELINE_SLUG,
    branch: e.BUILDKITE_BRANCH,
    commit: e.BUILDKITE_COMMIT,
    source: e.BUILDKITE_SOURCE,
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      BUILDKITE_BRANCH: string;
      BUILDKITE_COMMIT: string;
      BUILDKITE_ORGANIZATION_SLUG: string;
      BUILDKITE_PIPELINE_DEFAULT_BRANCH: string;
      BUILDKITE_PIPELINE_SLUG: string;
      BUILDKITE_SOURCE: string;
      BUILDKITE_API_ACCESS_TOKEN: string;
      PIPELINE_RUN_ALL?: string;
      PIPELINE_RUN_ONLY?: string;
    }
  }
}
