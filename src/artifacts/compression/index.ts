import stream from 'stream';
import debug from 'debug';
import execa from 'execa';
import { exec } from '../../util/exec';
import { Artifact } from '../model';
import { Compression, TarInputArgs } from './compression';
import { desync } from './desync';
import { gzip } from './gzip';
import { lz4 } from './lz4';
import { tar } from './tar';

const log = debug('monofo:artifact:compression');

export * from './compression';

export const compressors: Record<string, Compression> = {
  caidx: desync,
  'tar.gz': gzip,
  'tar.lz4': lz4,
  tar,
};

export function deflator(output: Artifact, tarInputArgs: TarInputArgs): Promise<execa.ExecaChildProcess> {
  const compressor = compressors?.[output.ext];

  if (!compressor) {
    throw new Error(`Unsupported output artifact format: ${output.ext}`);
  }

  return compressor.deflate(output, tarInputArgs);
}

export async function inflator(
  input: stream.Readable,
  artifact: Artifact,
  outputPath = '.'
): Promise<execa.ExecaChildProcess> {
  if (artifact.skip) {
    log(`Skipping download and inflate for ${artifact.name} because skip is enabled`);
    return Promise.resolve(execa('true'));
  }

  const compressor = compressors?.[artifact.ext];

  if (!compressor) {
    log(`Using no compression: inflating ${artifact.name} "as-is"`);
    return exec('cat', ['>', artifact.filename], { input });
  }

  return compressor.inflate(input, outputPath);
}
