import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { execFromTar, tar } from '../../util/tar';
import { Compressor } from './compressor';

const log = debug('monofo:artifact:compression:lz4');

let enabled: boolean | undefined;

async function checkEnabled() {
  if (enabled === undefined) {
    enabled = await hasBin('lz4');
  }

  if (!enabled) {
    throw new Error('LZ4 compression is disabled due to no lz4 binary found on PATH');
  }
}

export const lz4: Compressor = {
  async deflate({ artifact, input }): Promise<void> {
    await checkEnabled();
    await execFromTar(input)(['|', 'lz4', '-2', '>', artifact.filename]);
  },

  async inflate({ input, outputPath = '.' }): Promise<ExecaReturnValue> {
    await checkEnabled();
    log(`Inflating .tar.lz4 archive: tar -C ${outputPath} -x --use-compress-program=lz4 -f -`);

    const result = await execa((await tar()).bin, ['-C', outputPath, '-x', '--use-compress-program=lz4', '-f', '-'], {
      input,
    });

    log('Finished inflating .tar.lz4 archive');

    return result;
  },
};
