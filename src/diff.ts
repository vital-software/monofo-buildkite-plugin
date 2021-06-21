import debug from 'debug';
import _ from 'lodash';
import BuildkiteClient from './buildkite/client';
import Config from './config';
import { mergeBase, revList } from './git';
import { count } from './util';

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
async function getSuitableIntegrationBranchBuildAtOrBeforeCommit(
  info: BuildkiteEnvironment,
  commit: string
): Promise<BuildkiteBuild> {
  const client = new BuildkiteClient(info);

  const builds: Promise<BuildkiteBuild[]> = client.getBuilds({
    branches: info.integrationBranch ? [info.integrationBranch, info.defaultBranch] : [info.defaultBranch],
    state: 'passed',
    per_page: 50,
  });

  const gitCommits: Promise<string[]> = revList('--first-parent', '-n', '100', commit);
  const buildkiteCommits: Promise<string[]> = builds.then((all) =>
    all.filter((build) => !build.blocked).map((build) => build.commit)
  );

  return Promise.all([gitCommits, buildkiteCommits]).then((commitLists: string[][]) => {
    const intersection = _.intersection<string>(...commitLists);

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
 * Finds the most recent build of the given branch where:
 *
 *   1. There is an associated Buildkite build that is successful, fully applied, and not blocked, for the base build's
 *       commit
 *
 * That's the only guarantee. The commit of that build might be quite topolgoically distant. It will exist though (we
 * check with rev-parse)
 */
async function getBaseBuildForIntegrationBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return getSuitableIntegrationBranchBuildAtOrBeforeCommit(info, info.commit).catch((e) => {
    log(`Failed to find successful build for integration branch (${info.branch}) via Buildkite API`, e);
    throw e;
  });
}

/**
 * If we are on a feature branch, we just diff against the merge-base of the current commit and the main branch, and then find a successful build at or before
 * that commit.
 */
async function getBaseBuildForFeatureBranch(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return mergeBase(`origin/${info.defaultBranch}`, info.commit).then((commit) => {
    log(`Found merge base of ${commit} for current feature branch`);
    return getSuitableIntegrationBranchBuildAtOrBeforeCommit(info, commit).catch((e) => {
      log(
        `Failed to find successful build for merge base (${commit}) of feature branch (${info.branch}) via Buildkite API, will use fallback mode. Try bringing your branch up-to-date with ${info.defaultBranch}, if it isn't already?`,
        e
      );
      throw e;
    });
  });
}

function isIntegrationBranch(info: BuildkiteEnvironment): boolean {
  return info.branch === info.defaultBranch || info.branch === info.integrationBranch;
}

/**
 * The base commit is the commit used to compare a build with
 *
 * When resolved, will always be a commit on the main branch. It will also be a commit with a successful build (so we
 * can snarf artifacts)
 */
export async function getBaseBuild(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return isIntegrationBranch(info) ? getBaseBuildForIntegrationBranch(info) : getBaseBuildForFeatureBranch(info);
}

export function matchConfigs(buildId: string, configs: Config[], changedFiles: string[]): void {
  log(`Found ${count(changedFiles, 'changed file')}: ${changedFiles.join(', ')}`);

  configs.forEach((config) => {
    config.setBuildId(buildId);
    config.updateMatchingChanges(changedFiles);

    if (config.changes.files.length > 1) {
      log(`Found ${count(config.changes.files, 'matching change')} for ${config.monorepo.name}`);
    }
  });
}
