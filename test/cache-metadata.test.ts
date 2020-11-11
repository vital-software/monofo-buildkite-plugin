import { startDb, stopDb, createTables } from 'jest-dynalite';
import { CacheMetadataRepository } from '../src/cache-metadata';
import { service } from '../src/dynamodb';
import { BUILD_ID, PIPELINE } from './fixtures';

describe('CacheMetadataRepository', () => {
  beforeAll(startDb);
  beforeAll(createTables);
  afterAll(stopDb);

  it('can write and retrieve cache metadata entries', async () => {
    process.env.AWS_SDK_LOAD_CONFIG = '1';
    process.env.AWS_ACCESS_KEY_ID = 'foo';
    process.env.AWS_SECRET_ACCESS_KEY = 'bar';
    process.env.AWS_REGION = 'us-west-2';

    const repository = new CacheMetadataRepository(service);
    const component = `${PIPELINE}/foo`;
    const contentHash = 'abc';

    await repository.put({
      buildId: BUILD_ID,
      contentHash,
      component,
    });

    const res = await repository.get(contentHash, component);

    expect(res?.buildId).toBe(BUILD_ID);
  });
});
