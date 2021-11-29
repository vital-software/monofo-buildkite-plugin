import debug from 'debug';
import _ from 'lodash';
import { Arguments } from 'yargs';
import { Artifact } from '../artifact';
import { BaseArgs, MonofoCommand, toCommand } from '../handler';

const log = debug('monofo:cmd:artifact');

interface ArtifactArguments extends BaseArgs {
  artifacts: string[];
}

/**
 * Download task
 *
 * Receives a list of references to files
 *
 * We support two special cases:
 *  - if .tar.caibx, we inflate the artifact from desync, and extract in-place
 *  - if .tar.lz4, we inflate the artifact using lz4, and extract in-place
 * In both cases, we don't support a "from/to" style configuration, only a list
 *
 * For each artifact, we support three modifiers passed in env vars
 *  - MONOFO_ARTIFACT_<NAME>_SOFT_FAIL=0|1
 *  - MONOFO_ARTIFACT_<NAME>_SKIP=0|1
 *  - MONOFO_ARTIFACT_<NAME>_BUILD_ID=<build UUID>
 */
const cmd: MonofoCommand<ArtifactArguments> = {
  command: 'download',
  describe: `Downloads the given list of artifacts, extracting them if they are suitable archives

Receives a list of references to files

We support two special cases:
  - if .tar.caibx, we inflate the artifact from desync, and extract in-place
  - if .tar.lz4, we inflate the artifact using lz4, and extract in-place

In both cases, we don't support a "from/to" style configuration, only a list. For each artifact, we support three
modifiers passed in env vars:

  - MONOFO_ARTIFACT_<NAME>_SOFT_FAIL=0|1
  - MONOFO_ARTIFACT_<NAME>_SKIP=0|1
  - MONOFO_ARTIFACT_<NAME>_BUILD_ID=<build UUID>
`,

  builder: (yargs) => {
    return yargs.positional('artifacts', {
      array: true,
      type: 'string',
      describe: 'A list of artifact files to retrieve',
      demandOption: true,
    });
  },

  async handler(args: Arguments<ArtifactArguments>): Promise<string> {
    const artifacts: Artifact[] = _.castArray(args.artifacts).map((filename) => new Artifact(filename));
    log(`Donwloading ${artifacts.length} artifacts: ${artifacts.map((a) => a.name).join(', ')}`);
    return Promise.all(artifacts.map((artifact) => artifact.download())).then(() => 'All done');
  },
};

export = toCommand(cmd);
