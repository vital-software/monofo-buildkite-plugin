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
  command: string,
  args: string[],
  options: execa.Options = {}
): Promise<execa.ExecaChildProcess> {
  const opts: execa.Options = {
    shell: 'bash',
    stderr: 'inherit',

    ...options,
  };

  logUpdate(`${chalk.yellow('Running...')} ${command} ${args.join(' ')}...`);

  try {
    const result = await execa(command, args, opts);
    logUpdate(`${chalk.green('Done:')}      ${command} ${args.join(' ')}\t✅ `);
    logUpdate.done();

    return result;
  } catch (err) {
    logUpdate(`${chalk.red('Error:')}     ${command} ${args.join(' ')}\t❌ `);
    logUpdate.done();

    throw err;
  }
}
