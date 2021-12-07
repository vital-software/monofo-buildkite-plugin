import { BaseCommand } from '../command';
import Config from '../config';
import { FileHasher } from '../hash';

interface HashArgs {
  pipeline: string;
}

export default class Hash extends BaseCommand {
  static override description = 'hash the specified component and output the value';

  static override args = [
    {
      name: 'pipeline',
      required: true,
      description: 'Name of the sub-pipeline to hash',
    },
  ];

  static override flags = { ...BaseCommand.flags };

  async run(): Promise<void> {
    const {
      args: { pipeline },
    } = this.parse<unknown, HashArgs>(Hash);

    const config: Config | undefined = await Config.getOne(process.cwd(), pipeline);

    if (!config) {
      this.error(`Could not read component configuration`, { exit: 2 });
    }

    const hasher = new FileHasher();
    const hash = await config.getContentHash(hasher);

    process.stdout.write(`${hash}\n`);
  }
}
