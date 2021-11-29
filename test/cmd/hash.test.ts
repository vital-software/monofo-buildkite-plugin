import path from 'path';
import { Arguments } from 'yargs';
import hash from '../../src/cmd/hash';
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

describe('monofo hash', () => {
  it('returns help output', async () => {
    const output = await execSync(hash, 'list --help');
    expect(output).toContain('Return the content hash');
  });

  it('returns the content hash for the pure scenario', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    expect(await hash.innerHandler(EXAMPLE_ARGUMENTS)).toContain(
      '0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a'
    );
  });
});
