import Download from '../../src/commands/download';
import { fakeProcess, testRun } from '../fixtures';

describe('cmd download', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  it('returns help output', async () => {
    return expect(testRun(Download, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });
});
