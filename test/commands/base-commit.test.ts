import path from 'path';
import BaseCommit from '../../src/commands/base-commit';
import { mergeBase, diff, revList } from '../../src/git';
import { fakeProcess, COMMIT, testRun } from '../fixtures';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

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

  it('returns help output', async () => {
    return expect(testRun(BaseCommit, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });

  it('will error if Buildkite API does', async () => {
    process.env = fakeProcess();
    process.env.BUILDKITE_API_ACCESS_TOKEN = 'fake';
    process.chdir(__dirname);

    return expect(testRun(BaseCommit, [])).resolves.toStrictEqual(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ stdout: expect.stringContaining(COMMIT) })
    );
  });

  it('can be executed with simple configuration', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/kitchen-sink'));

    const { stdout } = await testRun(BaseCommit, []);
    expect(stdout).toContain(COMMIT);
  });
});
