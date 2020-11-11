import path from 'path';
import { fakeProcess } from '../test/fixtures';
import { FileHasher } from './hash';

describe('class FileHasher', () => {
  describe('hashOne()', () => {
    it('receives changes and hashes file contents', async () => {
      process.env = fakeProcess();
      process.chdir(path.resolve(__dirname, '../test/projects/pure'));

      const hasher = new FileHasher();

      // Hashes are consistent
      expect(await hasher.hashMany(['foo.txt', 'bar.txt'])).toBe(await hasher.hashMany(['foo.txt', 'bar.txt']));

      // And order independent
      expect(await hasher.hashMany(['foo.txt', 'bar.txt'])).toBe(await hasher.hashMany(['bar.txt', 'foo.txt']));
    });
  });
});
