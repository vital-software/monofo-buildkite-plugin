import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import tempy from 'tempy';
import { hasBin } from '../../util/exec';
import { Compression } from './compression';

const pipeline = promisify(stream.pipeline);

const log = debug('monofo:artifact:compression:desynw');

let enabled: boolean | undefined;

function store(): string {
  if (!process.env?.MONOFO_DESYNC_STORE) {
    throw new Error('Could not get store details from MONOFO_DESYNC_STORE');
  }
  return process.env.MONOFO_DESYNC_STORE;
}

function cacheFlags(): string[] {
  return process.env.MONOFO_DESYNC_CACHE ? ['-c', process.env.MONOFO_DESYNC_CACHE] : [];
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
  async deflate(input: stream.Readable): Promise<stream.Readable> {
    // write the tar input stream to the temp tar
    const tempTar = tempy.file();
    const tempIndex = tempy.file();

    await pipeline(input, fs.createWriteStream(tempTar));

    // run it into desync, storing it remotely, and causing the index file to be created
    await execa('desync', ['tar', '--input-format', 'tar', '--index', '-s', store(), tempIndex, tempTar], {
      buffer: false,
      input,
    });

    // `chop` it into the local cache as well
    await execa('desync', ['chop', '-s', process.env.MONOFO_DESYNC_CACHE, tempIndex, tempTar]);

    return fs.createReadStream(tempIndex);
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
    const result = await execa('desync', ['untar', '--index', '-s', store(), ...cacheFlags(), '-', outputPath], {
      input,
    });

    log('Finished desync untar operation');

    return result;
  },
};
