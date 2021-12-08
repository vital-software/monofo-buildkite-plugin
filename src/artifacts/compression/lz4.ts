import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:lz4');

let enabled: boolean | undefined;

export const lz4: Compression = {
  extension: 'lz4',

  deflate(input) {
    return execa('lz4', ['-2'], {
      buffer: false,
      input,
    });
  },

  async enabled() {
    if (enabled === undefined) {
      enabled = await hasBin('lz4');
    }
    return enabled;
  },

  async inflate(input, outputPath = '.'): Promise<ExecaReturnValue> {
    log('Inflating .tar.lz4 archive');

    const result = await execa(await tar(), ['-C', outputPath, '-x', '--use-compress-program=lz4', '-f', '-'], {
      input,
    });

    log('Finished inflating .tar.lz4 archive');

    return result;
  },
};
