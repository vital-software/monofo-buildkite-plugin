import _ from 'lodash';
import debug from 'debug';
import { ARTIFACT_INJECTION_STEP_KEY, artifactInjectionSteps, nothingToDoSteps } from './steps';

const log = debug('monofo:pipeline');

export interface Pipeline {
  steps: Step[];
  env: Record<string, string>;
}

const plurals = (n: number): string => (n === 1 ? '' : 's');
const count = (arr: Array<unknown>, name: string): string => `${arr.length} ${name}${plurals(arr.length)}`;

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

function toPipeline(steps: Step[]): Pipeline {
  return { env: {}, steps };
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

  return _.mergeWith(
    toPipeline(artifactInjectionSteps(decisions)),
    ...decisions.map(toMerge),
    toPipeline(nothingToDoSteps(decisions)),
    (dst: unknown, src: unknown) => (_.isArray(dst) ? dst.concat(src) : undefined)
  ) as Pipeline;
}
