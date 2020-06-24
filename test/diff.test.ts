import { getBaseCommit, matchConfigs } from '../src/diff';

describe('getBaseCommit', () => {
  it('is a function', () => {
    expect(typeof getBaseCommit).toBe('function');
  });
});

describe('matchConfigs', () => {
  it('is a function', () => {
    expect(typeof matchConfigs).toBe('function');
  });
});
