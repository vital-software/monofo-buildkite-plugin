import stream from 'stream';
import debug from 'debug';
import got from 'got';
import { ArtifactApi } from './api';
import { Artifact } from './model';

const log = debug('monofo:artifact:download');

export class ArtifactDownloader {
  constructor(private readonly api: ArtifactApi) {}

  public async download(artifact: Artifact): Promise<stream.Readable> {
    const url = await this.api.search(artifact);
    log('Downloading: ', url);

    return got.stream(url).on('end', () => {
      log('Finished downloading: ', url);
    });
  }
}
