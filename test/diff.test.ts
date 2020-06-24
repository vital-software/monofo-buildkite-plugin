import { getBaseCommit, matchConfigs } from '../src/diff';
import { fakeProcess } from './fixtures';
import { mergeBase } from '../src/git';
import { mocked } from 'ts-jest/utils';
import path from 'path';
import getConfigs from '../src/config';

jest.mock('../src/git');

const mockedMergeBase = mocked(mergeBase, true);

describe('getBaseCommit', () => {
  it('returns the merge base on a non-default branch', async () => {
    process.env = fakeProcess();
    mockedMergeBase.mockImplementation(() => Promise.resolve('foo'));
    const commit = await getBaseCommit();
    expect(commit).toBe('foo');
  });
});

describe('matchConfigs', () => {
  it('is a function', () => {
    expect(typeof matchConfigs).toBe('function');
  });

  it('matches changed files against configs', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, 'projects/simple'));
    const result = await matchConfigs(await getConfigs(), ['foo/abc.js', 'foo/README.md', 'bar/abc.ts']);

    expect(result[0].changes).toStrictEqual(['foo/README.md']);
    expect(result[1].changes).toStrictEqual(['bar/abc.ts']);
    expect(result[2].changes).toHaveLength(0);
  });
});
