import { flags as f } from '@oclif/command';
import debug from 'debug';
import { upload } from '../artifacts/api';
import { deflator } from '../artifacts/compression';
import { Artifact } from '../artifacts/model';
import { BaseCommand, BaseFlags } from '../command';
import { tarArgListForManifest, getManifest } from '../manifest';
import { exec } from '../util/exec';
import { count } from '../util/helper';
import { tar } from '../util/tar';

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
    'files-from': f.string({
      char: 'F',
      description: 'A path to a file containing a list of files to upload, or - to use stdin',
    }),
    null: f.boolean({
      char: 'z',
      dependsOn: ['files-from'],
      description: "If given, the list of files is expected to be null-separated (a la find's -print0)",
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
    const manifest = await getManifest({ globs: args.globs, filesFrom: flags['files-from'], useNull: flags.null });

    if (Object.keys(manifest).length === 0) {
      log('No files to upload: nothing to do');
      return;
    }

    const fileList = await tarArgListForManifest(manifest);

    if (!fileList) {
      throw new Error('Expected file to package');
    }

    log(`Giving ${count(fileList, 'argument')} to tar as input filelist`);
    const input = `${fileList.join('\n')}\n`;

    const tarBin = await tar();
    const allArgs = [
      'set',
      '-euo',
      'pipefail',
      ';',
      tarBin.bin,
      '-c',
      ...tarBin.argsFor.create,
      '--hard-dereference',
      '--files-from',
      '-',
      ...(await deflator(artifact)),
    ];

    log(`Deflating to ${args.output}`);
    await exec(allArgs[0], allArgs.slice(1), {
      input,
    });
    log(`Archive deflated at ${args.output}`);

    log('Uploading to Buildkite');
    await upload(artifact);

    log(`Successfully uploaded ${artifact.name}`);
  }
}
