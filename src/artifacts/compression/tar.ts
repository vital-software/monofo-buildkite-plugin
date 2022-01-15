import debug from 'debug';
import { ExecaReturnValue } from 'execa';
import { exec, hasBin } from '../../util/exec';
import { tar as tarBin } from '../../util/tar';
import { Compression } from './compression';

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

export const tar: Compression = {
  async deflate(output): Promise<string[]> {
    await checkEnabled();
    return ['>', output.filename];
  },

  async inflate({ input, outputPath = '.' }): Promise<ExecaReturnValue> {
    await checkEnabled();

    log(`Inflating .tar archive: tar -C ${outputPath} -x -f -`);

    const result = await exec((await tarBin()).bin, ['-C', outputPath, '-x', '-f', '-'], {
      input,
    });

    log('Finished inflating .tar archive');

    return result;
  },
};
