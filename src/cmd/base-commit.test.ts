import path from 'path';
import { Arguments } from 'yargs';
import { fakeProcess, COMMIT } from '../../test/fixtures';
import { mergeBase, diff, revList } from '../git';
import baseCommit from './base-commit';
import execSync from '../../test/cmd/exec';

jest.mock('../git');
jest.mock('../buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve(COMMIT));

const mockRevList = revList as jest.Mock<Promise<string[]>>;
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

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
    process.chdir(path.resolve(__dirname, '../../test/projects/simple'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    return expect(baseCommit.handler(args)).resolves.toBe(COMMIT);
  });
});
