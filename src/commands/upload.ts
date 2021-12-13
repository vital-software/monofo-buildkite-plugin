import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import { flags as f } from '@oclif/command';
import debug from 'debug';
import execa, { ExecaChildProcess } from 'execa';
import { upload } from '../artifacts/api';
import { canProcess, deflator } from '../artifacts/compression';
import { filesToUpload } from '../artifacts/matcher';
import { Artifact } from '../artifacts/model';
import { BaseCommand, BaseFlags } from '../command';
import { stdoutReadable } from '../util/exec';
import { count } from '../util/helper';
import { tar } from '../util/tar';

const log = debug('monofo:cmd:upload');

const pipeline = promisify(stream.pipeline);

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

  static override usage = 'monofo upload <output> [globs...]';

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
      description: 'The output file to produce (foo.tar.lz4 or bar.tar.caidx, etc.)',
    },
    {
      name: 'globs',
      required: false,
      description: 'A list of glob patterns; matching files are included in the artifact upload',
      default: [],
    },
  ];

  async run() {
    const { args, flags } = this.parse<UploadFlags, UploadArgs>(Upload);

    if (!args.output) {
      throw new Error(
        'Must be given an output (tarball) filename, to upload the collected files to, as the first positional argument'
      );
    }

    const artifact = new Artifact(args.output);
    const files = await filesToUpload({ globs: args.globs, filesFrom: flags['files-from'], useNull: flags.null });

    if (files.length === 0) {
      log('No files to upload: nothing to do');
      return;
    }

    if (flags.verbose) {
      log('Files to upload', files);
    }

    log(`Uploading ${count(files, 'path')} as ${args.output}`);
    const output = await Upload.getOutputStream(artifact);

    const subprocess: ExecaChildProcess = execa(await tar(), ['-c', '--files-from', '-', '--null'], {
      input: stream.Readable.from(files.join('\x00')),
      buffer: false,
    });

    log('Starting to deflate');
    await deflator(stdoutReadable(subprocess), artifact).then(async (deflated: stream.Readable) => {
      log('Waiting for archive and deflate to be complete');
      await pipeline(deflated, output);
    });

    log('Uploading to Buildkite');
    await upload(artifact);

    log(`Successfully uploaded ${artifact.name}`);
  }

  private static async getOutputStream(artifact: Artifact): Promise<stream.Writable> {
    if (!(await canProcess(artifact))) {
      throw new Error(`Cannot process artifact type ${artifact.ext} for ${artifact.name}: not supported`);
    }

    return fs.createWriteStream(artifact.filename);
  }
}
