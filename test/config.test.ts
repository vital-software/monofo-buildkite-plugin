import fsCb from 'fs';
import { Step } from '../src/buildkite/types';
import Config from '../src/config';
import { fakeProcess, getProjectFixturePath } from './fixtures';

const fs = fsCb.promises;

function configSteps(configs: Config[]): Step[] {
  return [...configs.flatMap((config) => config.allSteps())];
}

function configOuterSteps(configs: Config[]): Step[] {
  return [...configs.flatMap((config) => config.outerSteps())];
}

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

  describe('allSteps()', () => {
    it('reads pipeline files and can iterate over steps - group', async () => {
      expect(await configNames('groups')).toStrictEqual(['foo1', 'foo2', 'foo3', 'foo4']);
      expect(configSteps(await Config.getAll(getProjectFixturePath('groups'))).map((step) => step.key)).toStrictEqual([
        'foo1',
        'foo1-group',
        'foo2',
        'foo1-group', // Note: merging groups with the same key together hasn't happened at this point
        'foo3',
        'foo3-group',
        'foo4',
        'foo4-group',
      ]);
    });
  });

  describe('outerSteps()', () => {
    it('reads pipeline files and can iterate over steps - group', async () => {
      const names = await configNames('groups');
      const steps = [...configOuterSteps(await Config.getAll(getProjectFixturePath('groups')))];
      expect(names).toStrictEqual(['foo1', 'foo2', 'foo3', 'foo4']);

      // Note: merging groups with the same key together hasn't happened at this point
      expect(steps.map((step) => step.key)).toStrictEqual(['foo1-group', 'foo1-group', 'foo3-group', 'foo4-group']);
    });
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
