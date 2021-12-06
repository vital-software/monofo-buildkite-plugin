import path from 'path';
import { stdout } from 'stdout-stderr';
import Hash from '../../src/commands/hash';
import { fakeProcess } from '../fixtures';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

describe('monofo hash', () => {
  it('returns help output', async () => {
    stdout.start();
    await Hash.run(['--help']);
    stdout.stop();
    expect(stdout.output).toContain('Return the content hash');
  });

  it('returns the content hash for the pure scenario', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    expect(await Hash.run(['foo'])).toContain('0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a');
  });
});
