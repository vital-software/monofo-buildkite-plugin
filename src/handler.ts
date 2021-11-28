import debug from 'debug';
import { Arguments, CommandModule } from 'yargs';

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

export type Command<T extends BaseArgs = BaseArgs> = CommandModule<T, T> & {
  innerHandler: (args: Arguments<T>) => Promise<string>;
};
