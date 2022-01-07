import fs from 'fs';
import { promisify } from 'util';
import execa from 'execa';
import rimrafCb from 'rimraf';
import tempy from 'tempy';
import { Compression, compressors, inflator } from '../../src/artifacts/compression';
import { Artifact } from '../../src/artifacts/model';
import { fakeProcess, getFixturePath } from '../fixtures';

const rimraf = promisify(rimrafCb);

describe('compression', () => {
  let dir: string;

  beforeEach(() => {
    dir = tempy.directory();
    process.chdir(dir);

    process.env = fakeProcess();
  });

  afterEach(async () => {
    await rimraf(dir);
  });

  describe('inflator', () => {
    it('can download and inflate .tar.lz4 files correctly', async () => {
      const artifact = new Artifact('foo.tar.lz4');

      const res = await inflator(fs.createReadStream(getFixturePath('foo.tar.lz4')), artifact);
      expect(res.exitCode).toBe(0);

      expect(fs.existsSync(`${dir}`)).toBe(true);
      expect(fs.existsSync(`${dir}/foo/bar`)).toBe(true);
    });
  });

  describe('round-trip', () => {
    it.each([['gzip'], ['lz4'], ['desync']])('compression algorithm: %s', async (algo) => {
      const compression: Compression = compressors[algo];
      const compressed = `${dir}/test.${compression.extension}`;

      await expect(compression.checkEnabled()).resolves.toBeUndefined();

      const command: string[] = [getFixturePath('qux.tar'), '|', ...compression.deflateCmd(), '>', compressed];
      await execa('cat', command, { shell: true });

      expect(fs.existsSync(compressed)).toBe(true);

      await compression.inflate(fs.createReadStream(compressed), dir);

      expect(fs.existsSync(`${dir}/qux/quux`)).toBe(true);
    });
  });
});
