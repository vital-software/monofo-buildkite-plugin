import chalk from 'chalk';
import debug from 'debug';
import _ from 'lodash';
import Config from './config';
import { updateDecisions } from './decide';
import { ARTIFACT_INJECTION_STEP_KEY, artifactInjectionSteps } from './steps/artifact-injection';
import { nothingToDoSteps } from './steps/nothing-to-do';
import { recordSuccessSteps } from './steps/record-success';

const log = debug('monofo:merge');

/**
 * Loop through the decided configurations and, for any excluded parts, collect the keys of steps that are now skipped.
 * Then rewrite the depends_on of any dependent steps to point at the artifact injection step.
 */
function replaceExcludedKeys(configs: Config[], hasArtifactStep: boolean): Config[] {
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

  configs.forEach((c) => {
    c.mapSteps((step) =>
      !step.depends_on
        ? step
        : {
            ...step,
            depends_on: filterDependsOn(step.depends_on),
          }
    );
  });

  return configs;
}

/**
 * Gets the base build environment variables - one or more extra env vars that should be included in the built pipeline
 *
 * Currently, we use a single base build for all components, so we only export a single env var. But if, in the future,
 * we get fancier, we should emit one for each component. `MONOFO_${config.envVarName()}_BASE_BUILD_ID`
 */
function baseBuildEnvVars(config: Config): Record<string, string | undefined> {
  return { 'MONOFO_BASE_BUILD_ID': config.buildId || 'unknown' }
}

function toMerge(config: Config): Pipeline {
  const { monorepo, included, steps, env } = config

  const excludedEnv = Object.entries(monorepo.excluded_env).length > 0 ? monorepo.excluded_env : {}
  const excludedSteps = monorepo.excluded_steps.length > 0 ? monorepo.excluded_steps : []

  return {
    env: Object.assign(baseBuildEnvVars(config), included ? env : excludedEnv),
    steps: included ? steps : excludedSteps
  };
}

function toPipeline(steps: Step[]): Pipeline {
  return { env: {}, steps };
}

export default async function mergePipelines(configs: Config[]): Promise<Pipeline> {
  log(`Merging ${configs.length} pipelines`);

  await updateDecisions(configs);

  const maxLen = Math.min(20, Math.max(...configs.map((c) => c.monorepo.name.length)));

  // Announce decisions
  configs.forEach((config) => {
    log(
      `${config.included ? '✅' : '🚫'}  ${chalk.blue(config.monorepo.name.padEnd(maxLen))} will be ${
        config.included ? chalk.green('included') : chalk.red('excluded')
      } because it has ${config.reason}`
    );
  });

  const artifactSteps = artifactInjectionSteps(configs);

  return _.mergeWith(
    toPipeline(artifactSteps),
    ...replaceExcludedKeys(configs, artifactSteps.length > 0).map(toMerge),
    toPipeline(nothingToDoSteps(configs)),
    toPipeline(await recordSuccessSteps(configs)),
    (dst: unknown, src: unknown) => (_.isArray(dst) ? dst.concat(src) : undefined)
  ) as Pipeline;
}
