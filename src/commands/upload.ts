import { createWriteStream } from 'fs';
import { pipeline as pipelineCb } from 'stream';
import util from 'util';
import { flags as f } from '@oclif/command';
import debug from 'debug';
import { upload } from '../artifacts/api';
import { deflator } from '../artifacts/compression';
import { PathsToPack, pathsToPack } from '../artifacts/matcher';
import { Artifact } from '../artifacts/model';
import { BaseCommand, BaseFlags } from '../command';
import { produceTarStream } from '../util/tar';

const pipeline = util.promisify(pipelineCb);

const log = debug('monofo:cmd:upload');

interface UploadFlags extends BaseFlags {
  'files-from'?: string;
  null: boolean;
  'debug-tar'?: string;
}

interface UploadArgs {
  output: string;
  globs?: string[];
}

/**
 * Upload command
 */
export default class Upload extends BaseCommand {
  /**
   * Because the globs argument is variadic
   */
  static override strict = false;

  static override description = `Produces a compressed tarball artifact from a given list of globs, and uploads it to Buildkite Artifacts

This command has similar input modes to GNU tar. Meaning, it can take:
- a list of glob patterns, matching files and directories will be included in
   the artifact, and/or
- a path to a file containing a list of files to include in the artifact
  - which can be '-' for stdin
  - or can be null-separated (like the output mode of \`find\`'s \`-print0\` option)

Then this command is designed to stream things to the eventual destination,
process any necessary deflation of the resulting tar archive, and ensure it's
locally cached
`;

  static override examples = [
    `$ find . -name node_modules -type d -prune -print0 | monofo upload --files-from - --null`,
  ];

  static override usage = 'upload <output> [globs...]';

  static override flags = {
    ...BaseCommand.flags,
    'files-from': f.string({
      char: 'F',
      description: 'A path to a file containing a list of files to upload, or - to use stdin',
    }),
    null: f.boolean({
      char: 'z',
      dependsOn: ['files-from'],
      description: "If given, the list of files is expected to be null-separated (a la find's -print0)",
    }),
    'debug-tar': f.string({
      char: 'T',
      description: 'A path to write the uncompressed resulting tar file to (as a debug measure)',
    }),
  };

  static override args = [
    {
      name: 'output',
      required: true,
      description: 'The output file to produce (foo.tar.lz4 or bar.caidx, etc.)',
    },
    {
      name: 'globs',
      required: false,
      description: 'A list of glob patterns; matching files are included in the artifact upload',
      default: [],
      multiple: true,
    },
  ];

  async run() {
    const { args, flags, raw } = this.parse<UploadFlags, UploadArgs>(Upload);

    if (!args.output) {
      throw new Error(
        'Must be given an output (tarball) filename, to upload the collected files to, as the first positional argument'
      );
    }

    // see https://github.com/oclif/oclif/issues/293 and https://github.com/oclif/parser/pull/63
    args.globs = raw
      .filter((arg) => arg.type === 'arg')
      .map((arg) => arg.input)
      .slice(1);

    const artifact = new Artifact(args.output);

    const paths: PathsToPack = await pathsToPack({
      globs: args.globs,
      filesFrom: flags['files-from'],
      useNull: flags.null,
    });

    if (Object.keys(paths).length === 0) {
      log('No files to upload: nothing to do');
      return;
    }

    const tarStream = await produceTarStream(paths);

    if (flags['debug-tar']) {
      log(`Writing debug tar to ${flags['debug-tar']}`);
      await pipeline(tarStream, createWriteStream(flags['debug-tar']));
      log('Finished writing debug tar');
    }

    log(`Deflating archive`);
    await deflator(artifact, tarStream);
    log(`Archive deflated at ${args.output}`);

    log('Uploading to Buildkite');
    await upload(artifact);

    log(`Successfully uploaded ${artifact.name}`);
  }
}
