#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
require('yargs')
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
    default: false,
  })
  .option('chdir', {
    alias: 'C',
    type: 'string',
    description: 'Directory to change to before executing command',
    default: undefined,
  })
  .usage('Monofo provides utilities for dynamically generating monorepo pipelines')
  .epilogue('Visit https://github.com/vital-software/monofo for documentation about this command.')
  .strict(true)
  .commandDir('../build/src/cmd')
  .demandCommand()
  .showHelpOnFail(false)
  .help()
  .parseAsync()
  .then(() => process.exit(0));
