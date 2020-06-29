#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
require('yargs')
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
    default: false,
  })
  .usage('Monofo provides utilities for dynamically generating monorepo pipelines')
  .epilogue('Visit https://github.com/dominics/monofo for documentation about this command.')
  .strict(true)
  .commandDir('../build/src/cmd')
  .demandCommand()
  .onFinishCommand(() => {
    process.exit(0);
  })
  .showHelpOnFail(false)
  .help().argv;
