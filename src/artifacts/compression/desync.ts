import stream from 'stream';
import debug from 'debug';
import execa, { ExecaChildProcess } from 'execa';
import { hasBin } from '../../util/exec';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:desync');

let hasDesync: Promise<boolean> | undefined;

/**
 * @todo replace with desync config file
 */
function getFlags({ cache = true, store = true } = {}): string[] {
  return [
    ...(cache && process.env?.MONOFO_DESYNC_CACHE ? ['-c', process.env.MONOFO_DESYNC_CACHE] : []),
    ...(store && process.env?.MONOFO_DESYNC_STORE ? ['-s', process.env.MONOFO_DESYNC_STORE] : []),
    ...(process.env?.MONOFO_DESYNC_FLAGS || '').split(' '),
  ];
}

export const desync: Compression = {
  extensions: ['caidx'],

  async enabled(): Promise<boolean> {
    if (!hasDesync) {
      hasDesync = hasBin('desync');
    }

    return Boolean(process.env?.MONOFO_DESYNC_STORE) && (await hasDesync);
  },

  /**
   * Untar an index file, inflating it at the output path
   *
   * - Expects the contents of a .caidx file to be piped into the returned writable stream
   * - Only outputs debugging information to stdout/stderr
   * - Directly inflates the extracted files and writes them to disk
   *
   * @return ExecaChildProcess The child process running desync untar
   */
  async inflate(input: stream.Readable, outputPath = '.'): Promise<ExecaChildProcess<string>> {
    const subprocess = execa('desync', ['untar', '--index', ...getFlags(), '-', outputPath], {
      buffer: false,
      stdio: [input, 'inherit', 'inherit'],
    });

    // eslint-disable-next-line no-void
    void subprocess.then(() => log('Finished desync untar operation'));

    return subprocess;
  },

  /**
   * Deflate a tar file, creating a content-addressed index file
   *
   * - Expects a stream of the contents of a tar archive to be given as the input parameter
   * - Writes an index file to the given output path
   */
  deflate(input: stream.Readable): ExecaChildProcess<string> {
    return execa('desync', ['tar', '--input-format', 'tar', '--index', ...getFlags({ cache: false }), '-', '-'], {
      buffer: false,
      stdio: [input, 'pipe', 'inherit'],
    });
    // TODO: after producing index: desync chop -s /some/local/store somefile.tar.caidx somefile.tar
  },
};
