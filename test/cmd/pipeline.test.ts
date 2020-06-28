/* eslint-disable import/first,import/order */
import { fakeProcess } from '../fixtures';
import path from 'path';
import { Arguments } from 'yargs';
import { safeLoad } from 'js-yaml';
import { mergeBase, diff } from '../../src/git';
import * as pipeline from '../../src/cmd/pipeline';
import { Pipeline } from '../../src/pipeline';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

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
        expect(p.steps.map((s) => s.command)).toStrictEqual(['echo "foo1"', "echo 'bar was replaced'", 'echo "baz1"']);
        expect(Object.entries(p.env)).toHaveLength(4); // merged from all files
      });
  });
});