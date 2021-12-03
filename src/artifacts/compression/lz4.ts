import stream from 'stream';
import debug from 'debug';
import execa from 'execa';
import { stdinWritable, tar } from '../../util';

const log = debug('monofo:artifact:lz4');

export async function inflateLz4(): Promise<[stream.Writable, Promise<void>]> {
  const subprocess = execa(await tar(), ['-xv', '--use-compress-program=lz4', '-f', '-'], {
    buffer: true,
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // eslint-disable-next-line no-void
  void subprocess.then(() => log('Finished inflating LZ4 file'));

  return [stdinWritable(subprocess), subprocess.then(() => {})];
}

export function deflateLz4(): stream.Writable {
  const subprocess = execa('lz4', ['-2'], {
    buffer: true,
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // eslint-disable-next-line no-void
  void subprocess.then(() => log('Finished deflating LZ4 file'));

  return stdinWritable(subprocess);
}
