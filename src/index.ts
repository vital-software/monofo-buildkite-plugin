#!/usr/bin/env node

import getConfigs from './config';
import { getBaseCommit, matchConfigs } from './diff';
import { toPipeline, outputPipeline } from './pipeline';
import debug from 'debug';
import { diff } from './git';
import Promise from 'bluebird';

export async function main() {
  const config = getConfigs();
  const changed = getBaseCommit().then(diff);

  if ((await config).length === 0) {
    throw new Error(`No pipeline files to process (cwd: ${process.cwd()})`);
  }

  return Promise.join(config, changed, matchConfigs).then(toPipeline).then(outputPipeline);
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
    process.exit(0);
  })();
}
