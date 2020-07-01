import _ from 'lodash';
import debug from 'debug';

const log = debug('monofo:pipeline');

export interface Pipeline {
  steps: Step[];
  env: Record<string, string>;
}

const ARTIFACT_INJECTION_STEP_KEY = 'monorepo-inject-artifacts';
const EMPTY_PIPELINE: Pipeline = { env: {}, steps: [] };

const plurals = (n: number): string => (n === 1 ? '' : 's');
const count = (arr: Array<unknown>, name: string): string => `${arr.length} ${name}${plurals(arr.length)}`;

function artifactInjection(configs: ConfigWithDecision[]): Pipeline {
  const names = configs.filter((c) => !c.included).map((c) => c.name);
  const produces = configs.filter((c) => !c.included).flatMap((e) => e.monorepo.produces);
  const { buildId } = configs[0];

  if (names.length < 1 || produces.length < 1 || !buildId) {
    log("Not adding inject artifacts step: doesn't seem to be needed");
    return EMPTY_PIPELINE;
  }

  if (!buildId) {
    log('Not adding inject artifacts step: no build ID found');
    return EMPTY_PIPELINE;
  }

  return {
    env: {},
    steps: [
      {
        key: ARTIFACT_INJECTION_STEP_KEY,
        label: `:crystal_ball: get skipped artifacts`,
        command: `echo 'inject for: ${names.join(', ')}'`,
        plugins: [
          {
            'artifacts#v1.3.0': {
              build: buildId,
              download: produces,
              upload: produces,
            },
          },
        ],
      } as CommandStep,
    ],
  };
}

/**
 * Loop through the decided configurations and, for any excluded parts, collect the keys of steps that are now skipped.
 * Then rewrite the depends_on of any dependent steps to point at the artifact injection step.
 */
function replaceExcludedKeys(configs: ConfigWithDecision[]): ConfigWithDecision[] {
  const excludedKeys: string[] = configs
    .filter((c) => !c.included)
    .flatMap((c) => c.steps.map((s) => (typeof s.key === 'string' ? s.key : '')).filter((v) => v));

  const filterDependsOn = (dependsOn: string | string[]): string[] => {
    return (typeof dependsOn === 'string' ? [dependsOn] : dependsOn)
      .map((d) => (excludedKeys.indexOf(d) !== -1 ? ARTIFACT_INJECTION_STEP_KEY : d))
      .filter((v, i, a) => a.indexOf(v) === i);
  };

  return configs.map((c) => {
    return {
      ...c,
      steps: c.steps.map((step) =>
        !step.depends_on
          ? step
          : {
              ...step,
              depends_on: filterDependsOn(step.depends_on),
            }
      ),
    };
  });
}

export interface IncludeDecision {
  included: boolean;
  reason: string;
}

/**
 * If a config has changes, its steps are merged into the final build. Otherwise, it is excluded, and its excluded_steps
 * are merged in instead
 */
function getMergeDecision(config: ConfigWithChanges): IncludeDecision {
  const decide = (included: boolean, reason: string) =>
    ({
      included,
      reason,
    } as IncludeDecision);

  if (process.env.PIPELINE_RUN_ALL) {
    return { included: true, reason: 'been forced to by PIPELINE_RUN_ALL' };
  }

  if (!config.buildId) {
    return decide(true, 'no previous successful build, fallback');
  }

  // At this point, we know it has a config.buildId we can grab artifacts from
  if (config.changes.length <= 0) {
    return decide(false, 'no matching changes');
  }

  return decide(true, `${count(config.changes, 'matching change')}: ${config.changes.join(', ')}`);
}

function toMerge({ steps, env, included, monorepo }: ConfigWithDecision): Pipeline {
  return included
    ? {
        env,
        steps,
      }
    : {
        env,
        steps: monorepo.excluded_steps.length > 0 ? monorepo.excluded_steps : [],
      };
}

/**
 * @param results
 */
export function mergePipelines(results: ConfigWithChanges[]): Pipeline {
  log(`Merging ${results.length} pipelines`);

  const decisions: ConfigWithDecision[] = replaceExcludedKeys(
    results.map((r) => {
      return {
        ...r,
        ...getMergeDecision(r),
      } as ConfigWithDecision;
    })
  );

  // Announce decisions
  decisions.forEach((config) => {
    log(`${config.name} will be ${config.included ? 'INCLUDED' : 'EXCLUDED'} because it has ${config.reason}`);
  });

  return _.mergeWith(artifactInjection(decisions), ...decisions.map(toMerge), (dst: unknown, src: unknown) =>
    _.isArray(dst) ? dst.concat(src) : undefined
  ) as Pipeline;
}
