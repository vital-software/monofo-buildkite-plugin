#!/usr/bin/env node

import getConfigs from './config';
import { getBaseCommit, matchConfigs } from './diff';
import { toPipeline } from './pipeline';
import debug from 'debug';
import { diff } from './git';
import Promise from 'bluebird';
import { safeDump } from 'js-yaml';

export async function main(shutdown: () => void = () => process.exit(0)) {
  const config = getConfigs();
  const changed = getBaseCommit().then(diff);

  if ((await config).length === 0) {
    throw new Error(`No pipeline files to process (cwd: ${process.cwd()})`);
  }

  return Promise.join(config, changed, matchConfigs)
    .then(toPipeline)
    .then((pipeline) => {
      process.stdout.write(safeDump(pipeline) + '\n', 'utf-8', shutdown);
    });
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
