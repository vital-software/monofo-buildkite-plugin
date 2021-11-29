import path from 'path';
import { Arguments } from 'yargs';
import list from '../../src/cmd/list';
import { BaseArgs } from '../../src/handler';
import { fakeProcess } from '../fixtures';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

const EXAMPLE_ARGUMENTS: Arguments<BaseArgs> = {
  $0: '',
  _: [],
  chdir: undefined,
  verbose: false,
  componentName: 'foo',
};

describe('monofo list', () => {
  it('returns help output', async () => {
    const output = await execSync(list, 'list --help');
    expect(output).toContain('List matching files');
  });

  it('returns matching files for the pure scenario', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    const output = await list.innerHandler(EXAMPLE_ARGUMENTS);
    expect(output).toContain('foo/README.md');
  });
});
