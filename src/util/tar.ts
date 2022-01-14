import path from 'path';
import stream from 'stream';
import { compare } from 'compare-versions';
import debug from 'debug';
import execa from 'execa';
import _ from 'lodash';
import { pack } from 'tar-fs';
import { flattenPaths, PathsToPack, resolveRecursive } from '../artifacts/matcher';
import { exec, getReadableFromProcessStdout, hasBin } from './exec';
import { count, charCount } from './helper';

const log = debug('monofo:util:tar');

async function tarBin(): Promise<string> {
  if (process.env?.MONOFO_TAR_BIN) {
    return process.env.MONOFO_TAR_BIN;
  }

  if (process.platform === 'darwin') {
    if (await hasBin('gtar')) {
      return 'gtar';
    }

    process.stderr.write(
      'WARNING: may fail to extract correctly: if so, need a GNU compatible tar on PATH, and set MONOFO_TAR_BIN\n'
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

async function produceTarStreamGnuExec(toPack: PathsToPack): Promise<stream.Readable> {
  const paths = flattenPaths(await resolveRecursive(toPack));

  log(`Passing ${count(paths, 'path').length}`);

  const { bin, createArgs } = await tar();
  const tarArgs = [
    'set',
    '-o',
    'pipefail',
    ';',
    bin,
    '-c',
    ...createArgs,
    '--hard-dereference',
    '--null',
    '--no-recursion',
    '--files-from',
    '-',
  ];

  const process = exec(bin, tarArgs, {
    input: `${paths.join('\x00')}\x00`,
    buffer: false,
  });

  return getReadableFromProcessStdout(process);
}

// noinspection JSUnusedLocalSymbols
function produceTarStreamNode(paths: PathsToPack): stream.Readable {
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

export function produceTarStream(paths: PathsToPack): Promise<stream.Readable> {
  return (process.env?.MONOFO_USE_TAR_CLI ?? 'true') === 'true'
    ? produceTarStreamGnuExec(paths)
    : Promise.resolve(produceTarStreamNode(paths));
}
