import { Config } from './config';

export type DiffResult = string[];

export interface DiffMatchResult {
  hasChanges: { [name: string]: boolean };
}

export function getDiffBase(): Promise<string> {
  return Promise.resolve('HEAD~1');
}

/**
 * Gets a list of modified files in the current build
 */
export async function getDiff(): Promise<DiffResult> {
  return Promise.resolve([]);
}

export function getMatchingDiffResults(configs: Config[], diff: DiffResult): Promise<DiffMatchResult> {
  // TODO: needs to know
  const hasDiff = (matches: string[]): boolean => {
    return false;
  };

  const entries: [string, boolean][] = configs.map((config) => {
    return [config.name, hasDiff(config.monorepo.matches)];
  });

  return Promise.resolve({ hasChanges: Object.fromEntries(entries) });
}
