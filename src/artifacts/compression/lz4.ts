import debug from 'debug';
import execa from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:lz4');

export const lz4: Compression = {
  extensions: ['lz4'],

  deflate(input) {
    const subprocess = execa('lz4', ['-2'], {
      buffer: true,
      stdio: [input, 'pipe', 'inherit'],
    });

    void subprocess.then(() => log('Finished deflating LZ4 file'));

    return subprocess;
  },

  enabled() {
    return hasBin('lz4');
  },

  async inflate(input, outputPath = '.'): Promise<execa.ExecaChildProcess> {
    const subprocess = execa(await tar(), ['-C', outputPath, '-xv', '--use-compress-program=lz4', '-f', '-'], {
      buffer: true,
      stdio: [input, 'pipe', 'inherit'],
    });

    // eslint-disable-next-line no-void
    void subprocess.then(() => log('Finished inflating LZ4 file'));

    return subprocess;
  },
};
