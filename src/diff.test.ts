import path from 'path';
import { mocked } from 'ts-jest/utils';
import { COMMIT, fakeProcess } from '../test/fixtures';
import { getBuildkiteInfo } from './buildkite/config';
import Config from './config';
import { getBaseBuild, matchConfigs } from './diff';
import { mergeBase, revList } from './git';

jest.mock('./git');
jest.mock('./buildkite/client');

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

  it('matches changed files against configs', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../test/projects/kitchen-sink'));
    const configs = await Config.getAll();
    matchConfigs('foo', configs, ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts']);
    const changes = configs.map((r) => r.changes);

    expect(changes).toHaveLength(10);
    expect(changes).toStrictEqual([
      [],
      [],
      ['foo/README.md'],
      ['foo/README.md'],
      [],
      [],
      [],
      ['baz/abc.ts'],
      [],
      ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'],
    ]);
  });
});
