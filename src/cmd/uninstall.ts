import { AWSError } from 'aws-sdk';
import debug from 'debug';
import { CommandModule } from 'yargs';
import { CACHE_METADATA_TABLE_NAME } from '../cache-metadata';
import { service } from '../dynamodb';

const log = debug('monofo:cmd:uninstall');

async function deleteTable(): Promise<void> {
  try {
    await service.deleteTable({ TableName: CACHE_METADATA_TABLE_NAME }).promise();
  } catch (e) {
    if ((e as AWSError).code === 'ResourceNotFoundException') {
      log('Could not find table to remove: probably already uninstalled');
      return;
    }

    throw e;
  }
}

const cmd: CommandModule = {
  command: 'uninstall',
  describe: 'Uninstalls the DynamoDB table',
  aliases: '$0',
  builder: {},

  async handler(): Promise<void> {
    await deleteTable();
  },
};

export = cmd;
