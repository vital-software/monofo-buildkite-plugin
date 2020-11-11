import { AWSError } from 'aws-sdk';
import debug from 'debug';
import { CommandModule } from 'yargs';
import { db, METADATA_TABLE_NAME as TableName } from '../aws';

const log = debug('monofo:cmd:uninstall');

const cmd: CommandModule = {
  command: 'uninstall',
  describe: 'Uninstalls the DynamoDB table',
  aliases: '$0',
  builder: {},

  async handler(): Promise<void> {
    try {
      await db.deleteTable({ TableName }).promise();
    } catch (e) {
      if ((e as AWSError).code === 'ResourceNotFoundException') {
        log('Could not find table to remove: probably already uninstalled');
        return;
      }

      throw e;
    }
  },
};

export = cmd;
