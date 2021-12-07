import { promisify } from 'util';
import debug from 'debug';
import globAsync, { IOptions } from 'glob';
import { count } from './helper';

const log = debug('monofo:util:glob');

const globPromise = promisify(globAsync);

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
