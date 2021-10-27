import path from 'path';
import { createTables, startDb, stopDb } from 'jest-dynalite';
import { CacheMetadataRepository } from '../src/cache-metadata';
import Config from '../src/config';
import { updateDecisions } from '../src/decide';
import { matchConfigs } from '../src/diff';
import { service } from '../src/dynamodb';
import { BUILD_ID_2, BUILD_ID_3, fakeProcess } from './fixtures';

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
  beforeAll(startDb);
  beforeAll(createTables);
  afterAll(stopDb);

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
        reason: 'been opted-out of PIPELINE_RUN_ALL via monorepo.matches === false',
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
      { name: 'branch-excluded', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'changed', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'dependedon', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'excluded', included: false, reason: 'been forced NOT to by PIPELINE_NO_RUN_EXCLUDED' },
      { name: 'foo', included: true, reason: 'been forced to by PIPELINE_RUN_ONLY' },
      { name: 'bar', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'included', included: true, reason: 'been forced to by PIPELINE_RUN_INCLUDED' },
      { name: 'match-all', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'match-all-false', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'match-all-mixed', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'match-all-true', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'qux', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'baz', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'some-long-name', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
      { name: 'unreferenced', included: false, reason: 'been forced NOT to by PIPELINE_RUN_ONLY' },
    ]);
  });

  it("matches expected reasons when there isn't a previous build", async () => {
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
        reason: 'no previous successful build, fallback to being excluded',
      },
      { name: 'match-all-mixed', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'match-all-true', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'qux', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'baz', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'some-long-name', included: true, reason: 'no previous successful build, fallback to being included' },
      { name: 'unreferenced', included: true, reason: 'no previous successful build, fallback to being included' },
    ]);
  });

  it('matches expected reasons when cache hits/misses', async () => {
    process.env = fakeProcess({ BUILDKITE_PIPELINE_SLUG: 'pure-hit' });
    process.chdir(path.resolve(__dirname, './projects/pure'));

    const repo = new CacheMetadataRepository(service);

    /*
     * Content hashes are generated by calculating sha256 hashes of each file matched by the pipeline,
     * including the pipeline yaml itself, then sorted, in this format:
     * filename,hash;filename,hash
     * e.g.
     * foo/README.md,6ec4b343b32477ad0edc4e195f6e0cd5317933eb3406436b373f9af54a660e08;foo/pipeline.yml,cf49c2a55e4d39909401d8e459885ae4c53120a0fa91496a3ad5647cbcc4f7f2
     *
     * Then sha256 hashing the resulting string again
     *
     * > echo -n "foo/README.md,6ec4b343b32477ad0edc4e195f6e0cd5317933eb3406436b373f9af54a660e08;foo/pipeline.yml,cf49c2a55e4d39909401d8e459885ae4c53120a0fa91496a3ad5647cbcc4f7f2" | openssl dgst -sha256
     * 0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a
     */
    await Promise.all([
      repo.put({
        buildId: BUILD_ID_2,
        component: `pure-hit/foo`,
        contentHash: '0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a',
      }),
      repo.put({
        buildId: BUILD_ID_3,
        component: `pure-hit/baz`,
        contentHash: 'non-matching-content-hash',
      }),
    ]);

    const configs = await Config.getAll(process.cwd());
    matchConfigs('foo', configs, changedFiles);
    await updateDecisions(configs);

    const reasons = configs.map((c) => ({
      name: c.monorepo.name,
      included: c.included,
      reason: c.reason.toString(),
    }));

    expect(reasons).toStrictEqual([
      {
        name: 'foo',
        included: false,
        reason: 'been built previously in beefbeef-beef-beef-beef-beefbeefbeef (Pure cache hit)',
      },
      { name: 'baz', included: true, reason: '1 matching change: baz/abc.ts (Pure cache missed)' },
    ]);
  });
});
