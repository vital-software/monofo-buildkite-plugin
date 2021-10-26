import path from 'path';
import { createTables, startDb, stopDb } from 'jest-dynalite';
import { load as loadYaml } from 'js-yaml';
import _ from 'lodash';
import { mocked } from 'ts-jest/utils';
import { Arguments } from 'yargs';
import { CacheMetadataRepository } from '../../src/cache-metadata';
import * as pipeline from '../../src/cmd/pipeline';
import { service } from '../../src/dynamodb';
import { mergeBase, diff, revList } from '../../src/git';
import { BaseArgs } from '../../src/handler';
import { BUILD_ID, BUILD_ID_2, BUILD_ID_3, COMMIT, fakeProcess } from '../fixtures';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts', '.buildkite/pipeline.changed.yml']));

const mockRevList = mocked(revList, true);
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

const EMPTY_ARGUMENTS: Arguments<BaseArgs> = { $0: '', _: [], chdir: undefined, verbose: false };

describe('monofo pipeline', () => {
  beforeAll(startDb);
  beforeAll(createTables);
  afterAll(stopDb);

  it('returns help output', async () => {
    const output = await execSync(pipeline, 'pipeline --help');
    expect(output).toContain('Output a merged pipeline.yml');
  });

  it('can be executed with no configuration', async () => {
    process.env = fakeProcess();
    process.chdir(__dirname);

    const out: Promise<string> = pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>;

    return expect(out).rejects.toThrowError('No pipeline files');
  });

  it('can be executed with configuration on the default branch', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/kitchen-sink'));

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
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
        expect(Object.entries(p.env)).toHaveLength(5);
        expect(p.env.MONOFO_BASE_BUILD_ID).toBe(BUILD_ID);
        expect(p.env.BAR_WAS_EXCLUDED).toBe('true');
      });
  });

  it('can be executed with simple configuration and skipped parts on the default branch', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/skipped'));

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(commandSummary(p.steps)).toStrictEqual([
          "echo 'inject for: foo, bar'",
          "echo 'bar was replaced'",
          "echo 'All build parts were skipped'",
        ]);
      });
  });

  // In this test, we also assert with details on the inject artifacts step
  it('can be executed with a PIPELINE_RUN_ONLY environment variable', async () => {
    process.env = fakeProcess({
      PIPELINE_RUN_ONLY: 'bar',
      PIPELINE_RUN_SOME_LONG_NAME: '1',
    });
    process.chdir(path.resolve(__dirname, '../projects/kitchen-sink'));

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(commandSummary(p.steps)).toStrictEqual([
          "echo 'inject for: branch-excluded, changed, dependedon, excluded, foo, match-all, match-all-false, match-all-mixed, match-all-true, qux, baz, unreferenced'",
          'echo "bar1" | tee bar1',
          'echo "bar2" | tee bar2',
          'echo "included" > included',
          'echo "some-long-name" > some-long-name',
        ]);

        const inject = (p.steps[0] as CommandStep).command;
        expect(inject[1]).toContain('Copy foo1 from f62a1b4d-10f9-4790-bc1c-e2c3a0c80983 into current build');
        expect(inject[2]).toContain('Copy qux1 from f62a1b4d-10f9-4790-bc1c-e2c3a0c80983 into current build');
        expect(inject[3]).toContain('Copy baz1 from f62a1b4d-10f9-4790-bc1c-e2c3a0c80983 into current build');
        expect(inject[4]).toBe('wait');
      });
  });

  it('can be executed with both PIPELINE_RUN_ALL and PIPELINE_NO_RUN_TASK', async () => {
    process.env = fakeProcess({
      PIPELINE_RUN_ALL: '1',
      PIPELINE_NO_RUN_FOO: '1',
      PIPELINE_NO_RUN_BAR: '1',
    });
    process.chdir(path.resolve(__dirname, '../projects/kitchen-sink'));

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(commandSummary(p.steps)).toStrictEqual([
          "echo 'inject for: excluded, foo, bar, match-all-false'",
          'echo "branch-excluded" > branch-excluded',
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

  it('can be executed with crossdeps alone', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/crossdeps'));

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps).toHaveLength(1); // No artifacts step, because only phony artifacts involved

        // This had a cross-dependency, but the thing it depended on was skipped
        // In addition, nothing that was skipped was producing required artifacts
        // So the artifact step was skipped. This step can now run immediately.
        expect(p.steps[0].depends_on).toHaveLength(0);
      });
  });

  it('can be executed with flexible structure', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/flexible-structure'));

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps).toHaveLength(3);
        expect(p.steps.map((s) => s.key)).toStrictEqual(['foo1Key', 'foo2Key', 'foo3Key']);
      });
  });

  it('can be executed with pure components', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps).toHaveLength(4);
        expect(p.steps.map((s) => s.key)).toStrictEqual([
          'anon-step-cb64da0ef06c',
          'anon-step-bf2e8e001a41',
          'record-success-foo',
          'record-success-baz',
        ]);
      });
  });

  it('can be executed with pure components with cache hits', async () => {
    process.env = fakeProcess({ BUILDKITE_PIPELINE_SLUG: 'pure-hit' });
    process.chdir(path.resolve(__dirname, '../projects/pure'));

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
        contentHash: '766bad0b5b5b268746b73b23fb208c0aab1942f03ee55799e02f781af511010f',
      }),
    ]);

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(commandSummary(p.steps)).toStrictEqual([
          "echo 'inject for: foo, baz'",
          "echo 'All build parts were skipped'",
        ]);

        const inject = (p.steps[0] as CommandStep).command;
        expect(inject[1]).toContain(`Copy foo from ${BUILD_ID_2} into current build`);
        expect(inject[2]).toContain(`Copy baz from ${BUILD_ID_3} into current build`);
        expect(inject[3]).toBe('wait');
      });
  });

  it('can be executed with pure components with cache hits, but PIPELINE_RUN_ALL forces them to run', async () => {
    process.env = fakeProcess({ BUILDKITE_PIPELINE_SLUG: 'pure-hit', PIPELINE_RUN_ALL: '1' });
    process.chdir(path.resolve(__dirname, '../projects/pure'));

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
        contentHash: '766bad0b5b5b268746b73b23fb208c0aab1942f03ee55799e02f781af511010f',
      }),
    ]);

    await (pipeline.handler(EMPTY_ARGUMENTS) as unknown as Promise<string>)
      .then((o) => loadYaml(o) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps.map((s) => s.key)).toStrictEqual([
          'anon-step-cb64da0ef06c',
          'anon-step-bf2e8e001a41',
          'record-success-foo',
          'record-success-baz',
        ]);
      });
  });
});
