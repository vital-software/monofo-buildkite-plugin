import fs from 'fs';
import { promisify } from 'util';
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

      await inflator(fs.createReadStream(getFixturePath('foo.tar.lz4')), artifact);

      expect(fs.existsSync(`${dir}`)).toBe(true);
      expect(fs.existsSync(`${dir}/foo/bar`)).toBe(true);
    });
  });

  describe('round-trip', () => {
    it.each([['tar.gz'], ['tar.lz4'], ['caidx']])('compression algorithm: %s', async (extension) => {
      const compression: Compression = compressors[extension];
      const compressed = `${dir}/test.${extension}`;

      await compression.deflate({
        output: new Artifact(compressed),
        tarStream: fs.createReadStream(getFixturePath('qux.tar')),
      });

      expect(fs.existsSync(compressed)).toBe(true);

      await compression.inflate({ input: fs.createReadStream(compressed), outputPath: dir });

      expect(fs.existsSync(`${dir}/qux/quux`)).toBe(true);
    });
  });
});
