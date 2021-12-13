import fs from 'fs';
import { download } from '../../src/artifacts/api';
import { Artifact } from '../../src/artifacts/model';
import Download from '../../src/commands/download';
import { fakeProcess, getFixturePath, testRun } from '../fixtures';

jest.mock('../../src/artifacts/api');

const mockDownload = download as jest.Mock<Promise<unknown>>;
mockDownload.mockImplementation((artifact: Artifact) => {
  return Promise.resolve(fs.createReadStream(getFixturePath(artifact.filename)));
});

describe('cmd download', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  it('returns help output', async () => {
    return expect(testRun(Download, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });

  it('exits with success if not given any file names to download', async () => {
    await expect(testRun(Download, [])).rejects.toThrowError('Missing 1 required arg');
  });

  it('downloads a single archive and inflates it', async () => {
    const { stderr } = await testRun(Download, ['-v', 'foo.tar.lz4']);
    expect(stderr).toContain('Downloading 1 artifact: foo');
    expect(stderr).toContain('Finished inflating .tar.lz4 archive');
    expect(fs.existsSync('foo/bar')).toBe(true);
  });

  it('downloads a multiple archives and inflates them', async () => {
    const { stderr } = await testRun(Download, ['-v', 'foo.tar.lz4', 'bar.tar.gz']);
    expect(stderr).toContain('Downloading 2 artifacts: foo, bar');
    expect(stderr).toContain('Finished inflating .tar.lz4 archive');
    expect(fs.existsSync('foo/bar')).toBe(true);
    expect(fs.existsSync('bar/baz')).toBe(true);
  });

  it('can process non-archive files', async () => {
    const { stderr } = await testRun(Download, ['-v', 'baz']);
    expect(stderr).toContain('Downloading 1 artifact: baz');
    expect(fs.existsSync('baz')).toBe(true);
  });

  it('can process uncompressed tar files', async () => {
    const { stderr } = await testRun(Download, ['-v', 'qux.tar']);
    expect(stderr).toContain('Downloading 1 artifact: qux');
    expect(fs.existsSync('qux/quux')).toBe(true);
  });
});
