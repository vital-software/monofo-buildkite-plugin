import * as fs from 'fs';
import { promisify } from 'util';
import rimrafSync from 'rimraf';
import tempy from 'tempy';
import { inflator } from '../../src/artifacts/compression';
import { Artifact } from '../../src/artifacts/model';
import { fakeProcess } from '../fixtures';

const rimraf = promisify(rimrafSync);

describe('compression', () => {
  let dir: string;

  beforeAll(() => {
    dir = tempy.directory();
    process.chdir(dir);

    process.env = fakeProcess();
  });

  afterAll(async () => {
    await rimraf(dir);
  });

  describe('inflator', () => {
    it('can download and inflate .tar.lz4 files correctly', async () => {
      const artifact = new Artifact('foo.tar.lz4');

      const res = await inflator(fs.createReadStream(`${__dirname}/../fixtures/foo.tar.lz4`), artifact);
      expect(res.exitCode).toBe(0);

      expect(fs.existsSync(`${dir}`)).toBe(true);
      expect(fs.existsSync(`${dir}/foo/bar`)).toBe(true);
    });
  });
});
