import * as fs from 'fs';
import { promisify } from 'util';
import rimrafSync from 'rimraf';
import { ArtifactInflator } from '../../src/artifacts/inflate';
import { Artifact } from '../../src/artifacts/model';
import { fakeProcess } from '../fixtures';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const rimraf = promisify(rimrafSync);

describe('ArtifactInflator', () => {
  let sut: ArtifactInflator;

  beforeEach(() => {
    sut = new ArtifactInflator();
  });

  afterAll(async () => {
    await rimraf('foo/');
  });

  it('can download and inflate .tar.lz4 files correctly', async () => {
    process.env = fakeProcess();

    const artifact = new Artifact('foo.tar.lz4');
    const res = await sut.inflate(fs.createReadStream(`${__dirname}/../fixtures/foo.tar.lz4`), artifact);

    expect(res).toBeUndefined();
    expect(fs.existsSync('foo/bar')).toBe(true);
  });
});
