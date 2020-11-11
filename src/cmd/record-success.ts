import AWS from 'aws-sdk';
import { Arguments, CommandModule } from 'yargs';
import { getBuildkiteInfo } from '../buildkite/config';
import { CacheMetadataRepository } from '../cache-metadata';

interface RecordSuccessArgs {
  component: string;
  contentHash: string;
}

const cmd: CommandModule = {
  command: 'record-success <component> <contentHash>',
  describe: 'Record success of a component of the build, so that we can skip it next time if possible',
  builder: (yargs) =>
    yargs
      .positional('component', {
        describe: 'Name of the component that was successful',
        type: 'string',
        required: true,
      })
      .positional('contentHash', {
        describe: 'Content hash (SHA256) of the matching files for this successful component',
        type: 'string',
        required: true,
      }),

  async handler(args): Promise<void> {
    const { component, contentHash } = args as Arguments<RecordSuccessArgs>;
    const { buildId, pipeline } = getBuildkiteInfo();

    const ddb = new AWS.DynamoDB();
    const metadata = new CacheMetadataRepository(ddb);

    process.stdout.write(`Recording success of ${component}\n`);
    await metadata.put({
      contentHash,
      buildId,
      component: `${pipeline}/${component}`,
    });
    process.stdout.write(`Done!\n`);
  },
};

export = cmd;
