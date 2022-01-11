import stream from 'stream';
import debug from 'debug';
import execa, { ExecaChildProcess } from 'execa';
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

export function deflateCmd(artifact: Artifact): Promise<string[]> {
  switch (artifact.ext) {
    case 'tar':
      return Promise.resolve(['cat', '>', artifact.filename]);
    case compressors.gzip.extension:
      return compressors.gzip.deflateCmd(artifact.filename);
    case compressors.lz4.extension:
      return compressors.lz4.deflateCmd(artifact.filename);
    case compressors.desync.extension:
      return compressors.desync.deflateCmd(artifact.filename);
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

  switch (artifact.ext) {
    case 'tar':
      // eslint-disable-next-line @typescript-eslint/return-await
      return Promise.resolve(execa('tar', ['-C', outputPath, '-xf', '-'], { input, stderr: 'inherit' }));
    case compressors.gzip.extension:
      return compressors.gzip.inflate(input, outputPath);
    case compressors.lz4.extension:
      return compressors.lz4.inflate(input, outputPath);
    case compressors.desync.extension:
      return compressors.desync.inflate(input, outputPath);
    default:
      // eslint-disable-next-line @typescript-eslint/return-await
      return Promise.resolve(execa('tee', [artifact.filename], { input, stderr: 'inherit' }));
  }
}

export * from './compression';
