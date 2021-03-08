import path from 'path';
import { Arguments } from 'yargs';
import * as hash from '../../src/cmd/hash';
import { fakeProcess } from '../fixtures';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

describe('monofo hash', () => {
  it('returns help output', async () => {
    const output = await execSync(hash, 'list --help');
    expect(output).toContain('Return the content hash');
  });

  it('returns the content hash for the pure scenario', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    const args: Arguments<unknown> = { $0: '', _: [], componentName: 'foo' };
    const output = await ((hash.handler(args) as unknown) as Promise<string>)
    expect(output).toContain('0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a')
  });
});
