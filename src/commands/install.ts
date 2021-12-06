import { AWSError } from 'aws-sdk';
import { DescribeTableOutput } from 'aws-sdk/clients/dynamodb';
import debug from 'debug';
import { CACHE_METADATA_TABLE_DEFINITION, CACHE_METADATA_TABLE_NAME } from '../cache-metadata';
import { BaseCommand } from '../command';
import { service } from '../dynamodb';

const log = debug('monofo:cmd:install');

function delay(millis: number): Promise<void> {
  return new Promise((next) => {
    setTimeout(() => {
      next();
    }, millis);
  });
}

export default class Install extends BaseCommand {
  static description = 'install a DynamoDB table to store cache pointers for pure builds';

  static flags = { ...BaseCommand.flags };

  async run(): Promise<string> {
    if (!(await Install.describeTable())) {
      await Install.createTable();
      log('Table was installed');
      return 'Table was installed';
    }

    log('Found existing table, already installed');
    return 'Found existing table, already installed';
  }

  private static async createTable(): Promise<void> {
    log('Creating table');
    try {
      await service.createTable(CACHE_METADATA_TABLE_DEFINITION).promise();
    } catch (e) {
      if ((e as AWSError).code === 'ResourceInUseException') {
        log('Received ResourceInUseException because table likely already exists, continuing');
        return;
      }

      throw e;
    }

    await Install.tableReady();

    log('Configuring TTL');
    await service
      .updateTimeToLive({
        TableName: CACHE_METADATA_TABLE_NAME,
        TimeToLiveSpecification: {
          Enabled: true,
          AttributeName: 'expiresAt',
        },
      })
      .promise();
  }

  private static async tableReady(): Promise<void> {
    let i = 0;
    do {
      log('Waiting for table to be ready');

      // eslint-disable-next-line no-await-in-loop
      const description = await Install.describeTable();

      if (description?.Table?.TableStatus === 'ACTIVE') {
        log('Table is ready');
        return;
      }

      // eslint-disable-next-line no-await-in-loop
      await delay(2000);
      i += 1;
    } while (i < 10);

    log('Gave up waiting for table ready');
  }

  private static async describeTable(): Promise<DescribeTableOutput | undefined> {
    let result;

    try {
      result = await service.describeTable({ TableName: CACHE_METADATA_TABLE_NAME }).promise();
    } catch (e) {
      if ((e as AWSError).code === 'ResourceNotFoundException') {
        return undefined;
      }

      throw e;
    }

    return result;
  }
}
