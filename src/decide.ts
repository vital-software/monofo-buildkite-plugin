import { count } from './util';

const decide = (included: boolean, reason: string): IncludeDecision => ({
  included,
  reason,
});

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
export function getMergeDecision(config: ConfigWithChanges): IncludeDecision {
  if (process.env.PIPELINE_RUN_ALL) {
    return decide(true, 'been forced to by PIPELINE_RUN_ALL');
  }

  const envVarName = config.monorepo.name.toLocaleUpperCase().replace(/-/g, '_');

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

/**
 * Mutates the config objects within ConfigWithDecision to account for transitive dependencies between pipelines
 *
 * Expects the provided configs to be sorted in topological order already, and to have their initial decisions (e.g.
 * around matches) to be filled in first. The configs in the provided array are mutated by reference.
 */
export function updateDecisionsForDependsOn(configs: ConfigWithDecision[]): void {
  const byName = Object.fromEntries(configs.map((c) => [c.monorepo.name, c]));

  configs
    .flatMap((config) => config.monorepo.depends_on.map((dependency) => [config.monorepo.name, dependency]))
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
