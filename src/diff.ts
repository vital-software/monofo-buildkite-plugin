import { Config } from './config';
import { getBuildkiteInfo, getLastSuccessfulBuildCommit } from './buildkite';
import { mergeBase } from './git';
import debug from 'debug';

const log = debug('monofo:diff');

export type DiffResult = string[];

export interface DiffMatchResult {
  hasChanges: { [name: string]: boolean };
}

export function getBaseCommit(): Promise<string> {
  const bk = getBuildkiteInfo();

  if (bk.branch === bk.defaultBranch) {
    // We are on the main branch, and should look for the previous successful build of it
    return getLastSuccessfulBuildCommit(bk.branch).catch((e) => {
      log(`Failed to find base commit for ${bk.branch} via Buildkite API, falling back to previous commit`, e);
      return 'HEAD~1';
    });
  } else {
    // We are on a feature branch, and should just diff against the merge-base of the current commit and the main branch
    return mergeBase(`origin/${bk.defaultBranch}`, bk.commit);
  }
}

export function matchConfigs(configs: Config[], diff: DiffResult): Promise<DiffMatchResult> {
  // TODO: needs to know
  const hasDiff = (matches: string[]): boolean => {
    return false;
  };

  const entries: [string, boolean][] = configs.map((config) => {
    return [config.name, hasDiff(config.monorepo.matches)];
  });

  return Promise.resolve({ hasChanges: Object.fromEntries(entries) });
}
