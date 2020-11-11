import { AWSError } from 'aws-sdk';
import debug from 'debug';
import { CommandModule } from 'yargs';
import { db, METADATA_TABLE_NAME as TableName } from '../aws';

const log = debug('monofo:cmd:install');

async function tableExists(): Promise<boolean> {
  try {
    await db.describeTable({ TableName }).promise();
    return true;
  } catch (e) {
    if ((e as AWSError).code === 'ResourceNotFoundException') {
      return false;
    }

    throw e;
  }
}

async function createTable(): Promise<void> {
  try {
    await db
      .createTable({
        TableName,
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [
          {
            AttributeName: 'contentHash',
            AttributeType: 'S',
          },
          {
            AttributeName: 'artifact',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'contentHash',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'artifact',
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
