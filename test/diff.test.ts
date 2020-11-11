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

  it('matches changed files against configs', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, './projects/kitchen-sink'));
    const configs = await Config.getAll(process.cwd());
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
