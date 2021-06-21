import { AWSError } from 'aws-sdk';
import debug from 'debug';
import { CACHE_METADATA_TABLE_NAME } from '../cache-metadata';
import { service } from '../dynamodb';
import { setUpHander } from '../handler';
import { Command } from '../util';

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

const cmd: Command = {
  command: 'uninstall',
  describe: 'Uninstalls the DynamoDB table',
  builder: {},

  async handler(args): Promise<void> {
    setUpHander(args);

    await deleteTable();
  },
};

export = cmd;
