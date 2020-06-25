import { CommandModule } from 'yargs';
import { getBaseCommit } from '../diff';

const cmd: CommandModule = {
  command: 'base-commit',
  aliases: ['bc'],
  describe: 'Output a base commit hash, from which the current build should be compared',
  builder: {},

  handler(): Promise<string> {
    return getBaseCommit().then((v) => {
      process.stdout.write(`${v}\n`);
      return v;
    });
  },
};

export = cmd;
