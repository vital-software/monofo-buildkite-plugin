import path from 'path';
import Hash from '../../src/commands/hash';
import { fakeProcess, testRun } from '../fixtures';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

describe('monofo hash', () => {
  it('returns help output', async () => {
    return expect(testRun(Hash, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });

  it('returns the content hash for the pure scenario', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    const { stdout } = await testRun(Hash, ['foo']);
    expect(stdout).toContain('0ffe034c45380e93a2f65d67d8c286a237b00285233c91b778ba70f860c7b54a');
  });
});
