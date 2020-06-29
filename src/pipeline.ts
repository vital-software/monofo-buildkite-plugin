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

/**
 * Normally, this subcomponent would produce artifacts: config.produces, but now that it has been excluded, we want to
 * replace it with a call to our artifacts utility, which will retrieve them from a previous build.
 */
function replacementForExcludedSteps(config: Required<DecoratedConfig>): Record<string, unknown>[] {
  return config.monorepo.excluded_steps.length > 0
    ? config.monorepo.excluded_steps
    : [
        {
          label: `Inject artifacts for ${config.name}`,
          command: `monofo artifact --build-id=${config.buildId} ${config.monorepo.produces.join(' ')}`, // TODO: npx? yarn? $0?
          plugins: [
            {
              'artifacts#v1.3.0': {
                upload: config.monorepo.produces,
              },
            },
          ],
        } as CommandStep,
      ];
}

function exclude(config: Required<DecoratedConfig>, reason: string): Pipeline {
  const message = `${config.name} will be EXCLUDED because it has ${reason}.`;
  log(message);
  return { env: config.env, steps: replacementForExcludedSteps(config) };
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
  if (process.env.PIPELINE_RUN_ALL) {
    log('PIPELINE_RUN_ALL override in place, will include all pipeline parts');
    return include(config, 'no previous successful build');
  }

  if (!config.buildId) {
    log("Didn't find previous successful build, falling back to perform all parts of pipeline");
    return include(config, 'no previous successful build');
  }

  // At this point, we know it has a config.buildId we can grab artifacts from
  if (config.changes.length <= 0) {
    return exclude(config as Required<DecoratedConfig>, 'no matching changes');
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
