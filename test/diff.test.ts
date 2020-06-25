import { mocked } from 'ts-jest/utils';
import path from 'path';
import { getBaseCommit, matchConfigs } from '../src/diff';
import { fakeProcess } from './fixtures';
import { revParse } from '../src/git';
import getConfigs from '../src/config';

jest.mock('../src/git');

// const mockMergeBase = mocked(mergeBase, true);
const mockRevParse = mocked(revParse, true);

describe('getBaseCommit', () => {
  it('returns the merge base on a non-default branch', async () => {
    process.env = fakeProcess();
    // mockMergeBase.mockImplementation(() => Promise.resolve('foo'));
    mockRevParse.mockImplementation(() => Promise.resolve('aklwdmklawmkl'));

    const commit = await getBaseCommit();
    expect(commit).toBe('aklwdmklawmkl');
  });
});

describe('matchConfigs', () => {
  it('is a function', () => {
    expect(typeof matchConfigs).toBe('function');
  });

  it('matches changed files against configs', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, 'projects/simple'));
    const result = matchConfigs(await getConfigs(), ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts']);

    expect(result[0].changes).toStrictEqual(['foo/README.md']);
    expect(result[1].changes).toStrictEqual([]);
    expect(result[2].changes).toStrictEqual(['baz/abc.ts']);
  });
});
