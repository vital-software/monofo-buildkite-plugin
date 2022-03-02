import Config, { keysInConfigs } from './models/config';
import { isGroupStep } from './models/step';
import { ARTIFACT_INJECTION_STEP_KEY } from './steps/artifact-injection';

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
  const excludedKeys: string[] = keysInConfigs(configs.filter((c: Config) => !c.included));

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
