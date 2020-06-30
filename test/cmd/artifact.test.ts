import path from 'path';
import { fakeProcess } from '../fixtures';
import artifact from '../../src/cmd/artifact';
import execSync from './exec';
import { AgentOutput, download } from '../../src/buildkite/agent';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/agent');

const mockDownload = download as jest.Mock<Promise<AgentOutput>>;

describe('cmd artifact', () => {
  beforeEach(() => {
    process.env = fakeProcess();
  });

  afterEach(() => {
    mockDownload.mockReset();
  });

  it('can output help information', async () => {
    return expect(execSync(artifact, 'artifact --help --verbose')).resolves.toContain('Ensures artifacts are present');
  });

  it('will error if the buildkite agent always fails', async () => {
    process.env = fakeProcess();
    process.chdir(__dirname);
    mockDownload.mockImplementation(() =>
      Promise.reject(new Error('Cannot run buildkite-agent because of some reason'))
    );

    await expect(
      (artifact.handler({
        verbose: false,
        artifacts: ['foo', 'bar', 'baz'],
        build: ['abc', 'def', 'ghi'],
        $0: '',
        _: [],
      }) as unknown) as Promise<void>
    ).rejects.toBeInstanceOf(Error);

    expect(mockDownload).toHaveBeenCalledTimes(9);
    expect(mockDownload).toHaveBeenCalledWith('foo', 'foo', 'abc');
    expect(mockDownload).toHaveBeenCalledWith('foo', 'foo', 'def');
    expect(mockDownload).toHaveBeenCalledWith('foo', 'foo', 'ghi');
    expect(mockDownload).toHaveBeenCalledWith('bar', 'bar', 'abc');
    expect(mockDownload).toHaveBeenCalledWith('bar', 'bar', 'def');
    expect(mockDownload).toHaveBeenCalledWith('bar', 'bar', 'ghi');
    expect(mockDownload).toHaveBeenCalledWith('baz', 'baz', 'abc');
    expect(mockDownload).toHaveBeenCalledWith('baz', 'baz', 'def');
    expect(mockDownload).toHaveBeenCalledWith('baz', 'baz', 'ghi');
  });

  it('can be executed with simple configuration', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/simple'));
    mockDownload.mockImplementation(() => Promise.resolve({} as AgentOutput));

    await ((artifact.handler({
      verbose: true,
      artifacts: ['foo', 'bar', 'baz'],
      build: ['abc', 'def'],
      $0: '',
      _: [],
    }) as unknown) as Promise<void>);

    expect(mockDownload).toHaveBeenCalledTimes(3);
  });
});
