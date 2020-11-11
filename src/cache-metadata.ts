import AWS, { AWSError } from 'aws-sdk';
import { int } from 'aws-sdk/clients/datapipeline';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import debug from 'debug';

const log = debug('monofo:cache-metadata');

export interface CacheMetadata {
  contentHash: string;
  component: string;
  buildId: string;
  expiresAt: int;
}

export const CACHE_METADATA_TABLE_NAME = 'monofo_cache_metadata';
const TableName = CACHE_METADATA_TABLE_NAME;

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
        Item: item,
      })
      .promise();
  }

  public async createTable(): Promise<void> {
    try {
      await this.service
        .createTable({
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
        })
        .promise();
    } catch (e) {
      if ((e as AWSError).code === 'ResourceInUseException') {
        log('Received ResourceInUseException because table likely already exists, continuing');
        return;
      }

      throw e;
    }
  }

  public async tableExists(): Promise<boolean> {
    try {
      await this.service.describeTable({ TableName }).promise();
      return true;
    } catch (e) {
      if ((e as AWSError).code === 'ResourceNotFoundException') {
        return false;
      }

      throw e;
    }
  }

  public async deleteTable(): Promise<void> {
    try {
      await this.service.deleteTable({ TableName }).promise();
    } catch (e) {
      if ((e as AWSError).code === 'ResourceNotFoundException') {
        log('Could not find table to remove: probably already uninstalled');
        return;
      }

      throw e;
    }
  }
}
