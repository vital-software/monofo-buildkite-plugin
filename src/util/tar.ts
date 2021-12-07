import execa from 'execa';
import { hasBin } from './exec';

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
  return (await execa(bin, ['--help'])).stderr.startsWith('GNU');
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
  }

  return cachedTar;
}
