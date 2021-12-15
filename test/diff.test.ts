import path from 'path';
import { getBuildkiteInfo } from '../src/buildkite/config';
import Config from '../src/config';
import { getBaseBuild, matchConfigs } from '../src/diff';
import { commitExists, mergeBase, revList } from '../src/git';
import { BASE_BUILD, COMMIT, fakeProcess } from './fixtures';

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

describe('matchConfigs', () => {
  it('is a function', () => {
    expect(typeof matchConfigs).toBe('function');
  });

  describe('when many changed files', () => {
    const changedFiles = ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'];

    it('matches changed files against configs', async () => {
      process.env = fakeProcess();
      process.chdir(path.resolve(__dirname, './projects/kitchen-sink'));
      const configs = await Config.getAll(process.cwd());
      matchConfigs(BASE_BUILD, configs, changedFiles);
      const changes = configs.map((r) => r.changes);

      expect(changes).toHaveLength(16);
      expect(changes).toStrictEqual([
        changedFiles,
        [],
        [],
        ['foo/README.md'],
        ['foo/README.md'],
        [],
        [],
        changedFiles,
        changedFiles,
        [],
        changedFiles,
        changedFiles,
        [],
        ['baz/abc.ts'],
        [],
        changedFiles,
      ]);
    });
  });

  describe('when no changed files', () => {
    const changedFiles: string[] = [];

    it('still matches configs that have matches hard-coded to true', async () => {
      process.env = fakeProcess();
      process.chdir(path.resolve(__dirname, './projects/kitchen-sink'));
      const configs = await Config.getAll(process.cwd());
      matchConfigs(BASE_BUILD, configs, changedFiles);
      const changes = configs.map((r) => r.changes);

      expect(changes).toHaveLength(16);
      expect(changes).toStrictEqual([[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]);
    });
  });
});
