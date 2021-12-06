import Download from '../../src/commands/download';
import { mergeBase, diff, revList } from '../../src/git';
import { fakeProcess, COMMIT } from '../fixtures';

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

  it('can output help information', async () => {
    return expect(Download.run(['--help'])).resolves.toContain('Downloads the given list of artifacts');
  });
});
