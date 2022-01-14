import { promises as fs, PathLike } from 'fs';
import path from 'path';
import stream from 'stream';
import debug from 'debug';
import _ from 'lodash';
import { globSet } from '../util/glob';
import { count, depthSort, exists } from '../util/helper';

const log = debug('monofo:artifact:matcher');

/**
 * Utility class that can act as a writable stream of file name chunks, or receive globs
 */
class MatchedFiles extends stream.Writable {
  constructor(private _matched: string[] = []) {
    super({
      objectMode: true,
      write: (chunk: string, _encoding, next) => {
        this._matched.push(chunk);
        next();
      },
    });
  }

  async addGlobs(globs: string[]): Promise<void> {
    this._matched = [...this._matched, ...(await globSet(_.castArray(globs), { matchBase: false }))];
  }

  get matched() {
    return this._matched;
  }
}

export interface PathsToPack {
  [path: string]: { recurse: boolean };
}

function isRoot(p: string): boolean {
  return p === '' || p === '/' || p === '.';
}

export function flattenPaths(toPack: PathsToPack): { recursive: string[]; nonRecursive: string[] } {
  const recursive = depthSort(
    Object.entries(toPack)
      .filter(([, { recurse }]) => recurse)
      .map(([p]) => p)
  );

  const nonRecursive = depthSort(
    Object.entries(toPack)
      .filter(([, { recurse }]) => recurse)
      .map(([p]) => p)
  );

  return { recursive, nonRecursive };
}

export function addIntermediateDirectories(toPack: PathsToPack): PathsToPack {
  const repacked: PathsToPack = {};

  const addWithParents = (p: string, recurse: boolean): void => {
    if (isRoot(p)) {
      return;
    }

    const parent = path.dirname(p);

    if (!isRoot(parent) && !(parent in repacked)) {
      log(`Adding intermediate directory to included paths to upload: ${parent}`);
      addWithParents(parent, false);
    }

    repacked[p] = { recurse };
  };

  for (const [p, { recurse }] of Object.entries(toPack)) {
    addWithParents(p, recurse);
  }

  return repacked;
}

/**
 * The files will be passed to tar in the order shown, and then tar will
 * recurse into each entry if it's a directory (because --recursive is the
 * default) - it should use the --sort argument (if your tar is new enough)
 * to sort the eventual input file list, but they'll still be ordered according
 * to the order of this files argument
 *
 * This is problematic if the paths don't contain every intermediate directory
 *
 * To fix this, and make the eventual tar compatible with catar, we do the
 * recursion into files ourselves.
 */
export async function pathsToPack({
  filesFrom,
  globs,
  useNull = false,
}: {
  filesFrom?: string;
  globs?: string[];
  useNull?: boolean;
}): Promise<PathsToPack> {
  if (!filesFrom && !globs) {
    return {};
  }

  const paths: Record<string, { recurse: boolean }> = Object.fromEntries(
    (
      await globSet(
        _.castArray(globs).filter((v) => v),
        { matchBase: false }
      )
    ).map((p) => [`./${p}`, { recurse: false }])
  );

  if (filesFrom) {
    if (filesFrom !== '-' && !(await exists(filesFrom))) {
      throw new Error(`Could not find file to read file list from: ${filesFrom}`);
    }

    log(`Reading from ${filesFrom !== '-' ? filesFrom : 'stdin'}`);
    const source: string =
      filesFrom === '-'
        ? await fs.readFile(0 as unknown as PathLike, 'utf8') // 0 is process.stdin
        : await fs.readFile(filesFrom, { encoding: 'utf8' });

    for (const p of source.split(useNull ? '\x00' : '\n').filter((v) => v)) {
      paths[p] = { recurse: true };
    }
  }

  if (!Object.keys(paths).every((p) => p.startsWith('./'))) {
    throw new Error('Expected to be given only relative paths to recurse, relative to CWD');
  }

  log(`Globs and file input matched ${count(Object.keys(paths), 'path')}`);
  return addIntermediateDirectories(paths);
}
