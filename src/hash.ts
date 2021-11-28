import * as crypto from 'crypto';
import * as fs from 'fs';
import debug from 'debug';
import asyncPool from 'tiny-async-pool';
import { count } from './util';

const log = debug('monofo:hash');

export const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const CONCURRENCY = Number(process.env?.HASH_CONCURRENCY) || 8;

export class FileHasher {
  /**
   * Static memoization of path to promise of hash value (may still be in progress)
   */
  private static fileCache: Record<string, Promise<string>> = {};

  public async hashOne(path: string): Promise<string> {
    if (!(path in FileHasher.fileCache)) {
      try {
        FileHasher.fileCache[path] = FileHasher.contentHashOfFile(path);
      } catch (e) {
        log('Failed to hash file, using fallback value', e);
        FileHasher.fileCache[path] = Promise.resolve(EMPTY_HASH); // Cache the negative result too
      }
    }

    return FileHasher.fileCache[path];
  }

  public async hashMany(paths: string[]): Promise<string> {
    log(`Hashing ${count(paths, 'path')} with concurrency ${CONCURRENCY}`);
    const hash = crypto.createHash('sha256');

    const manifest = await asyncPool(CONCURRENCY, paths.sort(), async (path: string) =>
      this.hashOne(path).then((h: string) => [path, h] as [string, string])
    );

    hash.update(manifest.map((n) => n.join(',')).join(';'));

    return hash.digest('hex');
  }

  private static async contentHashOfFile(pathToFile: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const readStream = fs.createReadStream(pathToFile, { encoding: 'utf8' });

    for await (const chunk of readStream) {
      hash.update(chunk as string);
    }

    return hash.digest('hex');
  }
}
