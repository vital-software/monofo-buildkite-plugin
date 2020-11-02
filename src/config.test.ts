import path from 'path';
import getConfigs from './config';

describe('getConfig()', () => {
  it('reads pipeline files and returns an array of config files - empty', async () => {
    process.chdir(__dirname);
    expect(await getConfigs()).toHaveLength(0);
  });

  it('reads pipeline files and returns an array of config files - simple', async () => {
    process.chdir(path.resolve(__dirname, '../test/projects/kitchen-sink'));
    const config = await getConfigs();

    expect(config).toHaveLength(9);
    expect(config.map((c) => c.monorepo.name)).toStrictEqual([
      'changed',
      'dependedon',
      'excluded',
      'foo',
      'bar',
      'included',
      'qux',
      'baz',
      'unreferenced',
    ]);
  });
});
