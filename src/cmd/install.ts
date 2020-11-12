import { AWSError } from 'aws-sdk';
import { DescribeTableOutput } from 'aws-sdk/clients/dynamodb';
import debug from 'debug';
import { CommandModule } from 'yargs';
import { CACHE_METADATA_TABLE_DEFINITION, CACHE_METADATA_TABLE_NAME } from '../cache-metadata';
import { service } from '../dynamodb';

const log = debug('monofo:cmd:install');

function delay(millis: number): Promise<void> {
  return new Promise((next) => {
    setTimeout(() => {
      next();
    }, millis);
  });
}

async function describeTable(): Promise<DescribeTableOutput | undefined> {
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

async function tableReady(): Promise<void> {
  let i = 0;
  do {
    log('Waiting for table to be ready');

    // eslint-disable-next-line no-await-in-loop
    const description = await describeTable();

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

async function createTable(): Promise<void> {
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

  await tableReady();

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

const cmd: CommandModule = {
  command: 'install',
  describe: 'Installs a DynamoDB table to store cache pointers for pure builds',
  aliases: '$0',
  builder: {},

  async handler(): Promise<void> {
    if (!(await describeTable())) {
      await createTable();
      log('Table was installed');
    } else {
      log('Found existing table, already installed');
    }
  },
};

export = cmd;
