import * as fs from 'fs';
import { promisify } from 'util';
import { directory } from 'tempy';
import { filesToUpload } from '../../src/artifacts/matcher';
import { mergeBase, diff, revList } from '../../src/git';
import { fakeProcess, COMMIT } from '../fixtures';

const writeFile = promisify(fs.writeFile);

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve(COMMIT));

const mockRevList = revList as jest.Mock<Promise<string[]>>;
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

describe('artifact matcher', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  it('can match a list of files, null separated', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, `bar\n`);
      await writeFile(`${dir}/bar.txt`, `baz\n`);
      await writeFile(`${dir}/file-list.null.txt`, 'foo.txt\x00bar.txt\x00');

      const result = filesToUpload({
        filesFrom: `${dir}/file-list.null.txt`,
        useNull: true,
      });

      await expect(result).resolves.toHaveLength(2);
      expect(await result).toContain('foo.txt');
      expect(await result).toContain('bar.txt');
    });
  });

  it('can match a list of files, newline separated', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar\n');
      await writeFile(`${dir}/bar.txt`, 'baz\n');
      await writeFile(`${dir}/file-list.newline.txt`, 'foo.txt\nbar.txt\n');

      const result = filesToUpload({
        filesFrom: `${dir}/file-list.newline.txt`,
        useNull: false,
      });

      await expect(result).resolves.toHaveLength(2);
      expect(await result).toContain('foo.txt');
      expect(await result).toContain('bar.txt');
    });
  });

  it('can match a set of globs', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar\n');
      await writeFile(`${dir}/bar.txt`, 'baz\n');

      const result = filesToUpload({
        globs: ['*.txt'],
      });

      return expect(result).resolves.toHaveLength(2);
    });
  });
});
