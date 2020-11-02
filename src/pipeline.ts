import _ from 'lodash';
import debug from 'debug';
import { ARTIFACT_INJECTION_STEP_KEY, artifactInjectionSteps, nothingToDoSteps } from './steps';
import { count } from './util';

const log = debug('monofo:pipeline');

const decide = (included: boolean, reason: string): IncludeDecision => ({
  included,
  reason,
});

/**
 * Loop through the decided configurations and, for any excluded parts, collect the keys of steps that are now skipped.
 * Then rewrite the depends_on of any dependent steps to point at the artifact injection step.
 */
function replaceExcludedKeys(configs: ConfigWithDecision[], hasArtifactStep: boolean): ConfigWithDecision[] {
  const excludedKeys: string[] = configs
    .filter((c) => !c.included)
    .flatMap((c) => c.steps.map((s) => (typeof s.key === 'string' ? s.key : '')).filter((v) => v));

  // If there's no artifact dependencies for the whole build, no need to wait for this step (it won't be added either)
  const replaceWith = hasArtifactStep ? ARTIFACT_INJECTION_STEP_KEY : '';

  const filterDependsOn = (dependsOn: string | string[]): string[] => {
    return (typeof dependsOn === 'string' ? [dependsOn] : dependsOn)
      .map((d) => (excludedKeys.indexOf(d) !== -1 ? replaceWith : d))
      .filter((v) => v)
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
 * are merged in instead. There are exceptions:
 *  - An env var named PIPELINE_RUN_ALL, set to any value, indicates that all steps should run
 *  - An env var named PIPELINE_RUN_<NAME>, where NAME is the UPPER_SNAKE_CASE version of the component pipeline name,
 *    set to any value, indicates that step should run
 */
function getMergeDecision(config: ConfigWithChanges): IncludeDecision {
  if (process.env.PIPELINE_RUN_ALL) {
    return decide(true, 'been forced to by PIPELINE_RUN_ALL');
  }

  const envVarName = config.name.toLocaleUpperCase().replace('-', '_');

  const overrideExcludeKey = `PIPELINE_NO_RUN_${envVarName}`;
  if (process.env[overrideExcludeKey]) {
    return decide(false, `been forced NOT to by ${overrideExcludeKey}`);
  }

  const overrideIncludeKey = `PIPELINE_RUN_${envVarName}`;
  if (process.env[overrideIncludeKey]) {
    return decide(true, `been forced to by ${overrideIncludeKey}`);
  }

  if (!config.buildId) {
    return decide(true, 'no previous successful build, fallback');
  }

  // At this point, we know it has a config.buildId we can grab artifacts from
  if (config.changes.length > 0) {
    return decide(true, `${count(config.changes, 'matching change')}: ${config.changes.join(', ')}`);
  }

  return decide(false, 'no matching changes');
}

function toMerge({ steps, env, included, monorepo }: ConfigWithDecision): Pipeline {
  return included
    ? {
        env,
        steps,
      }
    : {
        env: Object.entries(monorepo.excluded_env).length > 0 ? monorepo.excluded_env : {},
        steps: monorepo.excluded_steps.length > 0 ? monorepo.excluded_steps : [],
      };
}

function toPipeline(steps: Step[]): Pipeline {
  return { env: {}, steps };
}

/**
 * Mutates the config objects within ConfigWithDecision to account for transitive dependencies between pipelines
 */
function updateDecisionsForDependsOn(configs: ConfigWithDecision[]): void {
  const byName = Object.fromEntries(configs.map((c) => [c.name, c]));

  configs
    .flatMap((config) => config.monorepo.depends_on.map((dependency) => [config.name, dependency]))
    .reverse()
    .forEach(([from, to]) => {
      const dependent = byName[from];
      const dependency = byName[to];

      if (dependent.included && !dependency.included) {
        dependency.included = true;
        dependency.reason = `been pulled in by a depends_on from ${from}`;
      }
    });
}

/**
 * @param results
 */
export function mergePipelines(results: ConfigWithChanges[]): Pipeline {
  log(`Merging ${results.length} pipelines`);

  const decisions: ConfigWithDecision[] = results.map((r) => {
    return {
      ...r,
      ...getMergeDecision(r),
    } as ConfigWithDecision;
  });

  // Mutate for depends_on
  updateDecisionsForDependsOn(decisions);

  // Announce decisions
  decisions.forEach((config) => {
    log(`${config.name} will be ${config.included ? 'INCLUDED' : 'EXCLUDED'} because it has ${config.reason}`);
  });

  const artifactSteps = artifactInjectionSteps(decisions);

  return _.mergeWith(
    toPipeline(artifactSteps),
    ...replaceExcludedKeys(decisions, artifactSteps.length > 0).map(toMerge),
    toPipeline(nothingToDoSteps(decisions)),
    (dst: unknown, src: unknown) => (_.isArray(dst) ? dst.concat(src) : undefined)
  ) as Pipeline;
}
