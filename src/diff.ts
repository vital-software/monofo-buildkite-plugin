import debug from 'debug';
import _ from 'lodash';
import BuildkiteClient from './buildkite/client';
import { BuildkiteBuild, BuildkiteEnvironment } from './buildkite/types';
import Config from './config';
import { commitExists, mergeBase, revList } from './git';
import { count, filterAsync } from './util';

const log = debug('monofo:diff');

/**
 * Finds the most recent build of the given branch where:
 *
 *   1. There is an associated Buildkite build that is successful, fully applied, and not blocked, for the base build's
 *       commit
 *   2. The commit was an ancestor of the integration branch (i.e. the commit was at or before the currently building
 *       commit on the branch)
 *
 * This is the more conservative algorithm compared to getMostRecentBranchBuild below
 */
async function getSuitableBranchBuildAtOrBeforeCommit(
  info: BuildkiteEnvironment,
  commit: string,
  branch: string
): Promise<BuildkiteBuild> {
  const client = new BuildkiteClient(info);

  const builds: Promise<BuildkiteBuild[]> = client.getBuilds({
    'branch[]': [branch],
    state: 'passed',
    per_page: 50,
  });

  const gitFirstParentCommits: Promise<string[]> = revList('--first-parent', '-n', '100', commit);
  const gitAnyParentCommits: Promise<string[]> = revList('-n', `500`, commit);
  const buildkiteCommits: Promise<string[]> = builds.then((all) =>
    all.filter((build) => !build.blocked).map((build) => build.commit)
  );

  return Promise.all([gitFirstParentCommits, gitAnyParentCommits, buildkiteCommits]).then(
    ([firstParentCommitList, anyParentCommitList, buildkiteCommitList]) => {
      // Ordering really matters here:
      //  - First all the commits in order
      //  - Then just the first-parent ones in case that list reveals commits on the other side of a large merge
      //  - And the union of the two is then used for ordering, not the order builds happened on Buildkite, so we're
      //    following the git topology more closely
      const intersection = _.intersection<string>(
        _.union(anyParentCommitList, firstParentCommitList),
        buildkiteCommitList
      );

      if (intersection.length < 1) {
        throw new Error('Could not find any matching successful builds');
      }

      log(`Found ${intersection[0]} as latest successful build of default branch from ${commit} or earlier`);
      return builds.then((b: BuildkiteBuild[]) => {
        const build = _.find(b, (v: BuildkiteBuild) => v.commit === intersection[0]);

        if (!build) {
          return Promise.reject(new Error(`Cannot find build ${intersection[0]}`));
        }

        return Promise.resolve(build);
      });
    }
  );
}

/**
 * Finds the most recent build of the given branch where:
 *
 *   1. There is an associated Buildkite build that is successful, fully applied, and not blocked, for the base build's
 *       commit
 *
 * That's the only guarantee. The commit of that build might be quite topologically distant. It will exist though (we
 * check with git cat-file -e COMMIT^{commit})
 */
async function getMostRecentBranchBuild(
  info: BuildkiteEnvironment,
  branch: string
): Promise<BuildkiteBuild | undefined> {
  log(`Finding most recent build of ${branch} where the commit still exists`);
  const client = new BuildkiteClient(info);

  const builds: BuildkiteBuild[] = await client.getBuilds({
    'branch[]': [branch],
    state: 'passed',
    per_page: 20,
  });

  const successful = builds.filter((build) => !build.blocked);
  log(`Found ${successful.length} successful branches`);

  const withExistingCommits = await filterAsync(successful, async (build) => commitExists(build.commit));
  log(`Found ${withExistingCommits.length} branches with existing commits`);

  return withExistingCommits.pop();
}

/**
 * If we are on the default (i.e. main) branch, we look for the previous successful build of it that matches in git
 *
 * This is a two-pronged lookup, where we look for the intersection of successful default branch builds and commits on
 * the default branch in git, and pick the most topologically recent.
 */
async function getBaseBuildForDefaultBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  log(`Getting base build for default branch`);
  return getSuitableBranchBuildAtOrBeforeCommit(info, info.commit, info.defaultBranch).catch((e) => {
    log(`Failed to find successful build for default branch (${info.branch}) via Buildkite API`, e);
    throw e;
  });
}

/**
 * If we are on an integration branch, we look for the previous successful build of it
 *
 * This is a more risky single-pronged lookup, where we just take Buildkite's word for what the current state of the
 * environment is, even if the most recently applied commit is topologically distant (because e.g. someone reset back in
 * time, or to a completely different branch of development).
 *
 * So, we look for the most recent successful build of the integration branch, grab its commit, and validate it still
 * exists on the remote. If this process fails, we fall back to getBaseBuildForDefaultBranch
 */
async function getBaseBuildForIntegrationBranch(
  info: BuildkiteEnvironment,
  integrationBranch: string
): Promise<BuildkiteBuild> {
  log(`Getting base build for integration branch`);
  return getMostRecentBranchBuild(info, integrationBranch)
    .then((result) => result || getBaseBuildForDefaultBranch(info))
    .catch((e) => {
      log(`Failed to find successful build for integration branch (${info.branch}) via Buildkite API`, e);
      throw e;
    });
}

/**
 * If we are on a feature branch, we look for the previous successful build of the default branch on or before the merge-base of the feature branch
 *
 * This is a two-pronged lookup, where we look for the intersection of successful default branch builds and commits on
 * the default branch in git, and pick the most topologically recent.
 */
async function getBaseBuildForFeatureBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  log(`Getting base build for feature branch`);
  return mergeBase(`origin/${info.defaultBranch}`, info.commit, info.defaultBranch).then((commit) => {
    log(`Found merge base of ${commit} for current feature branch`);
    return getSuitableBranchBuildAtOrBeforeCommit(info, commit, info.defaultBranch).catch((e) => {
      log(
        `Failed to find successful build for merge base (${commit}) of feature branch (${info.branch}) via Buildkite API, will use fallback mode. Try bringing your branch up-to-date with ${info.defaultBranch}, if it isn't already?`,
        e
      );
      throw e;
    });
  });
}

/**
 * The base commit is the commit used to compare a build with
 *
 * When resolved, will always be a commit on the main branch. It will also be a commit with a successful build (so we
 * can snarf artifacts)
 */
export async function getBaseBuild(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  if (info.branch === info.integrationBranch) {
    const build = await getBaseBuildForIntegrationBranch(info, info.integrationBranch);
    log(`Found base build for integration branch: ${build.commit}`);
    return build;
  }

  if (info.branch === info.defaultBranch) {
    const build = await getBaseBuildForDefaultBranch(info);
    log(`Found base build for default branch: ${build.commit}`);
    return build;
  }

  const build = await getBaseBuildForFeatureBranch(info);
  log(`Found base build for feature branch: ${build.commit}`);
  return build;
}

export function matchConfigs(build: BuildkiteBuild, configs: Config[], changedFiles: string[]): void {
  log(`Found ${count(changedFiles, 'changed file')}: ${changedFiles.join(', ')}`);

  configs.forEach((config) => {
    config.setBaseBuild(build);
    config.updateMatchingChanges(changedFiles);

    if (config.changes.length > 1) {
      log(`Found ${count(config.changes, 'matching change')} for ${config.monorepo.name}`);
    }
  });
}
