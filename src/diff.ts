import minimatch from 'minimatch';
import debug from 'debug';
import _ from 'lodash';
import { mergeBase } from './git';
import BuildkiteClient from './buildkite/client';

const log = debug('monofo:diff');

async function getSuitableDefaultBranchBuildsAtOrBeforeCommit(
  info: BuildkiteEnvironment,
  commit: string
): Promise<BuildkiteBuild> {
  const client = new BuildkiteClient(info);

  const b = await client.getBuilds({ branch: info.defaultBranch, state: 'passed', per_page: 100 });

  return client
    .getBuilds({ state: 'passed', branch: info.defaultBranch })
    .then((builds) => {
      if (!_.isArray(builds) || builds.length < 1) {
        throw new Error('Could not find any matching successful builds');
      } else {
        const [build] = builds;
        log(`Found successful build for ${info.branch}: ${build.web_url} @ ${build.commit}`);
        return build;
      }
    })
    .catch((e) => {
      log(
        `Failed to find successful build for default branch (${info.branch}) via Buildkite API, will use fallback mode`,
        e
      );
      throw e;
    });
}

/**
 * If we are on the main branch, we look for the previous successful build of it
 */
async function getBaseBuildForDefaultBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  const client = new BuildkiteClient(info);

  return getSuitableDefaultBranchBuildsAtOrBeforeCommit(info, info.commit).catch((e) => {
    log(
      `Failed to find successful build for default branch (${info.branch}) via Buildkite API, will use fallback mode`,
      e
    );
    throw e;
  });
}

/**
 * If we are on a feature branch, we just diff against the merge-base of the current commit and the main branch, and then find a successful build at or before
 * that commit.
 */
function getBaseBuildForFeatureBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return mergeBase(`origin/${info.defaultBranch}`, info.commit).then((commit) =>
    getSuitableDefaultBranchBuildsAtOrBeforeCommit(info, commit).catch((e) => {
      log(
        `Failed to find successful build for merge base (${commit}) of feature branch (${info.branch}) via Buildkite API, will use fallback mode`,
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
export async function getBaseBuild(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return info.branch === info.defaultBranch ? getBaseBuildForDefaultBranch(info) : getBaseBuildForFeatureBranch(info);
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
