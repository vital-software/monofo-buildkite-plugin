import commandExists from 'command-exists';
import debug from 'debug';

const log = debug('monofo:util:exec');

export function hasBin(bin: string): Promise<boolean> {
  log(`Checking whether bin ${bin} exists`);
  return commandExists(bin)
    .then(() => true)
    .catch(() => false);
}
