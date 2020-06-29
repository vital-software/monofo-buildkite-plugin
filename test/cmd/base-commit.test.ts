import path from 'path';
import { Arguments } from 'yargs';
import { fakeProcess, COMMIT } from '../fixtures';
import { mergeBase, diff } from '../../src/git';
import baseCommit from '../../src/cmd/base-commit';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve(COMMIT));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

describe('cmd base-commit', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  it('can output help information', async () => {
    return expect(execSync(baseCommit, 'base-commit --help')).resolves.toContain('Output a base commit hash');
  });

  it('will error if Buildkite API does', async () => {
    process.env = fakeProcess();
    process.env.BUILDKITE_API_ACCESS_TOKEN = 'fake';
    process.chdir(__dirname);

    const args: Arguments<unknown> = { $0: '', _: [] };
    const out: Promise<string> = (baseCommit.handler(args) as unknown) as Promise<string>;

    return expect(out).resolves.toBe(COMMIT);
  });

  it('can be executed with simple configuration', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/simple'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    return expect(baseCommit.handler(args)).resolves.toBe(COMMIT);
  });
});
