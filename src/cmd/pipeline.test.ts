import path from 'path';
import { safeLoad } from 'js-yaml';
import { mocked } from 'ts-jest/utils';
import { Arguments } from 'yargs';
import execSync from '../../test/cmd/exec';
import { BUILD_ID, COMMIT, fakeProcess } from '../../test/fixtures';
import { mergeBase, diff, revList } from '../git';
import * as pipeline from './pipeline';

jest.mock('../git');
jest.mock('../buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts', '.buildkite/pipeline.changed.yml']));

const mockRevList = mocked(revList, true);
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

describe('monofo pipeline', () => {
  it('returns help output', async () => {
    const output = await execSync(pipeline, 'pipeline --help');
    expect(output).toContain('Output a merged pipeline.yml');
  });

  it('can be executed with no configuration', async () => {
    process.env = fakeProcess();
    process.chdir(__dirname);

    const args: Arguments<unknown> = { $0: '', _: [] };
    const out: Promise<string> = (pipeline.handler(args) as unknown) as Promise<string>;

    return expect(out).rejects.toThrowError('No pipeline files');
  });

  it('can be executed with configuration on the default branch', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../../test/projects/kitchen-sink'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    await ((pipeline.handler(args) as unknown) as Promise<string>)
      .then((o) => (safeLoad(o) as unknown) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps.map((s) => s.command)).toStrictEqual([
          "echo 'inject for: excluded, bar, qux'",
          'echo "changed" > changed',
          'echo "dependedon" > dependedon',
          'echo "foo1" > foo1',
          "echo 'bar was replaced'",
          'echo "included" > included',
          'echo "baz1"',
          'echo "unreferenced" > unref',
        ]);
        const { plugins } = p.steps[0];
        expect(plugins ? plugins[0]['artifacts#v1.3.0'] : null).toStrictEqual({
          build: BUILD_ID,
          download: ['bar1', 'bar2', 'qux1'],
          upload: ['bar1', 'bar2', 'qux1'],
        });
        expect(Object.entries(p.env)).toHaveLength(4);
        expect(p.env.BAR_WAS_EXCLUDED).toBe('true');
      });
  });

  it('can be executed with simple configuration and skipped parts on the default branch', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../../test/projects/skipped'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    await ((pipeline.handler(args) as unknown) as Promise<string>)
      .then((o) => (safeLoad(o) as unknown) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps.map((s) => s.command)).toStrictEqual([
          "echo 'inject for: foo, bar'",
          "echo 'bar was replaced'",
          "echo 'All build parts were skipped'",
        ]);
        const { plugins } = p.steps[0];
        expect(plugins ? plugins[0]['artifacts#v1.3.0'] : null).toStrictEqual({
          build: BUILD_ID,
          download: ['foo1', 'bar1', 'bar2'],
          upload: ['foo1', 'bar1', 'bar2'],
        });
      });
  });

  it('can be executed with crossdeps alone', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../../test/projects/crossdeps'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    await ((pipeline.handler(args) as unknown) as Promise<string>)
      .then((o) => (safeLoad(o) as unknown) as Pipeline)
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
    process.chdir(path.resolve(__dirname, '../../test/projects/flexible-structure'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    await ((pipeline.handler(args) as unknown) as Promise<string>)
      .then((o) => (safeLoad(o) as unknown) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps).toHaveLength(3);
        expect(p.steps.map((s) => s.key)).toStrictEqual(['foo1Key', 'foo2Key', 'foo3Key']);
      });
  });
});
