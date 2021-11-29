import { promisify } from 'util';
import globAsync from 'glob';

export const plurals = (n: number): string => (n === 1 ? '' : 's');
export const count = (arr: Array<unknown>, name: string): string => `${arr.length} ${name}${plurals(arr.length)}`;

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

export const glob = promisify(globAsync);

export function hasBin(bin: string): Promise<boolean> {
  return commandExists(bin)
    .then(() => true)
    .catch(() => false);
}

export function toStream(child: ExecaChildProcess): stream.Writable {
  if (!child.stdin) {
    throw new Error('Could not access stdin on child process');
  }

  return child.stdin;
}

export async function tar(): Promise<string> {
  if (process.platform === 'darwin') {
    if (await hasBin('gtar')) {
      return 'gtar';
    }

    process.stderr.write(
      'WARNING: may fail to extract correctly: if so, need a GNU compatible tar, named gtar, on PATH\n'
    );
  }

  return 'tar';
}
