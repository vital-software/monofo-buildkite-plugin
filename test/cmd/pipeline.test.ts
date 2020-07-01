import path from 'path';
import { Arguments } from 'yargs';
import { safeLoad } from 'js-yaml';
import { mocked } from 'ts-jest/utils';
import { BUILD_ID, COMMIT, fakeProcess } from '../fixtures';
import { mergeBase, diff, revList } from '../../src/git';
import * as pipeline from '../../src/cmd/pipeline';
import { Pipeline } from '../../src/pipeline';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

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

  it('can be executed with simple configuration on the default branch', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/simple'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    await ((pipeline.handler(args) as unknown) as Promise<string>)
      .then((o) => (safeLoad(o) as unknown) as Pipeline)
      .then((p) => {
        expect(p).toBeDefined();
        expect(p.steps.map((s) => s.command)).toStrictEqual([
          "echo 'inject for: bar, qux'",
          'echo "foo1" > foo1',
          "echo 'bar was replaced'",
          'echo "baz1"',
        ]);
        const { plugins } = p.steps[0];
        expect(plugins ? plugins[0]['artifacts#v1.3.0'] : null).toStrictEqual({
          build: BUILD_ID,
          download: ['bar1', 'bar2', 'qux1'],
          upload: ['bar1', 'bar2', 'qux1'],
        });
        expect(Object.entries(p.env)).toHaveLength(4); // merged from all files
      });
  });
});
