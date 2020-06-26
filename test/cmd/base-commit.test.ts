/* eslint-disable import/first,import/order */
import { fakeProcess, COMMIT, fakeBuildkiteBuildsListing } from '../fixtures';

// doMock so it doesn't get hoisted to the top of the file
jest.doMock('../../src/buildkite', () => {
  const actual: Record<string, unknown> = jest.requireActual('../../src/buildkite');
  return {
    __esModule: true,
    ...actual,
    // Can't use COMMIT variable because of hoisting-to-top-of-file behavior
    getLastSuccessfulBuild: jest.fn().mockReturnValue(Promise.resolve(fakeBuildkiteBuildsListing()[0])),
  };
});

import path from 'path';
import { Arguments } from 'yargs';
import { mergeBase, diff } from '../../src/git';
import baseCommit from '../../src/cmd/base-commit';
import execSync from './exec';

jest.mock('../../src/git');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve(COMMIT));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

describe('cmd base-commit', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  afterEach(() => {
    delete require.cache[require.resolve('yargs')];
  });

  it('can output help information', async () => {
    return expect(execSync(baseCommit, 'base-commit --help')).resolves.toContain('Output a base commit hash');
  });

  it('will error if Buildkite API does', async () => {
    process.env = fakeProcess();
    process.env.BUILDKITE_API_ACCESS_TOKEN = 'fake';
    process.chdir(__dirname);

    const args: Arguments<unknown> = { $0: '', _: [] };
    const out: Promise<string> = (baseCommit.handler(args) as unknown) as Promise<string>;

    return expect(out).resolves.toBe(COMMIT);
  });

  it('can be executed with simple configuration', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/simple'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    return expect(baseCommit.handler(args)).resolves.toBe(COMMIT);
  });
});
