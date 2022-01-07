import stream from 'stream';
import debug from 'debug';
import execa, { ExecaChildProcess, ExecaReturnValue } from 'execa';
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

function cacheFlags(as = 'cache'): string[] {
  return process.env.MONOFO_DESYNC_CACHE ? [`--${as}`, process.env.MONOFO_DESYNC_CACHE] : [];
}

function tarFlags() {
  return ['tar', '--tar-add-root', '--input-format', 'tar', '--index', '--store', store(), ...cacheFlags('store')];
}

function untarFlags() {
  return ['untar', '--no-same-owner', '--index', '--store', store(), ...cacheFlags()];
}

export const desync: Compression = {
  extension: 'caidx',

  async checkEnabled() {
    if (!store()) {
      throw new Error('Desync compression disabled due to no MONOFO_DESYNC_STORE given');
    }

    if (enabled === undefined) {
      enabled = await hasBin('desync');
    }

    if (!enabled) {
      throw new Error('Desync compression disabled due to missing desync bin on PATH');
    }
  },

  /**
   * Deflate a tar file, creating a content-addressed index file
   *
   * - Expects a stream of the contents of a tar archive to be given as the input parameter
   * - Writes an index file to the given output path
   */
  deflate(input: stream.Readable): ExecaChildProcess {
    log(`Deflating .caidx archive with desync ${tarFlags().join(' ')} - -`);

    return execa('desync', [...tarFlags(), '-', '-'], {
      input,
      buffer: false,
      stderr: 'inherit',
    });
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
    const result = await execa('desync', [...untarFlags(), '-', outputPath], {
      input,
      stderr: 'inherit',
    });

    log('Finished inflating desync .caidx');

    return result;
  },
};
