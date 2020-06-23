import { main } from '../src';
import path from 'path';

describe('Main Entrypoint', () => {
  // it('can be executed', async () => {
  //   expect(await main()).toBe(undefined);
  // });

  it('can be executed in other directory', async () => {
    process.chdir(path.resolve(__dirname, 'projects/simple'));
    expect(await main()).toBe(undefined);
  });
});
