import path from 'path';
import Config from '../src/config';
import { updateDecisions } from '../src/decide';
import { matchConfigs } from '../src/diff';
import { fakeProcess } from './fixtures';

async function getInclusionReasons(
  changedFiles: string[] = [],
  env = {}
): Promise<{ name: string; included: boolean | undefined; reason: string }[]> {
  process.env = fakeProcess(env);
  process.chdir(path.resolve(__dirname, './projects/kitchen-sink'));
  const configs = await Config.getAll(process.cwd());
  matchConfigs('foo', configs, changedFiles);
  await updateDecisions(configs);

  return configs.map((c) => ({
    name: c.monorepo.name,
    included: c.included,
    reason: c.reason.toString(),
  }));
}

describe('config.reason', () => {
  beforeAll(() => {
    process.env = fakeProcess();
  });

  const changedFiles = ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'];

  it('matches expected reasons', async () => {
    const reasons = await getInclusionReasons(changedFiles);

    expect(reasons).toStrictEqual([
      {
        name: 'branch-excluded',
        included: false,
        reason: 'a branches configuration which excludes the current branch',
      },
      { name: 'changed', included: false, reason: 'no matching changes' },
      { name: 'dependedon', included: true, reason: 'been pulled in by a depends_on from foo' },
      { name: 'excluded', included: false, reason: 'been forced NOT to by PIPELINE_NO_RUN_EXCLUDED' },
      { name: 'foo', included: true, reason: '1 matching change: foo/README.md' },
      { name: 'bar', included: false, reason: 'no matching changes' },
      { name: 'included', included: true, reason: 'been forced to by PIPELINE_RUN_INCLUDED' },
      { name: 'match-all', included: true, reason: '4 matching changes: all files match' },
      { name: 'match-all-false', included: false, reason: 'no matching changes' },
      { name: 'match-all-mixed', included: true, reason: '4 matching changes: all files match' },
      { name: 'match-all-true', included: true, reason: '4 matching changes: all files match' },
      { name: 'qux', included: false, reason: 'no matching changes' },
      { name: 'baz', included: true, reason: '1 matching change: baz/abc.ts' },
      { name: 'some-long-name', included: false, reason: 'no matching changes' },
      { name: 'unreferenced', included: true, reason: '4 matching changes: all files match' },
    ]);
  });

  it('matches expected reasons when PIPELINE_RUN_ALL=1', async () => {
    const reasons = await getInclusionReasons(changedFiles, {
      PIPELINE_RUN_ALL: '1',
    });

    expect(reasons).toStrictEqual([
      { name: 'branch-excluded', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'changed', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'dependedon', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'excluded', included: false, reason: 'been forced NOT to by PIPELINE_NO_RUN_EXCLUDED' },
      { name: 'foo', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'bar', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'included', included: true, reason: 'been forced to by PIPELINE_RUN_INCLUDED' },
      { name: 'match-all', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      {
        name: 'match-all-false',
        included: false,
        reason: 'opted-out of PIPELINE_RUN_ALL via monorepo.matches === false',
      },
      { name: 'match-all-mixed', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'match-all-true', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'qux', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'baz', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'some-long-name', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
      { name: 'unreferenced', included: true, reason: 'been forced to by PIPELINE_RUN_ALL' },
    ]);
  });

  it('matches expected reasons when PIPELINE_RUN_ONLY=pipeline.foo.yml', async () => {
    const reasons = await getInclusionReasons(changedFiles, {
      PIPELINE_RUN_ONLY: 'foo',
    });

    expect(reasons).toStrictEqual([
      { name: 'branch-excluded', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'changed', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'dependedon', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'excluded', included: false, reason: 'been forced NOT to by PIPELINE_NO_RUN_EXCLUDED' },
      { name: 'foo', included: true, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'bar', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'included', included: true, reason: 'been forced to by PIPELINE_RUN_INCLUDED' },
      { name: 'match-all', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'match-all-false', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'match-all-mixed', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'match-all-true', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'qux', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'baz', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'some-long-name', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
      { name: 'unreferenced', included: false, reason: 'PIPELINE_RUN_ONLY specified' },
    ]);
  });

  it('pure cache hit', async () => {
    const reasons = await getInclusionReasons();

    expect(reasons).toStrictEqual([
      {
        name: 'branch-excluded',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'changed',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'dependedon',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'excluded',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'foo',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'bar',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'included',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'match-all',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'match-all-false',
        included: false,
        reason: 'no previous successful build, task fallback to being excluded',
      },
      {
        name: 'match-all-mixed',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'match-all-true',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'qux',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'baz',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'some-long-name',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
      {
        name: 'unreferenced',
        included: true,
        reason: 'no previous successful build, fallback to being included',
      },
    ]);
  });

  it("doesn't match a previous build", async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, './projects/kitchen-sink'));
    const configs = await Config.getAll(process.cwd());
    await updateDecisions(configs);

    const reasons = configs.map((c) => ({
      name: c.monorepo.name,
      included: c.included,
      reason: c.reason.toString(),
    }));

    expect(reasons).toStrictEqual([
      { name: 'branch-excluded', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'changed', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'dependedon', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'excluded', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'foo', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'bar', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'included', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'match-all', included: true, reason: 'no previous successful build, fallback to being included' },
      {
        name: 'match-all-false',
        included: false,
        reason: 'no previous successful build, task fallback to being excluded',
      },
      { name: 'match-all-mixed', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'match-all-true', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'qux', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'baz', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'some-long-name', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'unreferenced', included: true, reason: 'no previous successful build, fallback to being included' },
    ]);
  });
});
