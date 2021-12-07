import * as fs from 'fs';
import { promisify } from 'util';
import { directory } from 'tempy';
import Upload from '../../src/commands/upload';
import { fakeProcess, testRun } from '../fixtures';

const writeFile = promisify(fs.writeFile);

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

      const { stderr } = await testRun(Upload, [
        '--files-from',
        `${dir}/file-list.null.txt`,
        '--null',
        'some-upload.tar.gz',
      ]);

      expect(stderr).toContain('Finished deflating .gz file');
      expect(stderr).toContain('Successfully uploaded some-upload');
    });
  });

  it('can upload a with globs', async () => {
    await directory.task(async (dir) => {
      process.chdir(dir);

      await writeFile(`${dir}/foo.txt`, 'bar');
      await writeFile(`${dir}/bar.txt`, 'baz');

      const { stderr } = await testRun(Upload, ['some-upload.tar.gz', '*.txt']);

      expect(stderr).toContain('Finished deflating .gz file');
      expect(stderr).toContain('Successfully uploaded some-upload');
    });
  });
});
