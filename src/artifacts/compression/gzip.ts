import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:gzip');

let enabled: boolean | undefined;

export const gzip: Compression = {
  extensions: ['gz'],

  deflate(input) {
    const subprocess = execa('gzip', [], {
      buffer: false,
      input,
    });

    // eslint-disable-next-line no-void
    void subprocess.then(() => log('Finished deflating .gz file'));

    return subprocess;
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
