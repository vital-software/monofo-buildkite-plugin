import { main } from '../src';
import path from 'path';

describe('Main Entrypoint', () => {
  it('can be executed with no configuration', () => {
    process.chdir(__dirname);
    return expect(main()).rejects.toThrowError('No pipeline files');
  });

  it('can be executed with simple configuration', async () => {
    process.chdir(path.resolve(__dirname, 'projects/simple'));
    expect(await main()).toBe(undefined);
  });
});
