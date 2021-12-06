import { BaseCommand } from '../command';
import Config from '../config';

interface ListArgs {
  componentName: string;
}

export default class List extends BaseCommand {
  static description = 'list matching files for different parts of the pipeline';

  static flags = { ...BaseCommand.flags };

  static args = [
    {
      name: 'componentName',
      description: 'Name of the component to list',
      required: true,
    },
  ];

  async run() {
    const {
      args: { componentName },
    } = this.parse<unknown, ListArgs>(List);

    const config: Config | undefined = await Config.getOne(process.cwd(), componentName);

    if (!config) {
      const e = new Error('Could not read component configuration');
      process.stderr.write(`${e.message}\n`);
      return Promise.reject(e);
    }

    const matching = await config.getMatchingFiles();
    const output = matching.join('\n');

    process.stdout.write(`${output}\n`);
    return output;
  }
}
