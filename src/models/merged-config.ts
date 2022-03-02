import chalk from 'chalk';
import debug from 'debug';
import _ from 'lodash';
import sendBuildkiteAnnotation from '../annotate';
import { BuildkiteBuild } from '../buildkite/client';
import { updateDecisions } from '../decide';
import { replaceExcludedKeys } from '../merge';
import { artifactInjectionSteps } from '../steps/artifact-injection';
import { nothingToDoSteps } from '../steps/nothing-to-do';
import { recordSuccessSteps } from '../steps/record-success';
import { count } from '../util/helper';
import Config from './config';
import { Decision } from './decision';
import { mergeGroups } from './group-step';
import { Pipeline } from './pipeline';
import { Step } from './step';

const log = debug('monofo:merged-config');

/**
 * Gets the base build environment variables - one or more extra env vars that should be included in the built pipeline
 *
 * Currently, we use a single base build for all components, so we only export a single env var. But if, in the future,
 * we get fancier, we should emit one for each component. `MONOFO_${config.envVarName()}_BASE_BUILD_ID`
 */
function baseBuildEnvVars(config: Config): Record<string, string | undefined> {
  return {
    MONOFO_BASE_BUILD_ID: config.baseBuild?.id || 'unknown',
    MONOFO_BASE_BUILD_COMMIT: config.baseBuild?.commit || 'unknown',
  };
}

function toMerge(config: Config): Pipeline {
  const { monorepo, included, steps, env } = config;

  const excludedEnv = Object.entries(monorepo.excluded_env).length > 0 ? monorepo.excluded_env : {};
  const excludedSteps = monorepo.excluded_steps.length > 0 ? monorepo.excluded_steps : [];

  return {
    env: Object.assign(baseBuildEnvVars(config), included ? env : excludedEnv),
    steps: included ? steps : excludedSteps,
  };
}

function toPipeline(steps: Step[]): Pipeline {
  return { env: {}, steps };
}

export class MergedConfig {
  constructor(public readonly configs: Config[]) {
    if (configs.length < 1) {
      throw new Error(`No configs files to merge`);
    }
  }

  public setChangedFiles(build: BuildkiteBuild, changedFiles: string[]): this {
    log(`Found ${count(changedFiles, 'changed file')}: ${changedFiles.join(', ')}`);

    this.configs.forEach((config) => {
      config.setBaseBuild(build);
      config.updateMatchingChanges(changedFiles);

      if (config.changes.length > 1) {
        log(`Found ${count(config.changes, 'matching change')} for ${config.monorepo.name}`);
      }
    });

    return this;
  }

  /**
   * This is the main co-ordinating function at the heart of the pipeline generator
   *
   * It takes a set of configs, puts them through the decision-making process, and merges the final product together into
   * a single Pipeline that is returned
   */
  public async toPipeline(): Promise<Pipeline> {
    log(`Merging ${this.configs.length} pipelines`);

    await updateDecisions(this.configs);

    const maxLen = Math.min(20, Math.max(...this.configs.map((c) => c.monorepo.name.length)));

    // Announce decisions
    this.configs.forEach((config) => {
      log(
        `${config.included ? '✅' : '🚫'}  ${chalk.blue(config.monorepo.name.padEnd(maxLen))} will be ${
          config.included ? chalk.green('included') : chalk.red('excluded')
        } because it has ${config.reason.toString()}`
      );
    });

    // @todo This should be pure, not send an annotation
    await sendBuildkiteAnnotation(this.configs);

    const artifactSteps = artifactInjectionSteps(this.configs);

    replaceExcludedKeys(this.configs, artifactSteps.length > 0);

    const pipelineParts: Pipeline[] = [
      toPipeline(artifactSteps),
      ...this.configs.map(toMerge),
      toPipeline(nothingToDoSteps(this.configs)),
      toPipeline(await recordSuccessSteps(this.configs)),
    ];

    const merged: Pipeline = _.mergeWith({}, ...pipelineParts, (dst: unknown, src: unknown) =>
      _.isArray(dst) ? dst.concat(src) : undefined
    ) as Pipeline;

    mergeGroups(merged);

    return merged;
  }

  public decisions(): Decision[] {
    return this.configs.map((config) => new Decision(config.monorepo.name, config.included, config.reason));
  }

  public static async fromDir(dir: string = process.cwd()): Promise<MergedConfig> {
    return new MergedConfig(Config.sort((await Config.getAll(dir)).filter((c) => c)));
  }
}
