import * as fs from 'fs';
import { promisify } from 'util';
import { directory } from 'tempy';
import Upload from '../../src/commands/upload';
import { mergeBase, diff, revList } from '../../src/git';
import { fakeProcess, COMMIT, testRun } from '../fixtures';

const writeFile = promisify(fs.writeFile);

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve(COMMIT));

const mockRevList = revList as jest.Mock<Promise<string[]>>;
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

describe('cmd upload', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  it('returns help output', async () => {
    return expect(testRun(Upload, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });

  it('fails if not given an output file name to upload', async () => {
    return expect(testRun(Upload, ['--files-from', '-'])).rejects.toThrowError('Missing 1 required arg');
  });

  it('can upload a list of files, null separated', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar');
      await writeFile(`${dir}/bar.txt`, 'baz');
      await writeFile(`${dir}/file-list.null.txt`, 'foo.txt\x00bar.txt');

      const { stdout } = await testRun(Upload, [
        '--files-from',
        `${dir}/file-list.null.txt`,
        '--null',
        'some-upload.tar.gz',
      ]);

      expect(stdout).toContain('uploaded');
    });
  });

  it('can upload a with globs', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar');
      await writeFile(`${dir}/bar.txt`, 'baz');

      const { stdout } = await testRun(Upload, ['some-upload.tar.gz', '*.txt']);

      expect(stdout).toContain('uploaded');
    });
  });
});
