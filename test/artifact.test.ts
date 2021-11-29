import { Artifact } from '../src/artifact';

describe('artifact', () => {
  it.todo('can find a download URL');
  it.todo('can download the file');

  it('can extract .tar.lz4 files correctly', async () => {
    const sut = new Artifact('some-filename.tar.lz4');
    const res = sut.downloadAndExtract();

    await expect(res).resolves.toBeUndefined();
  });

  it.todo('can extract .tar.cbidx file correctly');
});
