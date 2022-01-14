import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';

export const plurals = (n: number): string => (n === 1 ? '' : 's');
export const count = (arr: Array<unknown>, name: string): string => `${arr.length} ${name}${plurals(arr.length)}`;

/**
 * YAML helper for always returning an array of strings
 */
export function strings(v: undefined | string[] | string): string[] {
  if (!v || v.length <= 0) {
    return [];
  }

  if (_.isArray(v)) {
    return v;
  }

  return [String(v)];
}

/**
 * number of ch occurances in str without .split() (less allocations)
 */
export function charCount(haystack: string, needleChar: string): number {
  return _.sumBy(haystack, (x: string) => (x === needleChar ? 1 : 0));
}

export function depthSort(paths: string[]): string[] {
  return _.uniq(paths)
    .sort()
    .sort((p1, p2) => p1.split(path.sep).length - p2.split(path.sep).length);
}

export async function exists(file: string): Promise<boolean> {
  try {
    await fs.stat(file);
    return true;
  } catch (err) {
    return false;
  }
}
