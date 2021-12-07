import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import execa, { ExecaChildProcess } from 'execa';
import { Artifact } from '../model';
import { desync } from './desync';
import { gzip } from './gzip';
import { lz4 } from './lz4';

const pipeline = promisify(stream.pipeline);

const log = debug('monofo:artifact:compression');

// TODO: use file extension information automatically
export const compressors = {
  desync,
  gzip,
  lz4,
};

export function deflator(input: stream.Readable, artifact: Artifact): ExecaChildProcess {
  switch (artifact.ext) {
    case 'tar':
      return execa('cat', [], { input });
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

export async function inflator(input: stream.Readable, artifact: Artifact, outputPath = '.'): Promise<void> {
  if (artifact.skip) {
    log(`Skipping download and inflate for ${artifact.name} because skip is enabled`);
    return;
  }

  try {
    if (artifact.ext === 'tar') {
      await execa('tar', ['-C', outputPath, '-xf', '-'], { input });
      return;
    }

    if (artifact.ext === 'tar.gz') {
      await compressors.gzip.inflate(input, outputPath);
      return;
    }

    if (artifact.ext === 'tar.lz4') {
      await compressors.lz4.inflate(input, outputPath);
      return;
    }

    if (artifact.ext === 'tar.caidx') {
      await compressors.desync.inflate(input, outputPath);
      return;
    }

    await pipeline(input, fs.createWriteStream(artifact.filename));
    return;
  } catch (error) {
    log(`Failed to inflate ${artifact.name}`, error);

    if (artifact.softFail) {
      log(`Skipping failure for ${artifact.name} because soft fail is enabled`);
      return;
    }

    throw error;
  }
}
