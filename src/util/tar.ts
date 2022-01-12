import path from 'path';
import { compare } from 'compare-versions';
import debug from 'debug';
import execa from 'execa';
import _ from 'lodash';
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
