import * as fs from 'fs';
import { promisify } from 'util';
import nock = require('nock');
import rimrafSync = require('rimraf');
import { Artifact, ArtifactApi, ArtifactDownloader } from '../src/artifact';
import { fakeProcess } from './fixtures';

const rimraf = promisify(rimrafSync);

describe('ArtifactDownloader', () => {
  let api: ArtifactApi;
  let sut: ArtifactDownloader;

  beforeAll(() => {
    nock('https://example.com')
      .get('/some-object/foo.tar.lz4?bar=baz')
      .replyWithFile(200, `${__dirname}/artifacts/foo.tar.lz4`, {
        'Content-Type': 'application/json',
      });
  });

  beforeEach(() => {
    const search = jest.fn();
    api = { search };

    search.mockImplementation(() => {
      return Promise.resolve('https://example.com/some-object/foo.tar.lz4?bar=baz');
    });

    sut = new ArtifactDownloader(api);
  });

  afterAll(async () => {
    await rimraf('foo/');
  });

  it('can download and extract .tar.lz4 files correctly', async () => {
    process.env = fakeProcess();

    const artifact = new Artifact('foo.tar.lz4');
    const res = await sut.downloadAndExtract(artifact);

    expect(res).toBeUndefined();
    expect(fs.existsSync('foo/bar')).toBe(true);
  });
});
