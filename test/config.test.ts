import fsCb from 'fs';
import path from 'path';
import Config from '../src/config';
import { fakeProcess, getProjectFixturePath } from './fixtures';

const fs = fsCb.promises;

async function configNames(scenario: string): Promise<string[]> {
  return (await Config.getAll(getProjectFixturePath(scenario))).map((c) => c.monorepo.name);
}

describe('getConfig()', () => {
  it('reads pipeline files and returns an array of config files - no such directory', async () => {
    const tmpDir: string = await fs.mkdtemp('/tmp/');
    expect(await Config.getAll(tmpDir)).toHaveLength(0);
  });

  it('reads pipeline files and returns an array of config files - simple', async () => {
    const names = await configNames('kitchen-sink');
    expect(names).toHaveLength(16);
    expect(names).toStrictEqual([
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
    const names = await configNames('invalid');
    expect(names).toHaveLength(1);
    expect(names).toStrictEqual(['invalid']);
  });

  it('reads pipeline files - custom glob', async () => {
    process.env = fakeProcess({
      PIPELINE_FILE_GLOB: '**/pipeline.foo*.yml', // excludes foo1
    });

    const names = await configNames('flexible-structure');
    expect(names).toHaveLength(2);
    expect(names).toStrictEqual(['foo2', 'foo3']);
  });

  it('reads pipeline files - custom ignore glob', async () => {
    process.env = fakeProcess({
      PIPELINE_FILE_IGNORE_GLOB: '**/node_modules/**:foo/**', // excludes foo2
    });

    const names = await configNames('flexible-structure');
    expect(names).toHaveLength(2);
    expect(names).toStrictEqual(['foo1', 'foo3']);
  });
});
