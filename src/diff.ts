import minimatch from 'minimatch';
import debug from 'debug';
import _ from 'lodash';
import { mergeBase, revList } from './git';
import BuildkiteClient from './buildkite/client';
import { count } from './util';

const log = debug('monofo:diff');

/**
 * Finds the most recent build where:
 *  - The commit was an ancestor of the default branch (i.e. a merge commit, or something that landed on main directly)
 *  - There's an associated buildkite build that was successful
 *  - The commit was at or before the given commit
 */
async function getSuitableDefaultBranchBuildAtOrBeforeCommit(
  info: BuildkiteEnvironment,
  commit: string
): Promise<BuildkiteBuild> {
  const client = new BuildkiteClient(info);

  const builds: Promise<BuildkiteBuild[]> = client.getBuilds({
    branch: info.defaultBranch,
    state: 'passed',
    per_page: 100,
  });

  const gitCommits: Promise<string[]> = revList('--first-parent', '-n', '100', commit);
  const buildkiteCommits: Promise<string[]> = builds.then((all) => all.map((build) => build.commit));

  return Promise.all([gitCommits, buildkiteCommits])
    .then((commitLists) => _.intersection<string>(...commitLists))
    .then((intersection: string[]) => {
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
    });
}

/**
 * If we are on the main branch, we look for the previous successful build of it
 */
async function getBaseBuildForDefaultBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return getSuitableDefaultBranchBuildAtOrBeforeCommit(info, info.commit).catch((e) => {
    log(`Failed to find successful build for default branch (${info.branch}) via Buildkite API`, e);
    throw e;
  });
}

/**
 * If we are on a feature branch, we just diff against the merge-base of the current commit and the main branch, and then find a successful build at or before
 * that commit.
 */
async function getBaseBuildForFeatureBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return mergeBase(`origin/${info.defaultBranch}`, info.commit).then((commit) =>
    getSuitableDefaultBranchBuildAtOrBeforeCommit(info, commit).catch((e) => {
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

export function matchConfigs(buildId: string, configs: Config[], changedFiles: string[]): ConfigWithChanges[] {
  log(`Found ${count(changedFiles, 'changed file')}: ${changedFiles.join(', ')}`);

  return configs.map((config) => {
    const changes = matchingChanges(config.monorepo.matches, changedFiles);
    log(`Found ${count(changes, 'matching change')} for ${config.name} (${JSON.stringify(config.monorepo.matches)})`);
    return { ...config, buildId, changes };
  });
}
