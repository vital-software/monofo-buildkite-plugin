import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import execa from 'execa';
import rimrafSync from 'rimraf';
import tempy from 'tempy';
import { Compression, compressors, deflator, inflator } from '../../src/artifacts/compression';
import { Artifact } from '../../src/artifacts/model';
import { stdoutReadable } from '../../src/util/exec';
import { fakeProcess, getFixturePath } from '../fixtures';

const writeFile = promisify(fs.writeFile);
const rimraf = promisify(rimrafSync);
const pipeline = promisify(stream.pipeline);

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
      const compressed = `test.tar.${compression.extension}`;

      await writeFile(`${dir}/foo.txt`, 'Some test file');
      await writeFile(`${dir}/bar.txt`, 'Some other test file');
      await execa('tar', ['-cf', 'test.tar', `${dir}/foo.txt`, `${dir}/bar.txt`]);

      const source = fs.createReadStream('test.tar');
      const destination = fs.createWriteStream(compressed);

      await compression.deflate(source).then(async (deflated) => pipeline(deflated, destination));

      expect(fs.existsSync(`test.tar.${compression.extension}`)).toBe(true);
    });
  });
});
