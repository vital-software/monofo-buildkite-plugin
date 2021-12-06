import stream from 'stream';
import debug from 'debug';
import execa from 'execa';
import { stdinWritable } from '../../util/exec';
import { tar } from './tar';

const log = debug('monofo:artifact:gzip');

export async function inflateGzip(): Promise<[stream.Writable, Promise<void>]> {
  const subprocess = execa(await tar(), ['-xzf', '-'], {
    buffer: true,
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // eslint-disable-next-line no-void
  void subprocess.then(() => log('Finished inflating .tar.gz file'));

  return [stdinWritable(subprocess), subprocess.then(() => {})];
}

export function deflateGzip(): stream.Writable {
  const subprocess = execa('gzip', [], {
    buffer: true,
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // eslint-disable-next-line no-void
  void subprocess.then(() => log('Finished deflating .gz file'));

  return stdinWritable(subprocess);
}
