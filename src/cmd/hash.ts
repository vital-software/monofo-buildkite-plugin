import Config from '../config';
import { BaseArgs, setUpHander, Command } from '../handler';
import { FileHasher } from '../hash';

interface HashArgs extends BaseArgs {
  componentName?: string;
}

const cmd: Command<HashArgs> = {
  command: 'hash <componentName>',
  describe: 'Return the content hash for matching files of a part of the pipeline',
  builder: (yargs) =>
    yargs.positional('componentName', {
      describe: 'Name of the component that was successful',
      type: 'string',
      required: true,
    }),
  async handler(args) {
    await cmd.innerHandler(args);
  },
  async innerHandler(args) {
    setUpHander(args);

    const { componentName } = args as Required<HashArgs>;
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
