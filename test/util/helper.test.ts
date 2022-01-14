import { depthSort } from '../../src/util/helper';

describe('depthSort', () => {
  it('sorts a nice scenario', () => {
    expect(
      depthSort(['./foo/bar/node_modules/', './node_modules/', './something/node_modules/', './foo/node_modules/'])
    ).toEqual(['./node_modules/', './foo/node_modules/', './something/node_modules/', './foo/bar/node_modules/']);
  });

  it('sorts by number of dirs', () => {
    expect(
      depthSort([
        'A/file1',
        'A/B/C/D/file3',
        'A/B/file1',
        'A/B/file2',
        'A/B/C/D/file1',
        'A/file2',
        'A/W/X/Y/Z/file1',
        'A/W/file1',
        'A/W/X/file1',
        'A/file3',
        'A/B/C/file1',
        'A/W/X/Y/file1',
        'A/B/file2',
      ])
    ).toEqual([
      'A/file1',
      'A/file2',
      'A/file3',
      'A/B/file1',
      'A/B/file2',
      'A/W/file1',
      'A/B/C/file1',
      'A/W/X/file1',
      'A/B/C/D/file1',
      'A/B/C/D/file3',
      'A/W/X/Y/file1',
      'A/W/X/Y/Z/file1',
    ]);
  });
});
