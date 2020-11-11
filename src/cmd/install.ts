import { AWSError } from 'aws-sdk';
import debug from 'debug';
import { CommandModule } from 'yargs';
import { CACHE_METADATA_TABLE_DEFINITION, CACHE_METADATA_TABLE_NAME } from '../cache-metadata';
import { service } from '../dynamodb';

const log = debug('monofo:cmd:install');

async function createTable(): Promise<void> {
  try {
    await service.createTable(CACHE_METADATA_TABLE_DEFINITION).promise();
  } catch (e) {
    if ((e as AWSError).code === 'ResourceInUseException') {
      log('Received ResourceInUseException because table likely already exists, continuing');
      return;
    }

    throw e;
  }
}

async function tableExists(): Promise<boolean> {
  try {
    await service.describeTable({ TableName: CACHE_METADATA_TABLE_NAME }).promise();
    return true;
  } catch (e) {
    if ((e as AWSError).code === 'ResourceNotFoundException') {
      return false;
    }

    throw e;
  }
}

const cmd: CommandModule = {
  command: 'install',
  describe: 'Installs a DynamoDB table to store cache pointers for pure builds',
  aliases: '$0',
  builder: {},

  async handler(): Promise<void> {
    if (!(await tableExists())) {
      await createTable();
      log('Table was installed');
    } else {
      log('Found existing table, already installed');
    }
  },
};

export = cmd;
