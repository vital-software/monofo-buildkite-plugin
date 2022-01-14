import * as fs from 'fs';
import { promisify } from 'util';
import { directory } from 'tempy';
import { addIntermediateDirectories, PathsToPack, pathsToPack } from '../../src/artifacts/matcher';
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
      await writeFile(`${dir}/file-list.null.txt`, './foo.txt\x00./bar.txt\x00');

      const result = await pathsToPack({
        filesFrom: `${dir}/file-list.null.txt`,
        useNull: true,
      });

      expect(result['./foo.txt']).toStrictEqual({ recurse: true });
      expect(result['./bar.txt']).toStrictEqual({ recurse: true });
      expect(Object.keys(result)).toHaveLength(2);
    });
  });

  it('can match a list of files, newline separated', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar\n');
      await writeFile(`${dir}/bar.txt`, 'baz\n');
      await writeFile(`${dir}/file-list.newline.txt`, './foo.txt\n./bar.txt\n');

      const result = await pathsToPack({
        filesFrom: `${dir}/file-list.newline.txt`,
        useNull: false,
      });

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['./foo.txt']).toStrictEqual({ recurse: true });
      expect(result['./bar.txt']).toStrictEqual({ recurse: true });
    });
  });

  it('can match a set of globs', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar\n');
      await writeFile(`${dir}/bar.txt`, 'baz\n');

      const result = await pathsToPack({
        globs: ['*.txt'],
      });

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['./foo.txt']).toStrictEqual({ recurse: false });
      expect(result['./bar.txt']).toStrictEqual({ recurse: false });
    });
  });
});

describe('add intermediate directories', () => {
  it('adds intermediate dirs', () => {
    const paths: PathsToPack = {
      'a/b/c/foo.txt': { recurse: false },
      'd/e/f/blah.txt': { recurse: false },
      'h/i/j': { recurse: true },
    };

    const result = addIntermediateDirectories(paths);

    expect(Object.keys(result)).toStrictEqual([
      'a',
      'a/b',
      'a/b/c',
      'a/b/c/foo.txt',
      'd',
      'd/e',
      'd/e/f',
      'd/e/f/blah.txt',
      'h',
      'h/i',
      'h/i/j',
    ]);
  });
});
