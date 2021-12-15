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

export async function checkEnabled(artifact: Artifact): Promise<void> {
  switch (artifact.ext) {
    case compressors.gzip.extension:
      await compressors.gzip.checkEnabled();
      break;
    case compressors.lz4.extension:
      await compressors.lz4.checkEnabled();
      break;
    case compressors.desync.extension:
      await compressors.desync.checkEnabled();
      break;
    case 'tar':
      log(`No compression handled for tar archive: ${artifact.filename}`);
      break;
    default:
      log(`No compression handled for artifact: ${artifact.filename}`);
      break;
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
    case compressors.gzip.extension:
      return compressors.gzip.deflate(input);
    case compressors.lz4.extension:
      return compressors.lz4.deflate(input);
    case compressors.desync.extension:
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
      case compressors.gzip.extension:
        return await compressors.gzip.inflate(input, outputPath);
      case compressors.lz4.extension:
        return await compressors.lz4.inflate(input, outputPath);
      case compressors.desync.extension:
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
