import fs from 'fs';
import stream, { pipeline as pipelineCb } from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import execa from 'execa';
import split from 'split';
import { Arguments } from 'yargs';
import { ArtifactDeflator } from '../artifacts/deflate';
import { Artifact } from '../artifacts/model';
import { BaseArgs, MonofoCommand, toCommand } from '../handler';
import { count, globSet, tar, stdinWritable, stdoutReadable } from '../util';

const pipeline = promisify(pipelineCb);

const log = debug('monofo:cmd:upload');

interface UploadArguments extends BaseArgs {
  output: string;

  'glob-patterns': string[];
  'files-from'?: string;
  null: boolean;
}

/**
 * Takes a bunch of CLI arguments
 *
 * Returns a list of the files we should be packaging
 */
async function filesToUpload(args: Arguments<UploadArguments>): Promise<string[]> {
  let matched: string[] = [];

  if (args['glob-patterns']) {
    matched = [...matched, ...(await globSet(args['glob-patterns']))];
  }

  if (args['files-from']) {
    if (args['files-from'] !== '-' && !fs.existsSync(args['files-from'])) {
      throw new Error(`Could not find file to read file list from: ${args['files-from']}`);
    }

    const source: stream.Readable =
      args['files-from'] === '-' ? process.stdin : fs.createReadStream(args['files-from']);
    const byEntry: stream.Readable = source.pipe(split(args.null ? '\x00' : '\n'));

    for await (const entry of byEntry) {
      matched.push(entry as string);
    }
  }

  return matched;
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
const cmd: MonofoCommand<UploadArguments> = {
  command: 'upload',

  describe: 'Produces a compressed tarball artifact from a given list of globs, and uploads it to Buildkite Artifacts',

  builder: (yargs) => {
    return yargs
      .positional('output', {
        array: false,
        type: 'string',
        describe: 'The output file to produce (foo.tar.lz4 or bar.tar.caidx, etc.)',
        demandOption: true,
      })
      .positional('glob-patterns', {
        array: true,
        type: 'string',
        describe: 'A list of glob patterns; matching files are included in the artifact upload',
        default: [],
      })
      .option('files-from', {
        type: 'string',
        describe: 'A path to a file containing a list of files to upload, or - to use stdin',
        requiresArg: true,
      })
      .option('null', {
        type: 'boolean',
        describe: "If given, the list of files is expected to be null-separated (a la find's -print0)",
        default: false,
      });
  },

  async handler(args: Arguments<UploadArguments>): Promise<string> {
    const artifact = new Artifact(args.output);
    const files = await filesToUpload(args);

    if (files.length === 0) {
      log('No files to upload: nothing to do');
      return 'No files to upload: nothing to do';
    }

    log(`Uploading ${count(files, 'file')} as ${args.output}`);

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
  },
};

export = toCommand(cmd);
