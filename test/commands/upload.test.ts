import { promises as fs } from 'fs';
import execa from 'execa';
import mkdirp from 'mkdirp';
import tempy from 'tempy';
import { upload } from '../../src/artifacts/api';
import Upload from '../../src/commands/upload';
import { tar } from '../../src/util/tar';
import { fakeProcess, testRun } from '../fixtures';

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

      await fs.writeFile(`${dir}/foo.txt`, 'bar');
      await fs.writeFile(`${dir}/bar.txt`, 'baz');
      await fs.writeFile(`${dir}/file-list.null.txt`, './foo.txt\x00./bar.txt\x00');

      const { stderr } = await testRun(Upload, [
        '--null',
        '--files-from',
        `${dir}/file-list.null.txt`,
        'some-upload.tar.gz',
      ]);

      expect(stderr).toContain('Successfully uploaded some-upload');
    });
  });

  it('can expect to be given a list of disparate directories, null separated, must produce catar-like tree', async () => {
    await tempy.directory.task(async (dir) => {
      process.chdir(dir);

      await mkdirp(`${dir}/a/b/c/d`);
      await mkdirp(`${dir}/e/f/g/h`);

      await fs.writeFile(`${dir}/a/b/c/d/foo.txt`, 'bar');
      await fs.writeFile(`${dir}/e/f/g/h/bar.txt`, 'baz');
      await fs.writeFile(`${dir}/file-list.null.txt`, './a/b/c/d\x00./e/f/g/h\x00');

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
    jest.setTimeout(100000000);

    await tempy.directory.task(async (dir) => {
      process.chdir(dir);

      await mkdirp(`${dir}/foo/bar`);
      await mkdirp(`${dir}/foo/baz`);
      await mkdirp(`${dir}/foo/qux/quux`);

      await fs.writeFile(`${dir}/foo/bar/a.txt`, 'a');
      await fs.writeFile(`${dir}/foo/bar/b.txt`, 'b');
      await fs.writeFile(`${dir}/foo/baz/a.txt`, 'a');
      await fs.writeFile(`${dir}/foo/baz/b.txt`, 'b');
      await fs.writeFile(`${dir}/foo/qux/quux/a.txt`, 'a');
      await fs.writeFile(`${dir}/foo/qux/quux/b.txt`, 'b');
      await fs.writeFile(`${dir}/foo/a.txt`, 'a');
      await fs.writeFile(`${dir}/foo/b.txt`, 'b');

      // This file list is missing the foo parent! https://github.com/folbricht/desync/issues/210
      await fs.writeFile(`${dir}/file-list.null.txt`, './foo/bar\x00./foo/baz/\x00');

      const { stderr } = await testRun(Upload, [
        '--null',
        '--files-from',
        `${dir}/file-list.null.txt`,
        'some-upload.tar.gz',
        'foo/qux/**/*.txt',
      ]);

      expect(stderr).toContain("Adding intermediate directories to upload [ './foo/qux/quux', './foo/qux', './foo' ]");
      expect(stderr).toContain('Globs and file input matched 4 paths');
      expect(stderr).toContain('Successfully uploaded some-upload');

      const res = await execa((await tar()).bin, ['-tzf', `${dir}/some-upload.tar.gz`]);
      expect(res.stdout).toContain('foo');
    });
  });

  it('can upload a with globs', async () => {
    await tempy.directory.task(async (dir: string) => {
      process.chdir(dir);

      await fs.writeFile(`${dir}/foo.txt`, 'bar');
      await fs.writeFile(`${dir}/bar.txt`, 'baz');

      const { stderr } = await testRun(Upload, ['some-upload.tar.gz', '*.txt']);

      expect(stderr).toContain('Successfully uploaded some-upload');
    });
  });

  it('works functionally on ./src/ here', async () => {
    process.chdir(`${__dirname}/../../`);
    const { stderr } = await testRun(Upload, ['src.caidx', './src/']);
    expect(stderr).toContain('Successfully uploaded src');
  }, 60000);
});
