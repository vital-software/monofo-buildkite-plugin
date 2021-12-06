import * as fs from 'fs';
import { promisify } from 'util';
import { directory } from 'tempy';
import upload from '../../src/cmd/upload';
import { mergeBase, diff, revList } from '../../src/git';
import { fakeProcess, COMMIT } from '../fixtures';
import execSync from './exec';

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

  it('can output help information', async () => {
    return expect(execSync(upload, 'upload --help')).resolves.toContain(
      'Produces a compressed tarball artifact from a given list of globs'
    );
  });

  it('fails if not given an output file name to upload', async () => {
    return expect(execSync(upload, 'upload --files-from -')).rejects.toThrowError('Must be given an output');
  });

  it('can upload a list of files, null separated', async () => {
    await directory.task(async (dir) => {
      await writeFile(`${dir}/foo.txt`, 'bar');
      await writeFile(`${dir}/bar.txt`, 'baz');
      await writeFile(`${dir}/file-list.null.txt`, 'foo.txt\x00bar.txt');

      await expect(
        execSync(upload, `upload --files-from "${dir}/file-list.null.txt" --null some-upload.tar.gz *.txt`)
      ).resolves.toContain('uploaded');
    });
  });
});
