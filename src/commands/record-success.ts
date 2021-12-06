import AWS from 'aws-sdk';
import { getBuildkiteInfo } from '../buildkite/config';
import { CacheMetadataRepository } from '../cache-metadata';
import { BaseCommand } from '../command';

interface RecordSuccessArgs {
  componentName: string;
  contentHash: string;
}

export default class RecordSuccess extends BaseCommand {
  static description = 'Record success of a component of the build, so that we can skip it next time if possible';

  static flags = { ...BaseCommand.flags };

  static args = [
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
    } = this.parse<unknown, RecordSuccessArgs>(RecordSuccess);
    const { buildId, pipeline, commit } = getBuildkiteInfo();

    const ddb = new AWS.DynamoDB();
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
