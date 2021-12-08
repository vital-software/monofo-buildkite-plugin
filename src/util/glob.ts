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
    // Perform a basename-only match if the pattern does not contain any slash characters.
    // That is, *.js would be treated as equivalent to **/*.js, matching all js files in all directories
    // This one is useful in some contexts, so we default to true, but not good in other contexts
    //   e.g. Good: matches on pipeline command, Bad: globs on upload command
    //   e.g. *.txt on upload will have to search through node_modules/ (ouch)
    matchBase: true,

    // Because negation doesn't work for `matches` anyway (we'd need to support `excludes` instead)
    nonegate: true,

    // Include .dot files in normal matches and globstar matches
    dot: true,

    // Rest of the options here are caching
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
    log(`Found ${count(flat, 'matching path')}`);
    return flat;
  });
}
