// used like: monofo get-artifact --base-commit=beefee123 .env.production

// this will:
//   - calculate or use the given base commit
//   - find a job corresponding to the lastest

import { CommandModule } from 'yargs';
import { getBaseBuild } from '../diff';
import { getBuildkiteInfo } from '../config';

const cmd: CommandModule = {
  command: 'artifact ',
  aliases: ['bc'],
  describe: 'Output a base commit hash, from which the current build should be compared',
  builder: (yargs) => {
    return yargs.string('build-id');
  },

  handler(): Promise<string> {
    return Promise.resolve('foo from artifact command');
  },
};

export = cmd;
