import * as crypto from 'crypto';
import * as fs from 'fs';
import debug from 'debug';
import { count, plurals } from './util';

const log = debug('monofo:hash');

export const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

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
    log(`Hashing ${count(paths, 'path')}`);
    const hash = crypto.createHash('sha256');

    hash.update(
      (
        await Promise.all(
          paths.sort().map(async (matchingFile) => {
            return this.hashOne(matchingFile).then((h: string) => [matchingFile, h] as [string, string]);
          })
        )
      )
        .map((n) => n.join(','))
        .join(';')
    );

    return hash.digest('hex');
  }

  private static async contentHashOfFile(pathToFile: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const readStream = fs.createReadStream(pathToFile, { encoding: 'utf8' });

    for await (const chunk of readStream) {
      hash.update(chunk);
    }

    return hash.digest('hex');
  }
}
