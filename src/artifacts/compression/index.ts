import stream from 'stream';
import debug from 'debug';
import execa, { ExecaChildProcess } from 'execa';
import { stdoutReadable } from '../../util/exec';
import { tar } from '../../util/tar';
import { Artifact } from '../model';
import { Compression } from './compression';
import { desync } from './desync';
import { gzip } from './gzip';
import { lz4 } from './lz4';

const log = debug('monofo:artifact:compression');

// TODO: use file extension information automatically
export const compressors: Record<string, Compression> = {
  desync,
  gzip,
  lz4,
};

export async function canProcess(artifact: Artifact): Promise<boolean> {
  switch (artifact.ext) {
    case 'tar':
      return true;
    case 'tar.gz':
      return compressors.gzip.enabled();
    case 'tar.lz4':
      return compressors.lz4.enabled();
    case 'tar.caidx':
      return compressors.desync.enabled();
    default:
      return false;
  }
}

/**
 * @param input A .tar file contents being streamed at the deflator
 * @param artifact The eventual artifact we're hoping to produce
 */
export async function deflator(input: stream.Readable, artifact: Artifact): Promise<stream.Readable> {
  switch (artifact.ext) {
    case 'tar':
      return stdoutReadable(execa('cat', [], { input }));
    case 'tar.gz':
      return compressors.gzip.deflate(input);
    case 'tar.lz4':
      return compressors.lz4.deflate(input);
    case 'tar.caidx':
      return compressors.desync.deflate(input);

    default:
      throw new Error(`Unsupported artifact format: ${artifact.ext}`);
  }
}

export async function inflator(
  input: stream.Readable,
  artifact: Artifact,
  outputPath = '.'
): Promise<ExecaChildProcess> {
  if (artifact.skip) {
    log(`Skipping download and inflate for ${artifact.name} because skip is enabled`);
    return Promise.resolve(execa('true'));
  }

  try {
    switch (artifact.ext) {
      case 'tar':
        // eslint-disable-next-line @typescript-eslint/return-await
        return Promise.resolve(execa('tar', ['-C', outputPath, '-xf', '-'], { input }));
      case 'tar.gz':
        return await compressors.gzip.inflate(input, outputPath);
      case 'tar.lz4':
        return await compressors.lz4.inflate(input, outputPath);
      case 'tar.caidx':
        return await compressors.desync.inflate(input, outputPath);
      default:
        // eslint-disable-next-line @typescript-eslint/return-await
        return Promise.resolve(execa('tee', [artifact.filename], { input }));
    }
  } catch (error) {
    log(`Failed to inflate ${artifact.name}`, error);

    if (artifact.softFail) {
      log(`Skipping failure for ${artifact.name} because soft fail is enabled`);
      return Promise.resolve(execa('true'));
    }

    throw error;
  }
}

export * from './compression';
