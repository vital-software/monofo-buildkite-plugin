import path from 'path';
import { fakeProcess } from '../test/fixtures';
import { hashFiles } from './hash';

describe('hashFiles()', () => {
  it('receives changes and hashes file contents', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../test/projects/pure'));

    const hash = await hashFiles(['foo.txt', 'bar.txt']);
    expect(hash).toBe('bf08b994d7e8729106e45702f8a41d3e43e0139177e700f20c2e372f7835625e');
  });
});
