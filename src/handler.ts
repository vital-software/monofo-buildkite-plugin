import debug from 'debug';
import { Arguments } from 'yargs';

const log = debug('monofo:handler');

export interface BaseArgs {
  chdir: string | undefined;
  verbose: boolean;
}

export function setUpHander<T extends BaseArgs>(args: Arguments<T>): void {
  if (args.chdir) {
    log(`Changing dir to ${args.chdir}`);
    process.chdir(args.chdir);
  }
}
