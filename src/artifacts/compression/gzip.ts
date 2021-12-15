import debug from 'debug';
import execa, { ExecaChildProcess, ExecaReturnValue } from 'execa';
import { hasBin, stdoutReadable } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:gzip');

let enabled: boolean | undefined;

export const gzip: Compression = {
  extension: 'tar.gz',

  deflate(input) {
    return Promise.resolve(
      stdoutReadable(
        execa('gzip', [], {
          buffer: false,
          input,
        })
      )
    );
  },

  async checkEnabled() {
    if (enabled === undefined) {
      enabled = await hasBin('gzip');
    }

    if (!enabled) {
      throw new Error('GZip compression disabled due to no gzip binary found on PATH');
    }
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
