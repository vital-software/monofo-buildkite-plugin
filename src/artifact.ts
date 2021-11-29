import * as fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import execa from 'execa';
import got from 'got';
import _ from 'lodash';
import { tar, toStream } from './util';

const log = debug('monofo:artifact');

const pipeline = promisify(stream.pipeline);

export class Artifact {
  readonly name: string;

  readonly ext: string;

  readonly buildId: string;

  readonly skip: boolean;

  readonly softFail: boolean;

  constructor(readonly filename: string, config: NodeJS.ProcessEnv = process.env) {
    [this.name] = this.filename.split('.');
    this.ext = this.filename.split('.').slice(1).join('.'); // Not extname() because that only gives the last ext

    const envName = _.upperCase(_.snakeCase(this.name));

    this.skip = Boolean(config?.[`MONOFO_ARTIFACT_${envName}_SKIP`]);
    this.softFail = Boolean(config?.[`MONOFO_ARTIFACT_${envName}_SOFT_FAIL`]);

    // This is a valid fallback, because if we don't pass --build <build-id> this env var would be used anyway
    this.buildId = config?.[`MONOFO_ARTIFACT_${envName}_BUILD_ID`] || config?.BUILDKITE_BUILD_ID;

    if (!this.buildId) {
      throw new Error(`Expected BUILDKITE_BUILD_ID or MONOFO_ARTIFACT_${envName}_BUILD_ID to be set`);
    }
  }
}

export class ArtifactApi {
  public async search(artifact: Artifact): Promise<string> {
    return (
      await execa(
        'buildkite-agent',
        [
          'artifact',
          'search',
          artifact.filename,
          '--format',
          `$'%u\\n'`,
          artifact.buildId ? `--build` : '',
          artifact.buildId ? artifact.buildId : '',
        ],
        {
          stdio: ['pipe', 'pipe', 'inherit'],
        }
      )
    ).stdout.split('\n')[0];
  }
}

export class ArtifactDownloader {
  constructor(private readonly api: ArtifactApi) {}

  public async downloadAndExtract(artifact: Artifact): Promise<void> {
    try {
      await pipeline(await this.download(artifact), await this.destination(artifact));
    } catch (error) {
      if (!artifact.softFail) {
        throw error;
      }
    }
  }

  private async download(artifact: Artifact) {
    const url = await this.api.search(artifact);
    log('Downloading: ', url);

    return got.stream(url).on('end', () => {
      log('Finished downloading: ', url);
    });
  }

  private async destination(artifact: Artifact): Promise<stream.Writable> {
    if (artifact.ext.endsWith('tar.lz4')) {
      log('Extracting from .tar.lz4');
      return this.extractLz4();
    }

    if (artifact.ext.endsWith('tar.cbidx')) {
      log('Extracting from .tar.cbidx');
      return this.extractDesync();
    }

    log('Extracting as-is');
    return fs.createWriteStream(artifact.filename);
  }

  private async extractLz4(): Promise<stream.Writable> {
    const t = await tar();

    return toStream(
      execa(t, ['-xv', '--use-compress-program=lz4', '-f', '-'], {
        buffer: true,
        stdio: ['pipe', 'pipe', 'inherit'],
      }).on('end', () => log('Finished extracting'))
    );
  }

  private extractDesync(): stream.Writable {
    return toStream(execa('desync', ['tar'], { buffer: false, stdio: ['pipe', 'pipe', 'inherit'] }));
  }
}
