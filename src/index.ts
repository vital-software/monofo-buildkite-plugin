#!/usr/bin/env node

import getConfig from './config';
import { getDiff, getMatchingDiffResults } from './diff';
import { getPipeline, outputPipeline } from './pipeline';
import debug from 'debug';

export async function main() {
  const config = getConfig();
  const diff = getDiff();

  if ((await config).length === 0) {
    throw new Error(`No pipeline files to process (cwd: ${process.cwd()})`);
  }

  const matching = getMatchingDiffResults(await config, await diff);
  return getPipeline(await config, await matching).then(outputPipeline);
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
