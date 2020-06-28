import { CommandModule } from 'yargs';
import { getBaseBuild } from '../diff';
import { getBuildkiteInfo } from '../config';

const cmd: CommandModule = {
  command: 'base-commit',
  describe: 'Output a base commit hash, from which the current build should be compared',
  builder: {},

  handler(): Promise<string> {
    return getBaseBuild(getBuildkiteInfo(process.env))
      .then((b) => {
        process.stdout.write(`${b.commit}\n`);
        return b.commit;
      })
      .catch((e: Error) => {
        process.stderr.write(`${e.message}\n`);
        return Promise.reject(e);
      });
  },
};

export = cmd;
