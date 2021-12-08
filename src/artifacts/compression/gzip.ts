import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:gzip');

let enabled: boolean | undefined;

export const gzip: Compression = {
  extension: 'gz',

  deflate(input) {
    return execa('gzip', [], {
      buffer: false,
      input,
    });
  },

  async enabled() {
    if (enabled === undefined) {
      enabled = await hasBin('gzip');
    }
    return enabled;
  },

  async inflate(input, outputPath = '.'): Promise<ExecaReturnValue> {
    log('Inflating .tar.gz archive');

    const result = await execa(await tar(), ['-C', outputPath, '-xzf', '-'], {
      input,
    });

    log('Finished inflating .tar.gz archive');

    return result;
  },
};
