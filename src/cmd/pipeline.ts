import { CommandModule } from 'yargs';
import { safeDump } from 'js-yaml';
import getConfigs from '../config';
import { getBaseCommit, matchConfigs } from '../diff';
import { diff } from '../git';
import { mergePipelines } from '../pipeline';

const cmd: CommandModule = {
  command: 'pipeline',
  describe: 'Output a merged pipeline.yml',
  aliases: '$0',
  builder: {},

  handler(): Promise<string> {
    const config = getConfigs().then((c) =>
      c.length > 0 ? c : Promise.reject(new Error(`No pipeline files to process (cwd: ${process.cwd()})`))
    );
    const changed = getBaseCommit().then(diff);

    return Promise.all([config, changed])
      .then(([c, f]) => matchConfigs(c, f))
      .then(mergePipelines)
      .then(safeDump)
      .then((v) => {
        process.stdout.write(`${v}\n`);
        return v;
      });
  },
};

export = cmd;
