import { createReadStream, existsSync } from 'fs';
import { promisify } from 'util';
import rimrafCb from 'rimraf';
import tempy from 'tempy';
import { Compressor, compressors, inflator } from '../../src/artifacts/compression';
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

      await inflator(createReadStream(getFixturePath('foo.tar.lz4')), artifact);

      expect(existsSync(`${dir}`)).toBe(true);
      expect(existsSync(`${dir}/foo/bar`)).toBe(true);
    });
  });

  describe('round-trip', () => {
    it.each([['tar.gz'], ['tar.lz4'], ['catar.caibx']])('compression algorithm: %s', async (extension) => {
      const compressor: Compressor = compressors[extension];

      const compressed = `${dir}/test.${extension}`;
      const artifact = new Artifact(compressed);

      await compressor.deflate({ artifact, input: { tarPath: getFixturePath('qux.tar') } });

      expect(existsSync(compressed)).toBe(true);

      await compressor.inflate({ input: createReadStream(compressed), artifact, outputPath: dir });
      expect(existsSync(`${dir}/qux/quux`)).toBe(true);
    });
  });
});
