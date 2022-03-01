import chalk from 'chalk';
import debug from 'debug';
import _ from 'lodash';
import sendBuildkiteAnnotation from './annotate';
import { updateDecisions } from './decide';
import Config from './models/config';
import { isGroupStep, mergeGroups } from './models/group-step';
import { Pipeline } from './models/pipeline';
import { Step } from './models/step';
import { ARTIFACT_INJECTION_STEP_KEY, artifactInjectionSteps } from './steps/artifact-injection';
import { nothingToDoSteps } from './steps/nothing-to-do';
import { recordSuccessSteps } from './steps/record-success';

const log = debug('monofo:merge');

/**
 * Loop through the decided configurations and, for any excluded parts, collect the keys of steps that are now skipped.
 * Then rewrite the depends_on of any dependent steps to point at the artifact injection step.
 *
 * This method must deal with depends_on being available at multiple different levels of the step in the case of group
 * steps
 *
 * This method also mutates the steps of the passed-in configs directly
 */
export function replaceExcludedKeys(configs: Config[], hasArtifactStep: boolean): void {
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

  for (const config of configs) {
    for (const step of config.allSteps()) {
      if (step.depends_on) {
        step.depends_on = filterDependsOn(step.depends_on);
      }

      if (isGroupStep(step)) {
        for (const innerStep of step.steps) {
          if (innerStep.depends_on) {
            innerStep.depends_on = filterDependsOn(innerStep.depends_on);
          }
        }
      }
    }
  }
}

/**
 * Gets the base build environment variables - one or more extra env vars that should be included in the built pipeline
 *
 * Currently, we use a single base build for all components, so we only export a single env var. But if, in the future,
 * we get fancier, we should emit one for each component. `MONOFO_${config.envVarName()}_BASE_BUILD_ID`
 */
function baseBuildEnvVars(config: Config): Record<string, string | undefined> {
  return {
    MONOFO_BASE_BUILD_ID: config.baseBuild?.id || 'unknown',
    MONOFO_BASE_BUILD_COMMIT: config.baseBuild?.commit || 'unknown',
  };
}

function toMerge(config: Config): Pipeline {
  const { monorepo, included, steps, env } = config;

  const excludedEnv = Object.entries(monorepo.excluded_env).length > 0 ? monorepo.excluded_env : {};
  const excludedSteps = monorepo.excluded_steps.length > 0 ? monorepo.excluded_steps : [];

  return {
    env: Object.assign(baseBuildEnvVars(config), included ? env : excludedEnv),
    steps: included ? steps : excludedSteps,
  };
}

function toPipeline(steps: Step[]): Pipeline {
  return { env: {}, steps };
}

/**
 * This is the main co-ordinating function at the heart of the pipeline generator
 *
 * It takes a set of configs, puts them through the decision-making process, and merges the final product together into
 * a single Pipeline that is returned
 */
export default async function mergePipelines(configs: Config[]): Promise<Pipeline> {
  log(`Merging ${configs.length} pipelines`);

  await updateDecisions(configs);

  const maxLen = Math.min(20, Math.max(...configs.map((c) => c.monorepo.name.length)));

  // Announce decisions
  configs.forEach((config) => {
    log(
      `${config.included ? '✅' : '🚫'}  ${chalk.blue(config.monorepo.name.padEnd(maxLen))} will be ${
        config.included ? chalk.green('included') : chalk.red('excluded')
      } because it has ${config.reason.toString()}`
    );
  });

  // @todo This should be pure, not send an annotation
  await sendBuildkiteAnnotation(configs);

  const artifactSteps = artifactInjectionSteps(configs);

  replaceExcludedKeys(configs, artifactSteps.length > 0);

  const pipelineParts: Pipeline[] = [
    toPipeline(artifactSteps),
    ...configs.map(toMerge),
    toPipeline(nothingToDoSteps(configs)),
    toPipeline(await recordSuccessSteps(configs)),
  ];

  const merged: Pipeline = _.mergeWith({}, ...pipelineParts, (dst: unknown, src: unknown) =>
    _.isArray(dst) ? dst.concat(src) : undefined
  ) as Pipeline;

  mergeGroups(merged);

  return merged;
}
