import debug from 'debug';
import _ from 'lodash';
import { download } from '../artifacts/api';
import { inflator } from '../artifacts/compression';
import { Artifact } from '../artifacts/model';
import { BaseCommand } from '../command';
import { count } from '../util/helper';

const log = debug('monofo:cmd:download');

interface ArtifactArguments {
  artifacts: string[];
}

export default class Download extends BaseCommand {
  static override description = `Downloads the given list of artifacts, inflating them if they are suitable archives

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
  static override strict = false;

  static override usage = 'monofo download <artifacts...>';

  static override args = [
    {
      name: 'artifacts',
      description: 'A list of artifact files to retrieve and extract',
      required: true,
      multiple: true,
    },
  ];

  static override flags = { ...BaseCommand.flags };

  async run() {
    const { argv } = this.parse<unknown, ArtifactArguments>(Download);

    const artifacts: Artifact[] = _.castArray<string>(argv).map((filename) => new Artifact(filename));
    log(`Downloading ${count(artifacts, 'artifact')}: ${artifacts.map((artifact) => artifact.name).join(', ')}`);

    return Promise.all(
      artifacts.map(async (artifact) => {
        await inflator(await download(artifact), artifact);
      })
    ).then(() => 'All done');
  }
}
