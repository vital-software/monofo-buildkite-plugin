import path from 'path';
import getConfigs from '../src/config';

describe('getConfig()', () => {
  it('reads pipeline files and returns an array of config files - empty', async () => {
    process.chdir(__dirname);
    expect(await getConfigs()).toHaveLength(0);
  });

  it('reads pipeline files and returns an array of config files - simple', async () => {
    process.chdir(path.resolve(__dirname, 'projects/simple'));
    const config = await getConfigs();

    expect(config).toHaveLength(4);
    expect(config[0].name).toBe('foo');
    expect([config[1].name, config[2].name]).toContain('bar');
    expect([config[1].name, config[2].name]).toContain('qux');
    expect(config[3].name).toBe('baz');
  });
});
