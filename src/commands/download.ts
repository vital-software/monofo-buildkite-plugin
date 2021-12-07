import stream from 'stream';
import debug from 'debug';
import _ from 'lodash';
import { ArtifactApi } from '../artifacts/api';
import { inflator } from '../artifacts/compression';
import { ArtifactDownloader } from '../artifacts/download';
import { Artifact } from '../artifacts/model';
import { BaseCommand } from '../command';

const log = debug('monofo:cmd:download');

interface ArtifactArguments {
  artifacts: string[];
}

export default class Download extends BaseCommand {
  static description = `Downloads the given list of artifacts, inflating them if they are suitable archives

Receives a list of references to files

We support two special cases:
  - if .tar.caidx, we inflate the artifact from desync, and extract in-place
  - if .tar.lz4, we inflate the artifact using lz4, and extract in-place

In both cases, we don't support a "from/to" style configuration, only a list. For each artifact, we support three
modifiers passed in env vars:

  - MONOFO_ARTIFACT_<NAME>_SOFT_FAIL=0|1
  - MONOFO_ARTIFACT_<NAME>_SKIP=0|1
  - MONOFO_ARTIFACT_<NAME>_BUILD_ID=<build UUID>
`;

  /**
   * Because artifacts is variadic
   */
  static strict = false;

  static usage = 'monofo download <artifacts...>';

  static args = [
    {
      name: 'artifacts',
      description: 'A list of artifact files to retrieve and extract',
      required: true,
    },
  ];

  async run() {
    const { args } = this.parse<unknown, ArtifactArguments>(Download);

    const artifacts: Artifact[] = _.castArray<string>(args.artifacts).map((filename) => new Artifact(filename));
    log(`Downloading ${artifacts.length} artifacts: ${artifacts.map((artifact) => artifact.name).join(', ')}`);

    const downloader = new ArtifactDownloader(new ArtifactApi());

    return Promise.all(
      artifacts.map(async (artifact) => {
        const download: stream.Readable = await downloader.download(artifact);
        await inflator(download, artifact);
      })
    ).then(() => 'All done');
  }
}
