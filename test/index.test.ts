import { main } from '../src';

describe('Main Entrypoint', () => {
  it('can be executed', () => {
    expect(main()).toBe(undefined);
  });
});
