import Config from '../config';
import { BaseArgs, setUpHander } from '../handler';
import { Command } from '../util';

interface ListArgs extends BaseArgs {
  componentName?: string;
}

const cmd: Command<ListArgs> = {
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
    setUpHander(args);

    const { componentName } = args as Required<ListArgs>;
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
