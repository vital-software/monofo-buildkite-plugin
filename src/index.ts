#!/usr/bin/env node

import debug from 'debug';
import { safeDump } from 'js-yaml';
import util from 'util';
import getConfigs from './config';
import { getBaseCommit, matchConfigs } from './diff';
import { mergePipelines, Pipeline } from './pipeline';
import { diff } from './git';

// eslint-disable-next-line @typescript-eslint/unbound-method
const write = util.promisify(process.stdout.write);
const stdOutThenExit = (pipeline: Pipeline): Promise<void> =>
  write(`${safeDump(pipeline)}\n`).then(() => process.exit(0));

export default async function main(writePipeline: (p: Pipeline) => Promise<void> = stdOutThenExit): Promise<void> {
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
  (async (): Promise<void> => {
    try {
      await main();
    } catch (e) {
      debug('monofo:main')(e);
      process.stderr.write(`${e.message}\n`);
      process.exit(2);
    }
  })();
}
