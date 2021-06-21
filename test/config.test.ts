import fsCb from 'fs';
import path from 'path';
import Config from '../src/config';

const fs = fsCb.promises;

describe('getConfig()', () => {
  it('reads pipeline files and returns an array of config files - no such directory', async () => {
    const tmpDir: string = await fs.mkdtemp('/tmp/');
    expect(await Config.getAll(tmpDir)).toHaveLength(0);
  });

  it('reads pipeline files and returns an array of config files - simple', async () => {
    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/kitchen-sink'))).map(
      (c) => c.monorepo.name
    );
    expect(configNames).toHaveLength(13);
    expect(configNames).toStrictEqual([
      'changed',
      'dependedon',
      'excluded',
      'foo',
      'bar',
      'included',
      'match-all',
      'match-all-boolean',
      'match-all-mixed',
      'qux',
      'baz',
      'some-long-name',
      'unreferenced',
    ]);
  });

  it('reads pipeline files and returns an array of config files - invalid', async () => {
    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/invalid'))).map((c) => c.monorepo.name);
    expect(configNames).toHaveLength(1);
    expect(configNames).toStrictEqual(['invalid']);
  });
});
