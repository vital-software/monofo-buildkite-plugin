import path from 'path';
import { compare } from 'compare-versions';
import debug from 'debug';
import execa from 'execa';
import _ from 'lodash';
import { pack } from 'tar-fs';
import { PathsToPack } from '../artifacts/matcher';
import { exec, hasBin } from './exec';

const log = debug('monofo:util:tar');

async function tarBin(): Promise<string> {
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

async function isGnuTar(bin: string): Promise<boolean> {
  const { stdout } = await execa(bin, ['--help']);
  return stdout.slice(stdout.indexOf('\n') + 1).startsWith('GNU');
}

let cachedTarResult: { bin: string; createArgs: string[] } | undefined;

export async function tar(): Promise<{ bin: string; createArgs: string[] }> {
  if (!cachedTarResult) {
    const bin = await tarBin();
    let createArgs: string[] = [];

    if (!(await isGnuTar(bin))) {
      process.stderr.write(
        `WARNING: tar on PATH does not seem to be GNU tar: it may fail to extract artifacts correctly${
          process.platform === 'darwin' ? ' (named gtar, try "brew install gtar")' : ''
        }\n`
      );
    } else {
      const output = (await exec(bin, ['--version'])).stdout;
      log(`Using ${bin}: ${output}`);

      const matches = output.match(/^tar \(GNU tar\) ([0-9.-]+)\n/);

      if (matches && compare(matches[1], '1.28', '>=')) {
        createArgs = [...createArgs, '--sort=name']; // --sort was added in 1.28
      }

      createArgs = ['--verbose', ...createArgs];
    }

    cachedTarResult = {
      bin,
      createArgs,
    };
  }

  return cachedTarResult;
}

export function depthSort(paths: string[]): string[] {
  return _.uniq(paths)
    .sort()
    .sort((p1, p2) => p1.split(path.sep).length - p2.split(path.sep).length);
}

/**
 * number of ch occurances in str without .split() (less allocations)
 */
const charCount = (haystack: string, needleChar: string) =>
  _.sumBy(haystack, (x: string) => (x === needleChar ? 1 : 0));

export function produceTarStream(paths: PathsToPack) {
  const prefixMatch: string[] = Object.entries(paths)
    .filter(([, { recurse }]) => recurse)
    .map(([pathKey]) => {
      const toPackPath = pathKey.startsWith('./') ? pathKey.slice(2) : pathKey; // without initial ./ prefix for matching purposes
      const depth = charCount(pathKey, path.sep);
      return { toPackPath, depth };
    })
    .sort()
    .sort((a, b): number => a.depth - b.depth)
    .map(({ toPackPath }) => toPackPath);

  // These are sorted so that lower depths occur first in the array
  // This is convenient for monorepo setups, where more common dependencies are usually lower in the tree

  const exactMatch: Record<string, boolean> = Object.fromEntries(
    Object.entries(paths)
      .filter(([, { recurse }]) => !recurse)
      .map(([k]) => [k.startsWith('./') ? k.slice(2) : k, true])
  );

  return pack('.', {
    ignore: (name: string): boolean => {
      return !(name in exactMatch || prefixMatch.find((prefix) => name.startsWith(prefix)));
    },
  });
}
