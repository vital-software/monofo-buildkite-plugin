import { mocked } from 'ts-jest/utils';
import path from 'path';
import { getBaseBuild, matchConfigs } from './diff';
import { COMMIT, fakeProcess } from '../test/fixtures';
import { mergeBase, revList } from './git';
import getConfigs, { getBuildkiteInfo } from './config';

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
    process.chdir(path.resolve(__dirname, '../test/projects/simple'));
    const result = matchConfigs('foo', await getConfigs(), ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts']);

    expect(result[0].changes).toStrictEqual([]);
    expect(result[1].changes).toStrictEqual([]);
    expect(result[2].changes).toStrictEqual(['foo/README.md']);
    expect(result[3].changes).toStrictEqual([]);
    expect(result[4].changes).toStrictEqual([]);
    expect(result[5].changes).toStrictEqual(['baz/abc.ts']);
  });
});
