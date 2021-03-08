/* eslint-disable no-param-reassign */

import { CacheMetadataKey, CacheMetadataRepository } from './cache-metadata';
import Config, { MatchResult } from './config';
import { service } from './dynamodb';
import { FileHasher } from './hash';
import { count } from './util';

function prettyPrintChangeResult(changes: MatchResult): string {
  return changes.matchesAll ? 'all files match' : changes.files.join(', ');
}

/**
 * If a config has changes, its steps are merged into the final build. Otherwise, it is excluded, and its excluded_steps
 * are merged in instead.
 */
function updateDecisionsForChanges(configs: Config[]): void {
  configs.forEach((config) => {
    if (config.changes.files.length > 0) {
      config.decide(
        true,
        `${count(config.changes.files, 'matching change')}: ${prettyPrintChangeResult(config.changes)}`
      );
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
      config.decide(true, 'been forced to by PIPELINE_RUN_ALL');
    }

    if (process.env?.PIPELINE_RUN_ONLY) {
      config.decide(config.monorepo.name === process.env?.PIPELINE_RUN_ONLY, 'PIPELINE_RUN_ONLY specified');
    }

    const envVarName = config.monorepo.name.toLocaleUpperCase().replace(/-/g, '_');

    const overrideExcludeKey = `PIPELINE_NO_RUN_${envVarName}`;
    if (process.env[overrideExcludeKey]) {
      config.decide(false, `been forced NOT to by ${overrideExcludeKey}`);
    }

    const overrideIncludeKey = `PIPELINE_RUN_${envVarName}`;
    if (process.env[overrideIncludeKey]) {
      config.decide(true, `been forced to by ${overrideIncludeKey}`);
    }
  });
}

/**
 * If there is no previous build, we always include the step
 */
function updateDecisionsFoFallback(configs: Config[]): void {
  configs.forEach((config) => {
    if (!config.buildId) {
      config.decide(true, 'no previous successful build, fallback to being included');
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
        dependency.reason = `been pulled in by a depends_on from ${from}`;
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
    (await repository.getAll(keys)).map((metadata) => [metadata.component, metadata.buildId])
  );

  cacheConfigs.forEach((config) => {
    const buildId = foundMetdataByComponent[config.getComponent()];

    if (!buildId) {
      config.reason += ` (pure cache missed)`;
      return;
    }

    // Apply the cache hit: skip this build, and update the base build ID
    config.buildId = buildId;
    config.included = false;
    config.reason = `already been built previously, in build ${buildId} (pure cache hit)`;
  });
}

export async function updateDecisions(configs: Config[]): Promise<void> {
  updateDecisionsForChanges(configs);
  updateDecisionsForDependsOn(configs);
  await updateDecisionsForPureCache(configs);
  updateDecisionsForEnvVars(configs);
  updateDecisionsFoFallback(configs);
}
