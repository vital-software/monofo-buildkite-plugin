import debug from 'debug';
import _ from 'lodash';
import { getAllDecisions } from './decide';
import { ARTIFACT_INJECTION_STEP_KEY, artifactInjectionSteps, nothingToDoSteps } from './steps';

const log = debug('monofo:merge');

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
 * @param results
 */
export default function mergePipelines(results: ConfigWithChanges[]): Pipeline {
  log(`Merging ${results.length} pipelines`);
  const decisions: ConfigWithDecision[] = getAllDecisions(results);

  // Announce decisions
  decisions.forEach((config) => {
    log(`${config.monorepo.name} will be ${config.included ? 'INCLUDED' : 'EXCLUDED'} because it has ${config.reason}`);
  });

  const artifactSteps = artifactInjectionSteps(decisions);

  return _.mergeWith(
    toPipeline(artifactSteps),
    ...replaceExcludedKeys(decisions, artifactSteps.length > 0).map(toMerge),
    toPipeline(nothingToDoSteps(decisions)),
    (dst: unknown, src: unknown) => (_.isArray(dst) ? dst.concat(src) : undefined)
  ) as Pipeline;
}
