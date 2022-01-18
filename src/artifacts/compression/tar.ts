import debug from 'debug';
import { ExecaReturnValue } from 'execa';
import { exec, hasBin } from '../../util/exec';
import { execFromTar, tar as tarBin } from '../../util/tar';
import { Compressor } from './compressor';

const log = debug('monofo:artifact:compression:lz4');

let enabled: boolean | undefined;

async function checkEnabled() {
  if (enabled === undefined) {
    enabled = await hasBin('tar');
  }

  if (!enabled) {
    throw new Error('tar is disabled due to no tar binary found on PATH');
  }
}

export const tar: Compressor = {
  async deflate({ artifact, input }): Promise<void> {
    await checkEnabled();
    await execFromTar(input)(['>', artifact.filename]);
  },

  async inflate({ input, outputPath = '.' }): Promise<ExecaReturnValue> {
    await checkEnabled();

    log(`Inflating .tar archive: tar -C ${outputPath} -x -f -`);

    const result = await exec([(await tarBin()).bin, '-C', outputPath, '-x', '-f', '-'], {
      input,
    });

    log('Finished inflating .tar archive');

    return result;
  },
};
