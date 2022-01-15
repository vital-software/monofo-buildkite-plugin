import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';
import { execFromTar } from './tar';

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
  async deflate(output): Promise<string[]> {
    await checkEnabled();
    return ['|', 'gzip', '>', output.filename];
  },

  async inflate({ input, outputPath = '.' }): Promise<ExecaReturnValue> {
    await checkEnabled();

    const tarBin = await tar();

    log(`Inflating .tar.gz archive: ${tarBin.bin} -C ${outputPath} -xzf -`);

    const result = await execa(tarBin.bin, ['-C', outputPath, '-xzf', '-'], {
      input,
    });

    log('Finished inflating .tar.gz archive');

    return result;
  },
};
