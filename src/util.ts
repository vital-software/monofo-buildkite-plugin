import stream from 'stream';
import { promisify } from 'util';
import commandExists from 'command-exists';
import debug from 'debug';
import { ExecaChildProcess } from 'execa';
import globAsync, { IOptions } from 'glob';

const log = debug('monofo:util');

const globPromise = promisify(globAsync);

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

// Glob caching
const symlinks = {};
const statCache = {};
const realpathCache = {};
const cache = {};

export function glob(pattern: string, opts: IOptions = {}): Promise<string[]> {
  return globPromise(pattern, {
    matchBase: true,
    dot: true,
    cache,
    symlinks,
    statCache,
    realpathCache,
    ...opts,
  });
}

export function globSet(patterns: string[], opts: IOptions = {}): Promise<string[]> {
  return Promise.all(patterns.map(async (pattern) => glob(pattern, opts))).then((r) => {
    const flat = [...new Set(r.flat())];
    log(`Found ${count(flat, 'matching file')}`);
    return flat;
  });
}
