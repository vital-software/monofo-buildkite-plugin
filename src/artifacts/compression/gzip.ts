import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { exec, hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:gzip');

let enabled: boolean | undefined;

async function checkEnabled() {
  if (enabled === undefined) {
    enabled = await hasBin('gzip');
  }

  if (!enabled) {
    throw new Error('GZip compression disabled due to no gzip binary found on PATH');
  }
}

export const gzip: Compression = {
  async deflate({ output, tarStream }): Promise<execa.ExecaChildProcess> {
    await checkEnabled();

    return exec('gzip', ['>', output.filename], {
      input: tarStream,
    });
  },

  async inflate({ input, outputPath = '.' }): Promise<ExecaReturnValue> {
    await checkEnabled();

    const tarBin = await tar();

    log(`Inflating .tar.gz archive: ${tarBin.bin} -C ${outputPath} -xzf -`);

    const result = await exec(tarBin.bin, ['-C', outputPath, '-xzf', '-'], {
      input,
    });

    log('Finished inflating .tar.gz archive');

    return result;
  },
};
