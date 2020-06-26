import _ from 'lodash';
import debug from 'debug';

const log = debug('monofo:pipeline');

export interface Pipeline {
  steps: Record<string, unknown>[];
  env: Record<string, string>;
}

const EMPTY_PIPELINE: Pipeline = { env: {}, steps: [] };

const s = (n: number): string => (n === 1 ? '' : 's');
const count = (arr: Array<unknown>, name: string): string => `${arr.length} ${name}${s(arr.length)}`;

function replaceExcludedSteps(config: DecoratedConfig): Record<string, unknown>[] {
  // TODO: autogenerate artifact replacement steps instead
  return config.monorepo.excluded_steps;
}

function exclude(config: DecoratedConfig, reason: string): Pipeline {
  const message = `${config.name} will be EXCLUDED because it has ${reason}.`;
  log(message);
  return { env: config.env, steps: replaceExcludedSteps(config) };
}

function include({ name, env, changes, steps }: DecoratedConfig, reason: string): Pipeline {
  log(`${name} will be INCLUDED because it has ${reason} ${count(changes, 'matching change')}: ${changes.join(', ')}`);
  return { env, steps };
}

/**
 * If a config has changes, its steps are merged into the final build. Otherwise, it is excluded, and its excluded_steps
 * are merged in instead
 */
function toMerge(config: DecoratedConfig): Pipeline {
  if (!config.buildId) {
    log("Didn't find previous successful build, falling back to perform all parts of pipeline");
    return include(config, 'no previous successful build');
  }

  // At this point, we know it has a config.buildId we can grab artifacts from
  if (config.changes.length <= 0) {
    return exclude(config, 'no matching changes');
  }

  return include(config, `${count(config.changes, 'matching change')}: ${config.changes.join(', ')}`);
}

/**
 * @param results
 */
export function mergePipelines(results: DecoratedConfig[]): Pipeline {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return _.mergeWith(EMPTY_PIPELINE, ...results.map(toMerge), (dst: unknown, src: unknown) =>
    _.isArray(dst) ? dst.concat(src) : undefined
  );
}
