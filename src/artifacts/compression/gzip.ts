import debug from 'debug';
import { ExecaReturnValue } from 'execa';
import { exec, hasBin } from '../../util/exec';
import { execFromTar, tar } from '../../util/tar';
import { Compressor } from './compressor';

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

export const gzip: Compressor = {
  async deflate({ input, artifact }): Promise<void> {
    await checkEnabled();
    await execFromTar(input)(['|', 'gzip', '>', artifact.filename]);
  },

  async inflate({ input, outputPath = '.' }): Promise<ExecaReturnValue> {
    await checkEnabled();

    const tarBin = await tar();

    log(`Inflating .tar.gz archive: ${tarBin.bin} -C ${outputPath} -xzf -`);

    const result = await exec([tarBin.bin, '-C', outputPath, '-xzf', '-'], {
      input,
    });

    log('Finished inflating .tar.gz archive');

    return result;
  },
};
