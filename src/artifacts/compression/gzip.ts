import stream from 'stream';
import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Artifact } from '../model';
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
  extension: 'tar.gz',

  async deflateCmd(outputPath: string): Promise<string[]> {
    await checkEnabled();
    return ['gzip', '>', outputPath];
  },

  async inflate(input: stream.Readable, outputPath = '.'): Promise<ExecaReturnValue> {
    await checkEnabled();

    log(`Inflating .tar.gz archive: ${await tar()} -C ${outputPath} -xzf -`);

    const result = await execa(await tar(), ['-C', outputPath, '-xzf', '-'], {
      input,
    });

    log('Finished inflating .tar.gz archive');

    return result;
  },
};
