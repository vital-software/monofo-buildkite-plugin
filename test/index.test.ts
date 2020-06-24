import path from 'path';
import { main } from '../src';
import { fakeProcess } from './fixtures';
import { mergeBase, diff } from '../src/git';

jest.mock('../src/git');

const mockMergeBase = mergeBase as jest.Mock<Promise<string>>;
mockMergeBase.mockImplementation(() => Promise.resolve('foo'));

const mockDiff = diff as jest.Mock<Promise<string[]>>;
mockDiff.mockImplementation(() => Promise.resolve(['foo/README.md', 'baz/abc.ts']));

describe('main()', () => {
  it('can be executed with no configuration', () => {
    process.env = fakeProcess();
    process.chdir(__dirname);
    return expect(main(() => Promise.resolve())).rejects.toThrowError('No pipeline files');
  });

  it('can be executed with simple configuration', () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, 'projects/simple'));

    main((p) => {
      expect(p.steps.map((s) => s.command)).toStrictEqual(['echo "foo1"', "echo 'bar was replaced'", 'echo "baz1"']);
      expect(Object.entries(p.env)).toHaveLength(4); // merged from all files
      return Promise.resolve().then(() => cb());
    });
  });
});
