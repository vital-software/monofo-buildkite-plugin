import debug from 'debug';
import execa, { ExecaChildProcess, ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:gzip');

export const gzip: Compression = {
  extensions: ['gz'],

  deflate(input) {
    const subprocess = execa('gzip', [], {
      buffer: false,
      stdio: [input, 'pipe', 'inherit'],
    });

    // eslint-disable-next-line no-void
    void subprocess.then(() => log('Finished deflating .gz file'));

    return subprocess;
  },

  enabled(): Promise<boolean> {
    return hasBin('gzip');
  },

  async inflate(input, outputPath = '.'): Promise<ExecaReturnValue> {
    const result = await execa(await tar(), ['-C', outputPath, '-xzf', '-'], {
      stdio: [input, 'pipe', 'inherit'],
    });

    log('Finished inflating GZIP archive');

    return result;
  },
};
