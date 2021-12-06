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
