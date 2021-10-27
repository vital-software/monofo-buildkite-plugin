/* eslint-disable no-param-reassign */

import { getBuildkiteInfo } from './buildkite/config';
import { CacheMetadataKey, CacheMetadataRepository } from './cache-metadata';
import Config from './config';
import { service } from './dynamodb';
import { FileHasher } from './hash';
import Reason, { ExcludeReasonType, IncludeReasonType } from './reason';

/**
 * If a config has changes, its steps are merged into the final build. Otherwise, it is excluded, and its excluded_steps
 * are merged in instead.
 */
function updateDecisionsForChanges(configs: Config[]): void {
  configs.forEach((config) => {
    if (config.changes.length > 0) {
      let reasonType = IncludeReasonType.FILE_MATCH;

      if (typeof config.monorepo.matches === 'boolean') {
        reasonType = config.monorepo.matches ? IncludeReasonType.ALL_FILE_MATCH : IncludeReasonType.NO_FILE_MATCH;
      } else if (config.monorepo.matches.indexOf('**') !== -1 || config.monorepo.matches.indexOf('**/*') !== -1) {
        reasonType = IncludeReasonType.ALL_FILE_MATCH;
      }

      config.decide(true, new Reason(reasonType, config.changes));
    }
  });
}

/**
 * If a config has excluded the current branch from the allowed branches (either by specifying an explicit allow list
 * that this branch isn't in, or listing this branch in the blocked list), then it is excluded, and its excluded_steps
 * are merge in instead
 */
function updateDecisionsForBranchList(configs: Config[]): void {
  configs.forEach((config) => {
    if (!config.includedInBranchList(getBuildkiteInfo().branch)) {
      config.decide(false, new Reason(ExcludeReasonType.BRANCH));
    }
  });
}

/**
 * Provides for manually supplied overrides to the inclusion decisions:
 *  - An env var named PIPELINE_RUN_ALL, set to any value, indicates that all steps should run
 *  - An env var named PIPELINE_RUN_ONLY, with value of a single pipeline name, indicates only that step should run
 *  - An env var named PIPELINE_RUN_<NAME>, where NAME is the UPPER_SNAKE_CASE version of the component pipeline name,
 *    set to any value, indicates that step should run - and the opposite for PIPELINE_NO_RUN_<NAME>
 */
function updateDecisionsForEnvVars(configs: Config[]): void {
  configs.forEach((config) => {
    if (process.env.PIPELINE_RUN_ALL) {
      if (config.monorepo.matches === false) {
        config.decide(false, new Reason(ExcludeReasonType.PIPELINE_RUN_OPT_OUT));
      } else {
        config.decide(true, new Reason(IncludeReasonType.FORCED, ['PIPELINE_RUN_ALL']));
      }
    }

    if (process.env?.PIPELINE_RUN_ONLY) {
      const included = config.monorepo.name === process.env?.PIPELINE_RUN_ONLY;
      config.decide(
        included,
        new Reason(included ? IncludeReasonType.FORCED : ExcludeReasonType.FORCED, ['PIPELINE_RUN_ONLY'])
      );
    }

    const envVarName = config.envVarName();

    const overrideExcludeKey = `PIPELINE_NO_RUN_${envVarName}`;
    if (process.env[overrideExcludeKey]) {
      config.decide(false, new Reason(ExcludeReasonType.FORCED, [overrideExcludeKey]));
    }

    const overrideIncludeKey = `PIPELINE_RUN_${envVarName}`;
    if (process.env[overrideIncludeKey]) {
      config.decide(true, new Reason(IncludeReasonType.FORCED, [overrideIncludeKey]));
    }
  });
}

/**
 * If there is no previous build, we always include the step
 */
function updateDecisionsFoFallback(configs: Config[]): void {
  configs.forEach((config) => {
    if (!config.baseBuild) {
      if (config.monorepo.matches === false) {
        config.decide(false, new Reason(ExcludeReasonType.NO_PREVIOUS_SUCCESSFUL));
      } else {
        config.decide(true, new Reason(IncludeReasonType.NO_PREVIOUS_SUCCESSFUL));
      }
    }
  });
}

/**
 * Mutates the config objects to account for transitive dependencies between pipelines
 *
 * Expects the provided configs to be sorted in topological order already, and to have their initial decisions (e.g.
 * around matches) to be filled in first. The configs in the provided array are mutated by reference.
 */
function updateDecisionsForDependsOn(configs: Config[]): void {
  const byName = Object.fromEntries(configs.map((c) => [c.monorepo.name, c]));

  configs
    .flatMap((config) => config.monorepo.depends_on.map((dependency) => [config.monorepo.name, dependency]))
    .reverse()
    .forEach(([from, to]) => {
      const dependent = byName[from];
      const dependency = byName[to];

      if (dependent.included && !dependency.included) {
        dependency.included = true;
        dependency.reason = new Reason(IncludeReasonType.DEPENDS_ON, [from]);
      }
    });
}

/**
 * Mutates the config objects to account for pure caching
 */
async function updateDecisionsForPureCache(configs: Config[]): Promise<void> {
  const cacheConfigs = configs.filter((c) => c.monorepo.pure && c.included);

  if (cacheConfigs.length === 0) {
    return;
  }

  const hasher = new FileHasher();
  const repository = new CacheMetadataRepository(service);

  const keys = await Promise.all(
    cacheConfigs.map(
      async (config): Promise<CacheMetadataKey> => ({
        contentHash: await config.getContentHash(hasher),
        component: config.getComponent(),
      })
    )
  );

  const foundMetdataByComponent = Object.fromEntries(
    (await repository.getAll(keys)).map((metadata) => [
      metadata.component,
      { buildId: metadata.buildId, commit: metadata.commit },
    ])
  );

  cacheConfigs.forEach((config) => {
    const metadata = foundMetdataByComponent[config.getComponent()];

    if (!metadata?.buildId) {
      config.reason.pureCacheHit = false;
      return;
    }

    // Apply the cache hit: skip this build, and update the base build ID
    config.baseBuild = { id: metadata.buildId, commit: metadata.commit };
    config.included = false;

    config.reason = new Reason(ExcludeReasonType.BUILT_PREVIOUSLY, [metadata.buildId]);
    config.reason.pureCacheHit = true;
  });
}

export async function updateDecisions(configs: Config[]): Promise<void> {
  updateDecisionsForChanges(configs);
  updateDecisionsForDependsOn(configs);
  await updateDecisionsForPureCache(configs);
  updateDecisionsForBranchList(configs);
  updateDecisionsForEnvVars(configs);
  updateDecisionsFoFallback(configs);
}
