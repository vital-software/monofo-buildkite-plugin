import AWS from 'aws-sdk';
import debug from 'debug';
import { CommandModule } from 'yargs';
import { CacheMetadataRepository } from '../cache-metadata';

const log = debug('monofo:cmd:install');

const cmd: CommandModule = {
  command: 'install',
  describe: 'Installs a DynamoDB table to store cache pointers for pure builds',
  aliases: '$0',
  builder: {},

  async handler(): Promise<void> {
    const ddb = new AWS.DynamoDB();
    const metadata = new CacheMetadataRepository(ddb);

    if (!(await metadata.tableExists())) {
      await metadata.createTable();
      log('Table was installed');
    } else {
      log('Found existing table, already installed');
    }
  },
};

export = cmd;
