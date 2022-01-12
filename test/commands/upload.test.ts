import * as fs from 'fs';
import { promisify } from 'util';
import mkdirp from 'mkdirp';
import tempy from 'tempy';
import { upload } from '../../src/artifacts/api';
import Upload from '../../src/commands/upload';
import { fakeProcess, testRun } from '../fixtures';

const writeFile = promisify(fs.writeFile);

jest.mock('../../src/artifacts/api');

const mockUpload = upload as jest.Mock<Promise<unknown>>;
mockUpload.mockImplementation(() => Promise.resolve('done'));

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
    await tempy.directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar');
      await writeFile(`${dir}/bar.txt`, 'baz');
      await writeFile(`${dir}/file-list.null.txt`, 'foo.txt\x00bar.txt\x00');

      const { stderr } = await testRun(Upload, [
        '--null',
        '--files-from',
        `${dir}/file-list.null.txt`,
        'some-upload.tar.gz',
      ]);

      expect(stderr).toContain('Successfully uploaded some-upload');
    });
  });

  it('can upload a list of directories in the right order, null separated', async () => {
    await tempy.directory.task(async (dir) => {
      process.chdir(dir);

      await mkdirp(`${dir}/foo/bar`);
      await mkdirp(`${dir}/foo/baz`);
      +(await writeFile(`${dir}/foo/bar/a.txt`, 'a'));
      await writeFile(`${dir}/foo/bar/b.txt`, 'b');
      await writeFile(`${dir}/foo/baz/a.txt`, 'a');
      await writeFile(`${dir}/foo/baz/b.txt`, 'b');
      await writeFile(`${dir}/foo/a.txt`, 'a');
      await writeFile(`${dir}/foo/b.txt`, 'b');

      // This file list is in the wrong order! https://github.com/folbricht/desync/issues/210
      await writeFile(`${dir}/file-list.null.txt`, './foo/bar\x00./foo/\x00./foo/baz/\x00');

      const { stderr } = await testRun(Upload, [
        '--null',
        '--files-from',
        `${dir}/file-list.null.txt`,
        'some-upload.tar.gz',
      ]);

      expect(stderr).toContain("Uploading 3 paths as some-upload.tar.gz [ './foo/', './foo/bar', './foo/baz/' ]");
      expect(stderr).toContain('Successfully uploaded some-upload');
    });
  });

  it('can upload a with globs', async () => {
    await tempy.directory.task(async (dir: string) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar');
      await writeFile(`${dir}/bar.txt`, 'baz');

      const { stderr } = await testRun(Upload, ['some-upload.tar.gz', '*.txt']);

      expect(stderr).toContain('Successfully uploaded some-upload');
    });
  });
});
