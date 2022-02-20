import path from 'path';
import List from '../../src/commands/list';
import { fakeProcess, selectScenario, testRun } from '../fixtures';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

describe('monofo list', () => {
  it('returns help output', async () => {
    return expect(testRun(List, ['--help'])).rejects.toThrowError('EEXIT: 0');
  });

  it('returns matching files for the pure scenario', async () => {
    process.env = fakeProcess();
    selectScenario('pure');

    const { stdout } = await testRun(List, ['foo']);
    expect(stdout).toContain('foo/README.md');
  });
});
