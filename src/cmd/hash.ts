import { Arguments, CommandModule } from 'yargs';
import Config from '../config';
import { FileHasher } from '../hash';

interface HashArgs {
  componentName: string;
}

const cmd: CommandModule = {
  command: 'hash <componentName>',
  describe: 'Return the content hash for matching files of a part of the pipeline',
  builder: (yargs) =>
    yargs.positional('componentName', {
      describe: 'Name of the component that was successful',
      type: 'string',
      required: true,
    }),

  async handler(args): Promise<string> {
    const { componentName } = args as Arguments<HashArgs>;
    const config: Config | undefined = await Config.getOne(process.cwd(), componentName);

    if (!config) {
      const e = new Error('Could not read component configuration');
      process.stderr.write(`${e.message}\n`);
      return Promise.reject(e);
    }

    const hasher = new FileHasher();
    const hash = await config.getContentHash(hasher);

    process.stdout.write(`${hash}\n`);
    return `${hash}\n`;
  },
};

export = cmd;
