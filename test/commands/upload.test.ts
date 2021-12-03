import upload from '../../src/cmd/upload';
import { mergeBase, diff, revList } from '../../src/git';
import { fakeProcess, COMMIT } from '../fixtures';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve(COMMIT));

const mockRevList = revList as jest.Mock<Promise<string[]>>;
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

describe('cmd upload', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  it('can output help information', async () => {
    return expect(execSync(upload, 'upload --help')).resolves.toContain(
      'Produces a compressed tarball artifact from a given list of globs'
    );
  });

  it.todo('can upload lots of files');
});
