import { CommandModule } from 'yargs';
import { BaseArgs } from './handler';

export const plurals = (n: number): string => (n === 1 ? '' : 's');
export const count = (arr: Array<unknown>, name: string): string => `${arr.length} ${name}${plurals(arr.length)}`;

export type Command<T extends BaseArgs = BaseArgs> = CommandModule<T, T>;

export function mapAsync<I, O>(
  array: I[],
  callback: (value: I, index: number, array: I[]) => Promise<O>
): Promise<O[]> {
  return Promise.all(array.map(callback));
}

export async function filterAsync<T>(
  array: T[],
  callback: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await mapAsync(array, callback);
  return array.filter((_, index) => filterMap[index]);
}
