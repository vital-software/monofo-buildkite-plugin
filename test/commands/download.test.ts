import Download from '../../src/commands/download';
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

describe('cmd download', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  it('returns help output', async () => {
    return expect(testRun(Download, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });
});
