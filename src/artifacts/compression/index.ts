import stream from 'stream';
import debug from 'debug';
import { exec } from '../../util/exec';
import { Artifact } from '../model';
import { Compressor } from './compressor';
import { desync } from './desync';
import { gzip } from './gzip';
import { lz4 } from './lz4';
import { tar } from './tar';

const log = debug('monofo:artifact:compression');

export * from './compressor';

export const compressors: Record<string, Compressor> = {
  'catar.caibx': desync,
  'tar.gz': gzip,
  'tar.lz4': lz4,
  tar,
};

export function compressorFor(artifact: Artifact): Compressor | undefined {
  return compressors?.[artifact.ext] ?? undefined;
}

export async function inflator(input: stream.Readable, artifact: Artifact, outputPath = '.'): Promise<void> {
  if (artifact.skip) {
    log(`Skipping download and inflate for ${artifact.name} because skip is enabled`);
  } else {
    const compressor = compressors?.[artifact.ext];

    if (!compressor) {
      log(`Using no compression: inflating ${artifact.name} "as-is"`);
      await exec(['cat', '>', artifact.filename], { input });
      return;
    }

    await compressor.inflate({ input, artifact, outputPath });
  }
}
