import stream from 'stream';
import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin, stdoutReadable } from '../../util/exec';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:desync');

let enabled: boolean | undefined;

function store(): string {
  if (!process.env?.MONOFO_DESYNC_STORE) {
    throw new Error('Could not get store details from MONOFO_DESYNC_STORE');
  }
  return process.env.MONOFO_DESYNC_STORE;
}

function cacheFlags(): string[] {
  return process.env.MONOFO_DESYNC_CACHE ? ['--cache', process.env.MONOFO_DESYNC_CACHE] : [];
}

export const desync: Compression = {
  extension: 'caidx',

  async enabled() {
    if (enabled === undefined) {
      enabled = Boolean(store()) && (await hasBin('desync'));
    }
    return enabled;
  },

  /**
   * Deflate a tar file, creating a content-addressed index file
   *
   * - Expects a stream of the contents of a tar archive to be given as the input parameter
   * - Writes an index file to the given output path
   */
  deflate(input: stream.Readable): Promise<stream.Readable> {
    return Promise.resolve(
      stdoutReadable(
        execa(
          'desync',
          [
            'tar',
            '--input-format',
            'tar',
            '--index',
            '--store',
            store(),
            '--store',
            process.env.MONOFO_DESYNC_CACHE,
            '-',
            '-',
          ],
          {
            buffer: false,
            input,
          }
        )
      )
    );
  },

  /**
   * Untar an index file, inflating it at the output path
   *
   * - Expects the contents of a .caidx file to be piped into the returned writable stream
   * - Only outputs debugging information to stdout/stderr
   * - Directly inflates the extracted files and writes them to disk
   *
   * @return ExecaChildProcess The result of running desync untar
   */
  async inflate(input: stream.Readable, outputPath = '.'): Promise<ExecaReturnValue> {
    const result = await execa('desync', ['untar', '--index', '--store', store(), ...cacheFlags(), '-', outputPath], {
      input,
    });

    log('Finished desync untar operation');

    return result;
  },
};
