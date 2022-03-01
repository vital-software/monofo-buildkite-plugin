import { createTables, startDb, stopDb } from 'jest-dynalite';
import { load as loadYaml } from 'js-yaml';
import _ from 'lodash';
import { CacheMetadataRepository } from '../../src/cache-metadata';
import Pipeline from '../../src/commands/pipeline';
import { service } from '../../src/dynamodb';
import { mergeBase, diff, revList } from '../../src/git';
import { Pipeline as BuildkitePipeline } from '../../src/models/pipeline';
import { CommandStep, Step } from '../../src/models/step';
import { BUILD_ID, BUILD_ID_2, BUILD_ID_3, COMMIT, fakeProcess, selectScenario, testRun } from '../fixtures';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts', '.buildkite/pipeline.changed.yml']));

const mockRevList = revList as jest.Mock<Promise<string[]>>;
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

/**
 * Flattens, but skips additional commands on multiple-command steps
 */
function commandSummary(steps: Step[]): string[] {
  return steps.map((s): string => {
    const c: string | string[] = (s as CommandStep).command;

    if (_.isArray<string>(c)) {
      return c.length > 0 ? (_.head(c) as string) : '(no commands)';
    }

    return c || '(no command)';
  });
}

async function run(args: string[] = []): Promise<BuildkitePipeline> {
  const { stdout } = await testRun(Pipeline, args);
  return (await loadYaml(stdout)) as BuildkitePipeline;
}

describe('monofo pipeline', () => {
  beforeAll(startDb);
  beforeAll(createTables);
  afterAll(stopDb);

  it('returns help output', async () => {
    return expect(testRun(Pipeline, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });

  it('can be executed with no configuration', async () => {
    process.env = fakeProcess();
    process.chdir(__dirname);

    return expect(testRun(Pipeline, [])).rejects.toThrowError('No pipeline files');
  });

  describe('scenario: kitchen-sink', () => {
    beforeAll(() => {
      selectScenario('kitchen-sink');
    });

    it('can be executed with configuration on the default branch', async () => {
      process.env = fakeProcess();

      const p = await run([]);

      expect(p).toBeDefined();

      expect(commandSummary(p.steps)).toStrictEqual([
        "echo 'inject for: branch-excluded, excluded, bar, match-all-false, qux, some-long-name'",
        'echo "changed" > changed',
        'echo "dependedon" > dependedon',
        'echo "foo1" > foo1',
        "echo 'bar was replaced'",
        'echo "included" > included',
        'echo "match-all" > match-all',
        'echo "match-all-mixed" > match-all-mixed',
        'echo "match-all-true" > match-all-true',
        'echo "baz1"',
        'echo "unreferenced" > unref',
      ]);

      expect(Object.entries(p.env)).toHaveLength(7);
      expect(p.env.MONOFO_BASE_BUILD_ID).toBe(BUILD_ID);
      expect(p.env.MONOFO_BASE_BUILD_COMMIT).toBe(COMMIT);
      expect(p.env.BAR_WAS_EXCLUDED).toBe('true');
    });

    // In this test, we also assert with details on the inject artifacts step
    it('can be executed with a PIPELINE_RUN_ONLY environment variable', async () => {
      process.env = fakeProcess({
        PIPELINE_RUN_ONLY: 'bar',
        PIPELINE_RUN_SOME_LONG_NAME: '1',
      });

      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(commandSummary(pipeline.steps)).toStrictEqual([
        "echo 'inject for: branch-excluded, changed, dependedon, excluded, foo, match-all, match-all-env, match-all-false, match-all-mixed, qux, baz, unreferenced'",
        'echo "bar1" | tee bar1',
        'echo "bar2" | tee bar2',
        'echo "included" > included',
        'echo "match-all-true" > match-all-true',
        'echo "some-long-name" > some-long-name',
      ]);

      const inject = (pipeline.steps[0] as CommandStep).command;
      expect(inject[1]).toContain('Copy foo1 from f62a1b4d-10f9-4790-bc1c-e2c3a0c80983 into current build');
      expect(inject[2]).toContain('Copy qux1 from f62a1b4d-10f9-4790-bc1c-e2c3a0c80983 into current build');
      expect(inject[3]).toContain('Copy baz1 from f62a1b4d-10f9-4790-bc1c-e2c3a0c80983 into current build');
      expect(inject[4]).toBe('wait');
    });

    it('can be executed with both PIPELINE_RUN_ALL and PIPELINE_NO_RUN_TASK', async () => {
      process.env = fakeProcess({
        PIPELINE_RUN_ALL: '1',
        PIPELINE_NO_RUN_FOO: '1',
        PIPELINE_NO_RUN_BAR: '1',
      });

      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(commandSummary(pipeline.steps)).toStrictEqual([
        "echo 'inject for: branch-excluded, excluded, foo, bar, match-all-false'",
        'echo "changed" > changed',
        'echo "dependedon" > dependedon',
        "echo 'bar was replaced'",
        'echo "included" > included',
        'echo "match-all" > match-all',
        'echo "match-all-mixed" > match-all-mixed',
        'echo "match-all-true" > match-all-true',
        'echo "qux1"',
        'echo "baz1"',
        'echo "some-long-name" > some-long-name',
        'echo "unreferenced" > unref',
      ]);
    });
  });

  describe('scenario: skipped', () => {
    beforeAll(() => {
      selectScenario('skipped');
    });

    it('can be executed with simple configuration and skipped parts on the default branch', async () => {
      process.env = fakeProcess();

      const { stdout } = await testRun(Pipeline, []);
      const pipeline = (await loadYaml(stdout)) as BuildkitePipeline;

      expect(pipeline).toBeDefined();
      expect(commandSummary(pipeline.steps)).toStrictEqual([
        "echo 'inject for: foo, bar'",
        "echo 'bar was replaced'",
        "echo 'All build parts were skipped'",
      ]);
    });
  });

  describe('scenario: crossdeps', () => {
    beforeAll(() => {
      selectScenario('crossdeps');
    });

    it('can be executed with crossdeps alone', async () => {
      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(pipeline.steps).toHaveLength(1); // No artifacts step, because only phony artifacts involved

      // This had a cross-dependency, but the thing it depended on was skipped
      // In addition, nothing that was skipped was producing required artifacts
      // So the artifact step was skipped. This step can now run immediately.
      expect(pipeline.steps[0].depends_on).toHaveLength(0);
    });
  });

  describe('scenario: flexible-structure', () => {
    beforeAll(() => {
      selectScenario('flexible-structure');
    });

    it('can be executed with flexible structure', async () => {
      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(pipeline.steps).toHaveLength(3);
      expect(pipeline.steps.map((s) => s.key)).toStrictEqual(['foo1Key', 'foo2Key', 'foo3Key']);
    });
  });

  describe('scenario: pure', () => {
    beforeAll(() => {
      selectScenario('pure');
    });

    it('can be executed with pure components', async () => {
      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(pipeline.steps).toHaveLength(4);
      expect(pipeline.steps.map((s) => s.key)).toStrictEqual([
        'anon-step-0f9d3e84a439', // These will change if the hashing algorithm does
        'anon-step-6da74a8bdeec',
        'record-success-foo',
        'record-success-baz',
      ]);
    });

    it('can be executed with pure components with cache hits', async () => {
      process.env = fakeProcess({ BUILDKITE_PIPELINE_SLUG: 'pure-hit' });

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
          commit: COMMIT,
          component: `pure-hit/foo`,
          contentHash: '0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a',
        }),
        repo.put({
          buildId: BUILD_ID_3,
          commit: COMMIT,
          component: `pure-hit/baz`,
          contentHash: '766bad0b5b5b268746b73b23fb208c0aab1942f03ee55799e02f781af511010f',
        }),
      ]);

      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(commandSummary(pipeline.steps)).toStrictEqual([
        "echo 'inject for: foo, baz'",
        "echo 'All build parts were skipped'",
      ]);

      const inject = (pipeline.steps[0] as CommandStep).command;
      expect(inject[1]).toContain(`Copy foo from ${BUILD_ID_2} into current build`);
      expect(inject[2]).toContain(`Copy baz from ${BUILD_ID_3} into current build`);
      expect(inject[3]).toBe('wait');
    });

    it('can be executed with pure components with cache hits, but PIPELINE_RUN_ALL forces them to run', async () => {
      process.env = fakeProcess({ BUILDKITE_PIPELINE_SLUG: 'pure-hit', PIPELINE_RUN_ALL: '1' });

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
          commit: COMMIT,
          component: `pure-hit/foo`,
          contentHash: '0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a',
        }),
        repo.put({
          buildId: BUILD_ID_3,
          commit: COMMIT,
          component: `pure-hit/baz`,
          contentHash: '766bad0b5b5b268746b73b23fb208c0aab1942f03ee55799e02f781af511010f',
        }),
      ]);

      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(pipeline.steps.map((s) => s.key)).toStrictEqual([
        'anon-step-0f9d3e84a439', // These will change if the hashing algorithm does
        'anon-step-6da74a8bdeec',
        'record-success-foo',
        'record-success-baz',
      ]);
    });
  });

  describe('scenario: groups', () => {
    beforeAll(() => {
      selectScenario('groups');
    });

    it('can merge across groups and understand their depends_on', async () => {
      const pipeline = await run([]);

      expect(pipeline).toBeDefined();
      expect(pipeline.steps.map((s) => s.key)).toStrictEqual([
        'foo1-group', // merged entry
        'foo3-group',
        'foo4-group',
      ]);
    });
  });

  describe('scenario: bad-groups', () => {
    beforeAll(() => {
      selectScenario('bad-groups');
    });

    it('can not merge across groups when they have different settings', async () => {
      await expect(run([])).rejects.toThrowError(
        'Cannot merge groups under foo1-group: allow_dependency_failure does not match'
      );
    });
  });
});
