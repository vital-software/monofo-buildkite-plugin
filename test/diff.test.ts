import { getBuildkiteInfo } from '../src/buildkite/config';
import { getBaseBuild } from '../src/diff';
import { commitExists, mergeBase, revList } from '../src/git';
import { COMMIT, fakeProcess } from './fixtures';

jest.mock('../src/git');
jest.mock('../src/buildkite/client');

const mockRevList = revList as jest.Mock<Promise<string[]>>;
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;

const mockCommitExists = commitExists as jest.Mock<Promise<boolean>>;
mockCommitExists.mockImplementation(() => Promise.resolve(true));

describe('getBaseBuild', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('default branches', () => {
    it('returns a previous build on a default branch', async () => {
      process.env = fakeProcess();
      process.env.BUILDKITE_BRANCH = 'foo';
      process.env.BUILDKITE_PIPELINE_DEFAULT_BRANCH = 'foo';

      const build = await getBaseBuild(getBuildkiteInfo());
      expect(build.commit).toBe(COMMIT);
    });

    it('accepts MONOFO_DEFAULT_BRANCH to set the default branch', async () => {
      process.env = fakeProcess();
      process.env.BUILDKITE_BRANCH = 'foo';
      process.env.BUILDKITE_PIPELINE_DEFAULT_BRANCH = 'bar';
      process.env.MONOFO_DEFAULT_BRANCH = 'foo';

      const build = await getBaseBuild(getBuildkiteInfo());
      expect(build.commit).toBe(COMMIT);
    });
  });

  describe('feature branches', () => {
    it('returns the merge base on a feature branch', async () => {
      process.env = fakeProcess();
      process.env.BUILDKITE_BRANCH = 'foo';
      mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

      const build = await getBaseBuild(getBuildkiteInfo());
      expect(build.commit).toBe(COMMIT);
    });
  });

  describe('integration branches', () => {
    it('returns the merge base on a integration branch', async () => {
      process.env = fakeProcess();
      process.env.BUILDKITE_BRANCH = 'foo';
      process.env.MONOFO_INTEGRATION_BRANCH = 'foo';
      mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

      const build = await getBaseBuild(getBuildkiteInfo());
      expect(build.commit).toBe(COMMIT);
    });
  });
});
