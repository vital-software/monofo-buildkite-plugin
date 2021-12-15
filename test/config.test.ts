import fsCb from 'fs';
import path from 'path';
import Config from '../src/config';
import { fakeProcess } from './fixtures';

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
    expect(configNames).toHaveLength(16);
    expect(configNames).toStrictEqual([
      'branch-excluded',
      'changed',
      'dependedon',
      'excluded',
      'foo',
      'bar',
      'included',
      'match-all',
      'match-all-env',
      'match-all-false',
      'match-all-mixed',
      'match-all-true',
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

  it('reads pipeline files - custom glob', async () => {
    process.env = fakeProcess({
      PIPELINE_FILE_GLOB: '**/pipeline.foo*.yml', // excludes foo1
    });

    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/flexible-structure'))).map(
      (c) => c.monorepo.name
    );
    expect(configNames).toHaveLength(2);
    expect(configNames).toStrictEqual(['foo2', 'foo3']);
  });

  it('reads pipeline files - custom ignore glob', async () => {
    process.env = fakeProcess({
      PIPELINE_FILE_IGNORE_GLOB: '**/node_modules/**:foo/**', // excludes foo2
    });

    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/flexible-structure'))).map(
      (c) => c.monorepo.name
    );
    expect(configNames).toHaveLength(2);
    expect(configNames).toStrictEqual(['foo1', 'foo3']);
  });
});
