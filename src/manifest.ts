import { promises as fs, PathLike } from 'fs';
import path from 'path';
import debug from 'debug';
import _ from 'lodash';
import tempy from 'tempy';
import { globSet } from './util/glob';
import { count, exists } from './util/helper';

const log = debug('monofo:manifest');

/**
 * A manifest is a simple struct for holding tar input items by path
 */
export interface Manifest {
  [pathToPack: string]: { recurse: boolean };
}

function isRoot(pth: string): boolean {
  return pth === '' || pth === '/' || pth === '.';
}

function recursionOpt(mode: boolean) {
  return mode ? '--recursion' : '--no-recursion';
}

function sequentialGroupsByRecursion(manifest: Manifest): { recurse: boolean; paths: string[] }[] {
  const sorted = Object.entries(manifest).sort(([p1], [p2]) => p1.localeCompare(p2));

  const groups: { recurse: boolean; paths: string[] }[] = [];
  let group: { recurse: boolean; paths: string[] } = { paths: [], recurse: sorted?.[0]?.[1]?.recurse || false };

  for (const [pathToPack, { recurse }] of sorted) {
    if (group.recurse !== recurse) {
      groups.push({ ...group });
      group = { paths: [], recurse };
    }

    group.paths.push(pathToPack);
  }

  return groups;
}

/**
 * Flattens the given paths to a single file list that can be loaded by GNU tar
 *
 * The file list uses recursive file list loading (--files-from can be used inside the --files-from), and the
 * --no-recursion option to provide support for intermediate directories while retaining support for complex file names
 * (such as ones beginning with `-` or containing newlines)
 *
 * @return string A set of tar options, that can be put into a file list or passed as an argv for further processing
 */
export async function tarArgListForManifest(manifest: Manifest): Promise<string[]> {
  const groups: { recurse: boolean; paths: string[] }[] = sequentialGroupsByRecursion(manifest).filter(
    ({ paths }) => paths.length > 0
  );

  if (!groups.length) {
    return [];
  }

  return [
    '--null',
    ...(
      await Promise.all(
        groups.map<Promise<string[]>>(async ({ paths, recurse }): Promise<string[]> => {
          const newFileList = tempy.file({ extension: '.null.list' });
          await fs.writeFile(newFileList, `${paths.join('\x00')}\x00`);
          return [recursionOpt(recurse), `--files-from=${newFileList}`];
        })
      )
    ).flat(),
  ];
}

export function addIntermediateDirectories(manifest: Manifest): Manifest {
  const repacked: Manifest = {};

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

  for (const [p, { recurse }] of Object.entries(manifest)) {
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
export async function getManifest({
  filesFrom,
  globs,
  useNull = false,
}: {
  filesFrom?: string;
  globs?: string[];
  useNull?: boolean;
}): Promise<Manifest> {
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
    throw new Error('Expected to be given only relative paths, relative to CWD');
  }

  log(`Globs and file input matched ${count(Object.keys(paths), 'path')}`);
  return addIntermediateDirectories(paths);
}
