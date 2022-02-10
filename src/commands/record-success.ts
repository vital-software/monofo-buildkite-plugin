import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { getBuildkiteInfo } from '../buildkite/config';
import { CacheMetadataRepository } from '../cache-metadata';
import { BaseCommand } from '../command';

interface RecordSuccessArgs {
  componentName: string;
  contentHash: string;
}

export default class RecordSuccess extends BaseCommand {
  static override description =
    'Record success of a component of the build, so that we can skip it next time if possible';

  static override flags = { ...BaseCommand.flags };

  static override args = [
    { name: 'componentName', description: 'Name of the component that was successful', required: true },
    {
      name: 'contentHash',
      description: 'Content hash (SHA256) of the matching files for this successful component',
      required: true,
    },
  ];

  async run() {
    const {
      args: { componentName, contentHash },
    } = await this.parse<unknown, RecordSuccessArgs>(RecordSuccess);
    const { buildId, pipeline, commit } = getBuildkiteInfo();

    const ddb = new DynamoDB({});
    const metadata = new CacheMetadataRepository(ddb);

    process.stdout.write(`Recording success of ${componentName}\n`);
    await metadata.put({
      contentHash,
      buildId,
      commit,
      component: `${pipeline}/${componentName}`, // See also Config.getComponent()
    });
    process.stdout.write(`Done!\n`);

    return `Recorded success of ${componentName}`;
  }
}
