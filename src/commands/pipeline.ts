import debug from 'debug';
import { dump as dumpYaml } from 'js-yaml';
import { getBuildkiteInfo } from '../buildkite/config';
import { BaseCommand } from '../command';
import { getBaseBuild, matchConfigs } from '../diff';
import { diff } from '../git';
import mergePipelines from '../merge';
import Config from '../models/config';

const log = debug('monofo:cmd:pipeline');

export default class Pipeline extends BaseCommand {
  static override description = 'generate a dynamic pipeline.yml and output it';

  static override flags = { ...BaseCommand.flags };

  async run() {
    const configs = await Config.getAll(process.cwd());

    if (configs.length < 1) {
      throw new Error(`No pipeline files to process (cwd: ${process.cwd()})`);
    }

    try {
      const baseBuild = await getBaseBuild(getBuildkiteInfo(process.env));
      const changedFiles = await diff(baseBuild.commit);

      matchConfigs(baseBuild, configs, changedFiles);
    } catch (err: unknown) {
      log('Failed to find base commit or diff changes, falling back to do a full build', err);
      Config.configureFallback(configs);
      return Promise.resolve();
    }

    const yaml = dumpYaml(await mergePipelines(configs));

    process.stdout.write(`${yaml}\n`);
    return yaml;
  }
}
