import { promises as fs } from 'fs';
import { Flags } from '@oclif/core';
import debug from 'debug';
import prettyBytes from 'pretty-bytes';
import { upload } from '../artifacts/api';
import { compressorFor } from '../artifacts/compression';
import { Artifact } from '../artifacts/model';
import { BaseCommand, BaseFlags } from '../command';
import { getManifest } from '../manifest';

const log = debug('monofo:cmd:upload');

interface UploadFlags extends BaseFlags {
  'files-from'?: string;
  null: boolean;
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
    'files-from': Flags.string({
      char: 'F',
      description: 'A path to a file containing a list of files to upload, or - to use stdin',
    }),
    null: Flags.boolean({
      char: 'z',
      dependsOn: ['files-from'],
      description: "If given, the list of files is expected to be null-separated (a la find's -print0)",
    }),
  };

  static override args = [
    {
      name: 'output',
      required: true,
      description: 'The output file to produce (foo.tar.lz4 or bar.catar.caibx, etc.)',
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
    const { args, flags, raw } = await this.parse<UploadFlags, UploadArgs>(Upload);

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
    const compressor = compressorFor(artifact);

    if (!compressor) {
      throw new Error(`Unsupported output artifact format: ${artifact.ext}`);
    }

    const manifest = await getManifest({ globs: args.globs, filesFrom: flags['files-from'], useNull: flags.null });

    if (Object.keys(manifest).length === 0) {
      log('No files to upload: nothing to do');
      return;
    }

    log(`Deflating to ${args.output}`);
    await compressor.deflate({ artifact, input: { manifest } });
    log(`Finished deflating`);

    const stats = await fs.stat(args.output);
    log(`Archive deflated at ${args.output} as ${prettyBytes(stats.size)}`);

    log('Uploading to Buildkite');
    await upload(artifact);

    log(`Successfully uploaded ${artifact.name}`);
  }
}
