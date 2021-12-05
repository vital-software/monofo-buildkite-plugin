import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import execa from 'execa';
import { stdinWritable } from '../util';
import { inflateDesync, isDesyncEnabled } from './compression/desync';
import { tar } from './compression/tar';
import { Artifact } from './model';

const log = debug('monofo:artifact:inflate');

const pipeline = promisify(stream.pipeline);
const finished = promisify(stream.finished);

export class ArtifactInflator {
  public async inflate(input: stream.Readable, artifact: Artifact): Promise<void> {
    if (artifact.skip) {
      log(`Skipping download and inflate for ${artifact.name} because skip is enabled`);
      return;
    }

    try {
      const [destination, finishedExec] = await this.destination(artifact);
      await pipeline(input, destination);

      await finishedExec;
    } catch (error) {
      log(`Failed to download ${artifact.name}`, error);

      if (artifact.softFail) {
        log(`Skipping failure for ${artifact.name} because soft fail is enabled`);
        return;
      }

      throw error;
    }
  }

  private async destination(artifact: Artifact): Promise<[stream.Writable, Promise<void>]> {
    if (artifact.ext.endsWith('tar.lz4')) {
      log('Extracting from .tar.lz4');
      return this.inflateLz4();
    }

    if (artifact.ext.endsWith('tar.cbidx') && (await isDesyncEnabled())) {
      log('Extracting from .tar.cbidx');
      return inflateDesync(artifact.filename.replace('/.cbidx$/', ''));
    }

    log('Extracting as-is');
    const outputFile = fs.createWriteStream(artifact.filename);
    return [outputFile, finished(outputFile).then(() => {})];
  }

  private async inflateLz4(): Promise<[stream.Writable, Promise<void>]> {
    const subprocess = execa(await tar(), ['-xv', '--use-compress-program=lz4', '-f', '-'], {
      buffer: true,
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    // eslint-disable-next-line no-void
    void subprocess.then(() => log('Finished inflating LZ4 file'));

    return [stdinWritable(subprocess), subprocess.then(() => {})];
  }
}
