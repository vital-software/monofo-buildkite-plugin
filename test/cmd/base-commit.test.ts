import path from 'path';
import { Arguments } from 'yargs';
import { fakeProcess } from '../fixtures';
import { mergeBase, diff, revParse } from '../../src/git';
import baseCommit from '../../src/cmd/base-commit';
import execSync from './exec';

jest.mock('../../src/git');

const MERGE_BASE_COMMIT = 'abcdef';
const REV_PARSE_COMMIT = '012345';

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve(MERGE_BASE_COMMIT));

const mockRevParse = revParse as jest.Mock<Promise<string>>;
mockRevParse.mockImplementation(() => Promise.resolve(REV_PARSE_COMMIT));

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

  it('can be executed with no configuration', async () => {
    process.env = fakeProcess();
    process.chdir(__dirname);

    const args: Arguments<unknown> = { $0: '', _: [] };
    return expect(baseCommit.handler(args)).resolves.toBe(REV_PARSE_COMMIT);
  });

  it('can be executed with simple configuration', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/simple'));

    const args: Arguments<unknown> = { $0: '', _: [] };
    return expect(baseCommit.handler(args)).resolves.toBe(REV_PARSE_COMMIT);
  });
});
