import AWS from 'aws-sdk';
import { Arguments, CommandModule } from 'yargs';
import { CacheMetadataRepository } from '../cache-metadata';

const SEVEN_DAYS_SECS = 7 * 24 * 60 * 60;

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
    const buildId = process.env.BUILDKITE_BUILD_ID;

    const ddb = new AWS.DynamoDB();
    const metadata = new CacheMetadataRepository(ddb);

    process.stdout.write(`Recording success of ${component}\n`);
    await metadata.put({
      component,
      contentHash,
      buildId,
      expiresAt: Date.now() / 1000 + SEVEN_DAYS_SECS,
    });
    process.stdout.write(`Done!\n`);
  },
};

export = cmd;
