import chalk from 'chalk';
import commandExists from 'command-exists';
import debug from 'debug';
import execa from 'execa';
import logUpdate from 'log-update';

const log = debug('monofo:util:exec');

export function hasBin(bin: string): Promise<boolean> {
  log(`Checking whether bin ${bin} exists`);
  return commandExists(bin)
    .then(() => true)
    .catch(() => false);
}

export class EmptyArgsError extends Error {
  constructor() {
    super('Expected argv to contain at least one argument');
  }
}

/**
 * Announces what it's about to execute, then runs it, returning the output
 */
export async function exec(
  argv: string[],
  options: execa.Options = {},
  verbose = false
): Promise<execa.ExecaChildProcess> {
  if (argv.length < 1) {
    throw new EmptyArgsError();
  }

  const opts: execa.Options = {
    shell: 'bash',
    stderr: verbose ? 'inherit' : undefined,

    ...options,
  };

  logUpdate(`${chalk.yellow('Running...')} ${argv.join(' ')}...`);

  try {
    const result = await execa(argv[0], argv.slice(1), opts);
    logUpdate(`${chalk.green('Done:')}      ${argv.join(' ')}\t✅ `);
    logUpdate.done();

    return result;
  } catch (err) {
    logUpdate(`${chalk.red('Error:')}     ${argv.join(' ')}\t❌ `);
    logUpdate.done();

    throw err;
  }
}
