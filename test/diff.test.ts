import path from 'path';
import { mocked } from 'ts-jest/utils';
import { getBuildkiteInfo } from '../src/buildkite/config';
import Config from '../src/config';
import { getBaseBuild, matchConfigs } from '../src/diff';
import { mergeBase, revList } from '../src/git';
import { COMMIT, fakeProcess } from './fixtures';

jest.mock('../src/git');
jest.mock('../src/buildkite/client');

const mockRevList = mocked(revList, true);
mockRevList.mockImplementation(() => Promise.resolve([COMMIT]));

const mockMergeBase = mocked(mergeBase, true);

describe('getBaseBuild', () => {
  it('returns the merge base on a non-default branch', async () => {
    process.env = fakeProcess();
    process.env.BUILDKITE_BRANCH = 'foo';
    mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

    const build = await getBaseBuild(getBuildkiteInfo());
    expect(build.commit).toBe(COMMIT);
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
      matchConfigs('foo', configs, changedFiles);
      const changes = configs.map((r) => r.changes.files);

      expect(changes).toHaveLength(14);
      expect(changes).toStrictEqual([
        [],
        [],
        ['foo/README.md'],
        ['foo/README.md'],
        [],
        [],
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
      matchConfigs('foo', configs, changedFiles);
      const changes = configs.map((r) => r.changes.files);

      expect(changes).toHaveLength(14);
      expect(changes).toStrictEqual([[], [], [], [], [], [], [], [], [], [], [], [], [], []]);
    });
  });
});
