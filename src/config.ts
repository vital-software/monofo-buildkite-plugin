import { promises as fs } from 'fs';
import * as path from 'path';
import { safeLoad } from 'js-yaml';
import toposort from 'toposort';
import debug from 'debug';
import _ from 'lodash';

const log = debug('monofo:config');

const CONFIG_REL_PATH = '.buildkite/';
const PIPELINE_FILE = /^pipeline\.(?<name>.*)\.yml$/;
const MONOREPO_EMPTY_CONFIG = {
  expects: [],
  produces: [],
  matches: [],
};

function thrw<T>(e: Error): T {
  throw e;
}

interface ConfigFile {
  path: string;
}

export interface Config extends ConfigFile {
  name: string;
  monorepo: {
    expects: string[];
    produces: string[];
    matches: string[];
  };
  steps: { [key: string]: any }[];
  env?: { [key: string]: any } | string[];
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

function arr(v: undefined | string[] | string): string[] {
  if (_.isArray(v)) {
    return v;
  } else {
    if (!v || (v?.length || 0) <= 0) {
      return [];
    } else {
      return [String(v)];
    }
  }
}

async function readConfig(config: ConfigFile): Promise<ConfigFile> {
  const match = path.basename(config.path).match(PIPELINE_FILE);
  const name = match?.groups?.name;

  if (!name) {
    return Promise.resolve(config);
  }

  return fs.readFile(config.path).then((buf) => {
    const { monorepo, steps, env } = safeLoad(buf.toString());

    return {
      ...config,
      name,
      monorepo: {
        expects: arr(monorepo.expects),
        produces: arr(monorepo.produces),
        matches: arr(monorepo.matches),
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

  return toposort(
    configs.flatMap((c) => {
      return c.monorepo.expects.map((e) => {
        return byProducerOf[e]
          ? ([byProducerOf[e].name, c.name] as [string, string]) // producer of an expected artifact must happen first
          : thrw<[string, string]>(new Error(`Could not find a component that produces "${e}"`));
      });
    })
  ).map((name) => byName[name]);
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
