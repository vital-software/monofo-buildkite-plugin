import { Config } from './config';
import { getBuildkiteInfo, getLastSuccessfulBuildCommit } from './buildkite';
import { mergeBase } from './git';
import minimatch from 'minimatch';
import debug from 'debug';

const log = debug('monofo:diff');

export interface ConfigWithChanges extends Config {
  changes: string[];
}

export function getBaseCommit(): Promise<string> {
  const bk = getBuildkiteInfo(process.env);

  if (bk.branch === bk.defaultBranch) {
    // We are on the main branch, and should look for the previous successful build of it
    return getLastSuccessfulBuildCommit(bk).catch((e) => {
      log(`Failed to find base commit for ${bk.branch} via Buildkite API, falling back to previous commit`, e);
      return 'HEAD~1';
    });
  } else {
    // We are on a feature branch, and should just diff against the merge-base of the current commit and the main branch
    return mergeBase(`origin/${bk.defaultBranch}`, bk.commit);
  }
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

export function matchConfigs(configs: Config[], changedFiles: string[]): ConfigWithChanges[] {
  return configs.map((config) => {
    return Object.assign({}, config, { changes: matchingChanges(config.monorepo.matches, changedFiles) });
  });
}
