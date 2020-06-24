import { getDiffBase, getDiff, getMatchingDiffResults } from '../src/diff';

describe('getDiffBase', () => {
  it('is a function', () => {
    expect(typeof getDiffBase).toBe('function');
  });
});

describe('getDiff', () => {
  it('is a function', () => {
    expect(typeof getDiff).toBe('function');
  });
});

describe('getMatchingDiffResults', () => {
  it('is a function', () => {
    expect(typeof getMatchingDiffResults).toBe('function');
  });
});
