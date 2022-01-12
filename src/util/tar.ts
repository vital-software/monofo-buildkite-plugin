import path from 'path';
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

let cachedTar: string | undefined;

export async function tar(): Promise<string> {
  if (!cachedTar) {
    cachedTar = await tarBin();

    if (!(await isGnuTar(cachedTar))) {
      process.stderr.write(
        `WARNING: tar on PATH does not seem to be GNU tar: it may fail to extract artifacts correctly${
          process.platform === 'darwin' ? ' (named gtar, try "brew install gtar")' : ''
        }\n`
      );
    }

    const version = await exec(cachedTar, ['--version']);
    log(`Using ${cachedTar}: ${version.stdout}`);
  }

  return cachedTar;
}

export function depthSort(paths: string[]): string[] {
  return _.uniq(paths)
    .sort()
    .sort((p1, p2) => p1.split(path.sep).length - p2.split(path.sep).length);
}
