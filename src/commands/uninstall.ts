import { SdkError } from '@aws-sdk/types';
import debug from 'debug';
import { CACHE_METADATA_TABLE_NAME } from '../cache-metadata';
import { BaseCommand } from '../command';
import { service } from '../dynamodb';

const log = debug('monofo:cmd:uninstall');

export default class Uninstall extends BaseCommand {
  static override description = 'Uninstalls the Monofo DynamoDB tables';

  static override flags = { ...BaseCommand.flags };

  async run() {
    try {
      await service.deleteTable({ TableName: CACHE_METADATA_TABLE_NAME });
    } catch (e) {
      if ((e as SdkError).name === 'ResourceNotFoundException') {
        log('Could not find table to remove: probably already uninstalled');
        return;
      }

      throw e;
    }
  }
}
