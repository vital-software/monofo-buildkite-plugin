import path from 'path';
import Config from './config';

describe('getConfig()', () => {
  it('reads pipeline files and returns an array of config files - empty', async () => {
    process.chdir(__dirname);
    expect(await Config.getAll()).toHaveLength(0);
  });

  it('reads pipeline files and returns an array of config files - simple', async () => {
    process.chdir(path.resolve(__dirname, '../test/projects/kitchen-sink'));
    const configNames = (await Config.getAll()).map((c) => c.monorepo.name);
    expect(configNames).toHaveLength(10);
    expect(configNames).toStrictEqual([
      'changed',
      'dependedon',
      'excluded',
      'foo',
      'bar',
      'included',
      'qux',
      'baz',
      'some-long-name',
      'unreferenced',
    ]);
  });
});
