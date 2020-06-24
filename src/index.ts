#!/usr/bin/env node

import getConfigs from './config';
import { getBaseCommit, matchConfigs } from './diff';
import { mergePipelines, Pipeline } from './pipeline';
import debug from 'debug';
import { diff } from './git';
import { safeDump } from 'js-yaml';
import util from 'util';

const write = util.promisify(process.stdout.write);
const stdOutThenExit = (pipeline: Pipeline): Promise<void> =>
  write(safeDump(pipeline) + '\n').then(() => process.exit(0));

export async function main(writePipeline: (p: Pipeline) => Promise<void> = stdOutThenExit): Promise<void> {
  const config = getConfigs();
  const changed = getBaseCommit().then(diff);

  if ((await config).length === 0) {
    throw new Error(`No pipeline files to process (cwd: ${process.cwd()})`);
  }

  return config
    .then((c) => changed.then((f) => matchConfigs(c, f)))
    .then(mergePipelines)
    .then(writePipeline);
}

if (require.main === module) {
  (async function () {
    try {
      await main();
    } catch (e) {
      debug('monofo:main')(e);
      process.stderr.write(`${e.message}\n`);
      process.exit(2);
    }
  })();
}
