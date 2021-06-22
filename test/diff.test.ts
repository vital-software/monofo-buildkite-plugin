import path from 'path';
import { mocked } from 'ts-jest/utils';
import { getBuildkiteInfo } from '../src/buildkite/config';
import Config from '../src/config';
import { getBaseBuild, matchConfigs } from '../src/diff';
import { mergeBase, revList, revParse } from '../src/git';
import { COMMIT, fakeProcess } from './fixtures';

jest.mock('../src/git');
jest.mock('../src/buildkite/client');

const mockRevList = mocked(revList, true);
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

const mockMergeBase = mocked(mergeBase, true);

const mockRevParse = mocked(revParse, true);
mockRevParse.mockImplementation((foo) => Promise.resolve(foo));

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

  it('matches changed files against configs', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, './projects/kitchen-sink'));
    const configs = await Config.getAll(process.cwd());
    matchConfigs('foo', configs, ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts']);
    const changes = configs.map((r) => r.changes.files);

    expect(changes).toHaveLength(13);
    expect(changes).toStrictEqual([
      [],
      [],
      ['foo/README.md'],
      ['foo/README.md'],
      [],
      [],
      ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'],
      ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'],
      ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'],
      [],
      ['baz/abc.ts'],
      [],
      ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'],
    ]);
  });
});
