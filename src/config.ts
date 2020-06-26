import { promises as fs } from 'fs';
import * as path from 'path';
import { safeLoad } from 'js-yaml';
import toposort from 'toposort';
import debug from 'debug';
import _ from 'lodash';

const log = debug('monofo:config');

const CONFIG_REL_PATH = '.buildkite/';
const PIPELINE_FILE = /^pipeline\.(?<name>.*)\.yml$/;
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
 * Whether we could read the name and monorepo info out of the config file
 */
function isConfig(c: ConfigFile): c is Config {
  return (c as Config).name?.length > 0 && typeof (c as Config).monorepo === 'object';
}

async function getConfigFiles(dir: string): Promise<Config[]> {
  return fs
    .readdir(dir)
    .then((files: string[]) => {
      return files.map((file) => {
        return {
          path: path.join(dir, file),
        } as Config;
      });
    })
    .catch((e) => {
      log(e);
      return [];
    });
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

async function readConfig(config: ConfigFile): Promise<ConfigFile> {
  const match = PIPELINE_FILE.exec(path.basename(config.path));
  const name = match?.groups?.name;

  if (!name) {
    return Promise.resolve(config);
  }

  return fs.readFile(config.path).then((buf) => {
    const { monorepo, steps, env } = (safeLoad(buf.toString()) as unknown) as Config;

    if (_.isArray(env)) {
      // Fail noisily rather than missing the merge of the env vars
      throw new Error('TODO: monofo cannot cope with env being an array yet (split to object)');
    }

    if (!monorepo || typeof monorepo !== 'object') {
      log(`Skipping ${name} because it has no monorepo configuration`);
      return config;
    }

    // TODO: Could do a lot more type checking here for malformed pipeline.yml files

    return {
      ...config,
      name,
      monorepo: {
        ...monorepo,
        expects: strings(monorepo.expects),
        produces: strings(monorepo.produces),
        matches: strings(monorepo.matches),
        excluded_steps: monorepo.excluded_steps || [],
      },
      steps,
      env,
    } as Config;
  });
}

/**
 * Index the configs by the artifacts each produces, and sort them into dependency order
 */
function sort(configs: Config[]): Config[] {
  const byName = Object.fromEntries(configs.map((c) => [c.name, c]));
  const byProducerOf = Object.fromEntries(configs.flatMap((c) => c.monorepo.produces.map((p) => [p, c])));

  const sorted = toposort(
    configs.flatMap((c) => {
      return c.monorepo.expects.map((e) => {
        return byProducerOf[e]
          ? ([byProducerOf[e].name, c.name] as [string, string]) // producer of an expected artifact must happen first
          : thrw<[string, string]>(new Error(`Could not find a component that produces "${e}"`));
      });
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
  const configDir = path.join(process.cwd(), CONFIG_REL_PATH);
  return getConfigFiles(configDir)
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
