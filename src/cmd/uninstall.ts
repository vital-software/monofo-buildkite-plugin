import AWS from 'aws-sdk';
import debug from 'debug';
import { CommandModule } from 'yargs';
import { CacheMetadataRepository } from '../cache-metadata';

const log = debug('monofo:cmd:uninstall');

const cmd: CommandModule = {
  command: 'uninstall',
  describe: 'Uninstalls the DynamoDB table',
  aliases: '$0',
  builder: {},

  async handler(): Promise<void> {
    const ddb = new AWS.DynamoDB();
    const metadata = new CacheMetadataRepository(ddb);
    await metadata.deleteTable();
  },
};

export = cmd;
