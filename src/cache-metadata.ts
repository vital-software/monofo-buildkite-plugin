import AWS, { AWSError } from 'aws-sdk';
import { int } from 'aws-sdk/clients/datapipeline';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import debug from 'debug';

const log = debug('monofo:cache-metadata');

const SEVEN_DAYS_SECS = 7 * 24 * 60 * 60;

export interface CacheMetadata {
  contentHash: string;
  component: string;
  buildId: string;
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

  public async get(contentHash: string, component: string): Promise<CacheMetadata | undefined> {
    log('Putting cache metadata by key', contentHash, component);

    const response = await this.client
      .get({
        TableName,
        Key: {
          contentHash,
          component,
        },
      })
      .promise();

    log('Got response', response);

    return (response.Item as CacheMetadata) || undefined;
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
