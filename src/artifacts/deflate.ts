import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import { deflateDesync } from './compression/desync';
import { deflateGzip } from './compression/gzip';
import { deflateLz4 } from './compression/lz4';
import { Artifact } from './model';

const log = debug('monofo:artifact:deflate');

const pipeline = promisify(stream.pipeline);

/**
 * Deflates a readable input stream of an uncompressed TAR archive into a compressed archive at the artifact location
 */
export class ArtifactDeflator {
  /**
   * @param input A readable stream of a tar archive
   * @param artifact An output archive we're aiming to stream into
   */
  public async deflate(input: stream.Readable, artifact: Artifact): Promise<void> {
    switch (artifact.ext) {
      case 'tar':
        await pipeline(input, fs.createWriteStream(artifact.filename));
        log(`Finished outputting tar file`, artifact.filename);
        return;

      case 'tar.gz':
        await pipeline(input, deflateGzip(), fs.createWriteStream(artifact.filename));
        log(`Finished outputting gz file`, artifact.filename);
        return;

      case 'tar.lz4':
        await pipeline(input, deflateLz4(), fs.createWriteStream(artifact.filename));
        log(`Finished deflating LZ4 file`, artifact.filename);
        return;

      case 'tar.caidx':
        await pipeline(input, deflateDesync(artifact.filename), fs.createWriteStream(artifact.filename));
        log(`Finished deflating caidx file`, artifact.filename);
        return;

      default:
        throw new Error(`Unsupported artifact format: ${artifact.ext}`);
    }
  }
}
