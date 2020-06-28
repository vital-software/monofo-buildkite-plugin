// used like: monofo get-artifact --base-commit=beefee123 .env.production

// this will:
//   - calculate or use the given base commit
//   - find a job corresponding to the lastest

import { CommandModule } from 'yargs';

const cmd: CommandModule = {
  command: 'artifact',
  describe: 'Inject an artifact into the current build',
  builder: (yargs) => {
    return yargs.string('build-id');
  },

  handler(): Promise<string> {
    return Promise.resolve('foo from artifact command');
  },
};

export = cmd;
