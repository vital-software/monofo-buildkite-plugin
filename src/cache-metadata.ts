import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import debug from 'debug';

const log = debug('monofo:cache-metadata');

const SEVEN_DAYS_SECS = 7 * 24 * 60 * 60;

export interface CacheMetadataKey {
  contentHash: string;
  component: string;
}

export interface CacheMetadata extends CacheMetadataKey {
  buildId: string;
  commit: string;
}

export const CACHE_METADATA_TABLE_NAME = 'monofo_cache_metadata';
const TableName = CACHE_METADATA_TABLE_NAME;

export const CACHE_METADATA_TABLE_DEFINITION = {
  TableName,
  BillingMode: 'PAY_PER_REQUEST',
  AttributeDefinitions: [
    {
      AttributeName: 'contentHash',
      AttributeType: 'S',
    },
    {
      AttributeName: 'component',
      AttributeType: 'S',
    },
  ],
  KeySchema: [
    {
      AttributeName: 'contentHash',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'component',
      KeyType: 'RANGE',
    },
  ],
};

export class CacheMetadataRepository {
  private readonly client: DocumentClient;

  public constructor(private readonly service: AWS.DynamoDB) {
    this.client = new DocumentClient({ service });
  }

  public async getAll(keys: CacheMetadataKey[]): Promise<CacheMetadata[]> {
    if (keys.length < 1) {
      return Promise.resolve([]);
    }

    log('Getting cache metadata for keys', keys);
    const res = await this.client
      .batchGet({
        RequestItems: {
          [TableName]: {
            Keys: keys,
          },
        },
      })
      .promise();

    log('Got result', res?.Responses?.[TableName] || []);
    return (res?.Responses?.[TableName] as CacheMetadata[]) || [];
  }

  public async put(item: CacheMetadata): Promise<void> {
    log('Putting cache metadata', item);
    await this.client
      .put({
        TableName,
        Item: { ...item, expiresAt: Date.now() / 1000 + SEVEN_DAYS_SECS },
      })
      .promise();
  }
}
