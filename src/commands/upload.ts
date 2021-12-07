import fs from 'fs';
import stream from 'stream';
import { flags as f } from '@oclif/command';
import debug from 'debug';
import execa from 'execa';
import { tar } from '../artifacts/compression/tar';
import { ArtifactDeflator } from '../artifacts/deflate';
import { Artifact } from '../artifacts/model';
import { BaseCommand } from '../command';
import { splitAsyncIterator } from '../util/async';
import { stdoutReadable } from '../util/exec';
import { globSet } from '../util/glob';
import { count } from '../util/helper';

const log = debug('monofo:cmd:upload');

interface UploadFlags {
  'files-from'?: string;
  null: boolean;
}

interface UploadArgs {
  output: string;
  globs?: string[];
}

/**
 * Upload command
 *
 * This command has similar input modes to GNU tar. Meaning, it can take:
 * - a list of glob patterns, matching files and directories will be included in the artifact, and/or
 * - a path to a file containing a list of files to include in the artifact
 *   - which can be '-' for stdin
 *   - and can be null-separated (like the output mode of `find`'s `-print0` option)
 *
 * Then this command is designed to stream things to the eventual destination,
 * process any necessary deflation of the resulting tar archive, and ensure it's
 * locally cached
 */
export default class Upload extends BaseCommand {
  /**
   * Because the globs argument is variadic
   */
  static strict = false;

  static description =
    'Produces a compressed tarball artifact from a given list of globs, and uploads it to Buildkite Artifacts';

  static usage = 'monofo upload <output> [globs...]';

  static flags = {
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

  static args = [
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
    const { args } = this.parse<UploadFlags, UploadArgs>(Upload);

    if (!args.output) {
      throw new Error(
        'Must be given an output (tarball) filename, to upload the collected files to, as the first positional argument'
      );
    }

    const artifact = new Artifact(args.output);
    const files = await this.filesToUpload();

    if (files.length === 0) {
      log('No files to upload: nothing to do');
      return 'No files to upload: nothing to do';
    }

    log(`Uploading ${count(files, 'path')} as ${args.output}`);

    const input = stream.Readable.from(files.join('\x00'));

    const subprocess = execa(await tar(), ['-c', '--files-from', '-', '--null'], {
      input,
    });

    const deflator = new ArtifactDeflator();

    log('Waiting for deflate');
    await deflator.deflate(stdoutReadable(subprocess), artifact);

    log('Waiting for subprocess');
    await subprocess;

    log('Waiting for upload');

    log(`Successfully uploaded ${artifact.name}`);
    return `Uploaded ${artifact.name}`;
  }

  /**
   * Takes a bunch of CLI arguments
   *
   * Returns a list of the files we should be packaging
   */
  private async filesToUpload(): Promise<string[]> {
    const { args, flags } = this.parse(Upload);

    let matched: string[] = [];

    if (args.globs) {
      matched = [...matched, ...(await globSet(args.globs))];
    }

    if (flags['files-from']) {
      if (flags['files-from'] !== '-' && !fs.existsSync(flags['files-from'])) {
        throw new Error(`Could not find file to read file list from: ${flags['files-from']}`);
      }

      const source: stream.Readable =
        flags['files-from'] === '-' ? process.stdin : fs.createReadStream(flags['files-from'], { encoding: 'utf8' });

      for await (const entry of splitAsyncIterator(source, args.null ? '\x00' : '\n')) {
        // guards trailing separator causing empty entry
        if (entry) {
          matched.push(entry);
        }
      }
    }

    return matched;
  }
}
