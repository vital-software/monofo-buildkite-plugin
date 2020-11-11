import * as crypto from 'crypto';
import * as fs from 'fs';
import debug from 'debug';

const log = debug('monofo:hash');

export const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

export class FileHasher {
  /**
   * Memoization of path to promise of hash value (may still be in progress)
   */
  private readonly fileCache: Record<string, Promise<string>> = {};

  public async hashOne(pathToFile: string): Promise<string> {
    if (!(pathToFile in this.fileCache)) {
      try {
        this.fileCache[pathToFile] = FileHasher.contentHashOfFile(pathToFile);
      } catch (e) {
        log('Failed to hash file, using fallback value', e);
        this.fileCache[pathToFile] = Promise.resolve(EMPTY_HASH); // Cache the negative result too
      }
    }

    return this.fileCache[pathToFile];
  }

  public async hashMany(pathToFiles: string[]): Promise<string> {
    const hash = crypto.createHash('sha256');

    hash.update(
      (
        await Promise.all(
          pathToFiles.sort().map(async (matchingFile) => {
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
