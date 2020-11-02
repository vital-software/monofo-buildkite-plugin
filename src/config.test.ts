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

    expect(config).toHaveLength(7);
    expect(config[0].name).toBe('changed');
    expect(config[1].name).toBe('dependedon');
    expect(config[2].name).toBe('foo');
    expect([config[3].name, config[2].name]).toContain('bar');
    expect([config[4].name, config[2].name]).toContain('qux');
    expect(config[5].name).toBe('baz');
    expect(config[6].name).toBe('unreferenced');
  });
});
