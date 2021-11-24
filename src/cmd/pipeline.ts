import debug from 'debug';
import { dump as dumpYaml } from 'js-yaml';
import { getBuildkiteInfo } from '../buildkite/config';
import Config from '../config';
import { getBaseBuild, matchConfigs } from '../diff';
import { diff } from '../git';
import { MonofoCommand, setUpHander, toCommand } from '../handler';
import mergePipelines from '../merge';

const log = debug('monofo:cmd:pipeline');

const cmd: MonofoCommand = {
  command: 'pipeline',
  describe: 'Output a merged pipeline.yml',
  aliases: '$0',
  builder: {},
  handler(args): Promise<string> {
    setUpHander(args);

    return Config.getAll(process.cwd())
      .then((c) =>
        c.length > 0 ? c : Promise.reject(new Error(`No pipeline files to process (cwd: ${process.cwd()})`))
      )
      .then((configs) => {
        return getBaseBuild(getBuildkiteInfo(process.env))
          .then((baseBuild) =>
            diff(baseBuild.commit).then((changedFiles) => matchConfigs(baseBuild, configs, changedFiles))
          )
          .catch((e: unknown) => {
            log('Failed to find base commit or diff changes, falling back to do a full build', e);
            Config.configureFallback(configs);
            return Promise.resolve();
          })
          .then(() => mergePipelines(configs));
      })
      .then(dumpYaml)
      .then((v) => {
        process.stdout.write(`${v}\n`);
        return v;
      });
  },
};

export = toCommand(cmd);
