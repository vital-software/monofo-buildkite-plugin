import minimatch from 'minimatch';
import debug from 'debug';
import { getLastSuccessfulBuild, lookBackwardForSuccessfulBuild } from './buildkite';
import { mergeBase, revParse } from './git';
import { getBuildkiteInfo } from './config';

const log = debug('monofo:diff');

/**
 * If we are on the main branch, we look for the previous successful build of it
 */
function getBaseBuildForDefaultBranch(bk: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return getLastSuccessfulBuild(bk).catch((e) => {
    log(
      `Failed to find successful build for default branch (${bk.branch}) via Buildkite API, will use fallback mode`,
      e
    );
    throw e;
  });
}

/**
 * If we are on a feature branch, we just diff against the merge-base of the current commit and the main branch
 */
function getBaseBuildForFeatureBranch(bk: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return mergeBase(`origin/${bk.defaultBranch}`, bk.commit).then((commit) =>
    lookBackwardForSuccessfulBuild(bk, commit).catch((e) => {
      log(
        `Failed to find successful build for merge base (${commit}) of feature branch (${bk.branch}) via Buildkite API, will use fallback mode`,
        e
      );
      throw e;
    })
  );
}

/**
 * The base commit is the commit used to compare a build with
 *
 * When resolved, will always be a commit on the main branch. It will also be a commit with a succeessful build (so we
 * can snarf artifacts)
 */
export async function getBaseBuild(bk: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return bk.branch === bk.defaultBranch ? getBaseBuildForDefaultBranch(bk) : getBaseBuildForFeatureBranch(bk);
}

/**
 * Returns whether any of the changed files match any of the given patterns
 */
function matchingChanges(matchList: string[], changedFiles: string[]): string[] {
  if (!matchList || matchList.length < 1 || !changedFiles || changedFiles.length < 1) {
    return [];
  }

  return matchList.flatMap((pattern) =>
    minimatch.match(changedFiles, pattern, {
      matchBase: true,
      dot: true,
    })
  );
}

export function matchConfigs(buildId: string, configs: Config[], changedFiles: string[]): DecoratedConfig[] {
  return configs.map((config) => {
    return { ...config, buildId, changes: matchingChanges(config.monorepo.matches, changedFiles) };
  });
}
