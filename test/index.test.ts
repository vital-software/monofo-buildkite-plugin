import { main } from '../src';
import path from 'path';
import { fakeProcess } from './fixtures';
import { mergeBase } from '../src/git';

jest.mock('../src/git');

const mockedMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockedMergeBase.mockImplementation(() => Promise.resolve('foo'));

describe('main()', () => {
  it('can be executed with no configuration', () => {
    process.env = fakeProcess();
    process.chdir(__dirname);
    return expect(main()).rejects.toThrowError('No pipeline files');
  });

  it('can be executed with simple configuration', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, 'projects/simple'));
    expect(await main()).toBe(undefined);
  });
});
