#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
require('yargs')
  .strict(true)
  .commandDir('../build/src/cmd')
  .demandCommand()
  .onFinishCommand(() => {
    process.exit(0);
  })
  .help().argv;
