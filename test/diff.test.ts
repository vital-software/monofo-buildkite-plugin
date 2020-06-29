import { mocked } from 'ts-jest/utils';
import path from 'path';
import { getBaseBuild, matchConfigs } from '../src/diff';
import { COMMIT, fakeProcess } from './fixtures';
import { mergeBase } from '../src/git';
import getConfigs, { getBuildkiteInfo } from '../src/config';

jest.mock('../src/git');
jest.mock('../src/buildkite/client');

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
    process.chdir(path.resolve(__dirname, 'projects/simple'));
    const result = matchConfigs('foo', await getConfigs(), ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts']);

    expect(result[0].changes).toStrictEqual(['foo/README.md']);
    expect(result[1].changes).toStrictEqual([]);
    expect(result[2].changes).toStrictEqual([]);
    expect(result[3].changes).toStrictEqual(['baz/abc.ts']);
  });
});
