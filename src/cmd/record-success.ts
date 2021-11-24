import AWS from 'aws-sdk';
import { getBuildkiteInfo } from '../buildkite/config';
import { CacheMetadataRepository } from '../cache-metadata';
import { setUpHander, BaseArgs } from '../handler';
import { Command } from '../types/cmd';

interface RecordSuccessArgs extends BaseArgs {
  componentName?: string;
  contentHash?: string;
}

const cmd: Command<RecordSuccessArgs> = {
  command: 'record-success <componentName> <contentHash>',
  describe: 'Record success of a component of the build, so that we can skip it next time if possible',
  builder: (yargs) =>
    yargs
      .positional('componentName', {
        describe: 'Name of the component that was successful',
        type: 'string',
        required: true,
      })
      .positional('contentHash', {
        describe: 'Content hash (SHA256) of the matching files for this successful component',
        type: 'string',
        required: true,
      }),

  async innerHandler(args): Promise<string> {
    setUpHander(args);

    // Required<T>, because .positional() enforces for us (not reflected in type)
    const { componentName, contentHash } = args as Required<RecordSuccessArgs>;
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
  },

  async handler(args) {
    await cmd.innerHandler(args);
  },
};

export = cmd;
