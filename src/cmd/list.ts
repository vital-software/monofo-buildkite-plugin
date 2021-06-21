import { Arguments, CommandModule } from 'yargs';
import Config from '../config';

interface ListArgs {
  componentName: string;
}

const cmd: CommandModule = {
  command: 'list <componentName>',
  describe: 'List matching files for different parts of the pipeline',
  aliases: ['ls'],
  builder: (yargs) =>
    yargs.positional('componentName', {
      describe: 'Name of the component that was successful',
      type: 'string',
      required: true,
    }),

  async handler(args): Promise<string> {
    const { componentName } = args as Arguments<ListArgs>;
    const config: Config | undefined = await Config.getOne(process.cwd(), componentName);

    if (!config) {
      const e = new Error('Could not read component configuration');
      process.stderr.write(`${e.message}\n`);
      return Promise.reject(e);
    }

    const matching = await config.getMatchingFiles();
    const output = matching.files.join('\n');

    process.stdout.write(`${output}\n`);
    return output;
  },
};

export = cmd;
