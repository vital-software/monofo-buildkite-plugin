import fs from 'fs';
import stream, { pipeline as pipelineSync } from 'stream';
import { promisify } from 'util';
import debug from 'debug';
import _ from 'lodash';
import split from 'split2';
import { globSet } from '../util/glob';

const pipeline = promisify(pipelineSync);

const log = debug('monofo:artifact:matcher');

/**
 * Utility class that can act as a writable stream of file name chunks, or receive globs
 */
class MatchedFiles extends stream.Writable {
  constructor(private _matched: string[] = []) {
    super({
      objectMode: true,
      write: (chunk: string, _encoding, next) => {
        this._matched.push(chunk);
        next();
      },
    });
  }

  async addGlobs(globs: string[]): Promise<void> {
    this._matched = [...this._matched, ...(await globSet(_.castArray(globs), { matchBase: false }))];
  }

  get matched() {
    return this._matched;
  }
}

export async function filesToUpload({
  filesFrom,
  globs,
  useNull = false,
}: {
  filesFrom?: string;
  globs?: string[];
  useNull?: boolean;
}): Promise<string[]> {
  if (!filesFrom && !globs) {
    return [];
  }

  const matched = new MatchedFiles();
  const matching: Promise<void>[] = [];

  if (globs) {
    matching.push(matched.addGlobs(globs));
  }

  if (filesFrom) {
    if (filesFrom !== '-' && !fs.existsSync(filesFrom)) {
      throw new Error(`Could not find file to read file list from: ${filesFrom}`);
    }

    log(`Reading from ${filesFrom !== '-' ? filesFrom : 'stdin'}`);
    const source: stream.Readable =
      filesFrom === '-' ? process.stdin : fs.createReadStream(filesFrom, { encoding: 'utf8', autoClose: true });

    matching.push(pipeline(source, split(useNull ? '\x00' : '\n'), matched));
  }

  await Promise.all(matching);
  return matched.matched;
}
