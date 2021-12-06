import path from 'path';
import { stdout } from 'stdout-stderr';
import List from '../../src/commands/list';
import { fakeProcess } from '../fixtures';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

describe('monofo list', () => {
  it('returns help output', async () => {
    stdout.start();
    await List.run(['--help']);
    stdout.stop();
    expect(stdout.output).toContain('List matching files');
  });

  it('returns matching files for the pure scenario', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    stdout.start();
    await List.run(['foo']);
    stdout.stop();
    expect(stdout.output).toContain('foo/README.md');
  });
});
