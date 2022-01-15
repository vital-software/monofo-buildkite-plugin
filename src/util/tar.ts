import { compare } from 'compare-versions';
import debug from 'debug';
import execa from 'execa';
import { exec, hasBin } from './exec';

const log = debug('monofo:util:tar');

export interface TarConfiguration {
  bin: string;

  argsFor: {
    create: string[];
  };
}

let discoveredConfiguration: TarConfiguration | undefined;

async function discoverBin(): Promise<string> {
  if (process.env.MONOFO_TAR_BIN) {
    return process.env.MONOFO_TAR_BIN;
  }

  const toCheck = process.platform === 'darwin' ? ['gtar', 'tar'] : ['tar'];

  for (const possibleBin of toCheck) {
    // eslint-disable-next-line no-await-in-loop
    if (await hasBin(possibleBin)) {
      return possibleBin;
    }
  }

  throw new Error('No tar found on PATH');
}

async function isGnuTar(bin: string): Promise<boolean> {
  const { stdout } = await execa(bin, ['--help']);
  return stdout.slice(stdout.indexOf('\n') + 1).startsWith('GNU');
}

function getGnuTarVersion(versionOutput: string): string {
  const matches = versionOutput.match(/^tar \(GNU tar\) ([0-9.-]+)\n/);

  if (matches && matches[1]) {
    return matches[1];
  }

  throw new Error('Could not get GNU tar version');
}

export async function tar(verbose = false): Promise<TarConfiguration> {
  if (!discoveredConfiguration) {
    const bin = await discoverBin();
    let create: string[] = [];

    if (!(await isGnuTar(bin))) {
      log(`Using ${bin}: this does not seem to be GNU tar: it may fail to extract artifacts correctly`);
    } else {
      const versionOutput = (await exec(bin, ['--version'])).stdout;
      const version = getGnuTarVersion(versionOutput);

      log(`Using ${bin} : ${version}`);

      if (verbose) {
        log(versionOutput);
      }

      if (compare(version, '1.28', '>=')) {
        create = [...create, '--sort=name']; // --sort was added in 1.28
      }
    }

    discoveredConfiguration = {
      bin,
      argsFor: {
        create,
      },
    };
  }

  return discoveredConfiguration;
}
