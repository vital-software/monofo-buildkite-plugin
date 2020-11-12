import { startDb, stopDb, createTables } from 'jest-dynalite';
import { CacheMetadataRepository } from '../src/cache-metadata';
import { service } from '../src/dynamodb';
import { BUILD_ID, fakeProcess, PIPELINE } from './fixtures';

describe('CacheMetadataRepository', () => {
  beforeAll(startDb);
  beforeAll(createTables);
  afterAll(stopDb);

  it('can write and retrieve cache metadata entries', async () => {
    process.env = fakeProcess();

    const repository = new CacheMetadataRepository(service);
    const component = `${PIPELINE}/foo`;
    const contentHash = 'abc';

    await repository.put({
      buildId: BUILD_ID,
      contentHash,
      component,
    });

    const res = await repository.getAll([{ contentHash, component }]);

    expect(res?.[0]?.buildId).toBe(BUILD_ID);
  });
});
