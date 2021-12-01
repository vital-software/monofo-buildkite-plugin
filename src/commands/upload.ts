import fs from 'fs';
import stream, { pipeline as pipelineCb } from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import _ from 'lodash';
import split from 'split';
import { Arguments } from 'yargs';
import { ArtifactApi } from '../artifacts/api';
import { ArtifactDownloader } from '../artifacts/download';
import { ArtifactInflator } from '../artifacts/inflate';
import { Artifact } from '../artifacts/model';
import { BaseArgs, MonofoCommand, toCommand } from '../handler';
import { count, glob, globSet } from '../util';

const pipeline = promisify(pipelineCb);

const log = debug('monofo:cmd:upload');

interface UploadArguments extends BaseArgs {
  'glob-patterns': string[];
  'files-from'?: string;
  null: boolean;
}

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

async function upload(): Promise<void> {
  return Promise.resolve();
}

/**
 * Upload task
 *
 * Receives a list of references to files that exist locally?
 *
 * We support processing for tar uploads?
 *  - Stream the upload to stdin?
 *  - globs? probably the nicest interface
 */
const cmd: MonofoCommand<UploadArguments> = {
  command: 'upload',

  builder: (yargs) => {
    return yargs
      .positional('glob-patterns', {
        array: true,
        type: 'string',
        describe: 'A list of glob patterns to match files to upload',
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
    const files = await filesToUpload(args);

    if (files.length === 0) {
      log('No files to upload: nothing to do');
      return 'No files to upload: nothing to do';
    }

    log(`Uploading ${count(files, 'file')}`);

    await Promise.all(files.map(upload));
    return `Uploaded ${count(files, 'file')}`;

    // const artifacts: Artifact[] = _.castArray(args.artifacts).map((filename) => new Artifact(filename));
    // log(`Donwloading ${artifacts.length} artifacts: ${artifacts.map((a) => a.name).join(', ')}`);
    //
    // const downloader = new ArtifactDownloader(new ArtifactApi());
    // const inflator = new ArtifactInflator();
    //
    // return Promise.all(
    //   artifacts.map(async (artifact) => {
    //     return inflator.inflate(await downloader.download(artifact), artifact);
    //   })
    // ).then(() => 'All done');
  },
};

export = toCommand(cmd);
