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

export type MonofoCommand<T extends BaseArgs = BaseArgs> = Omit<CommandModule<T, T>, 'handler'> & {
  handler: (args: Arguments<T>) => Promise<string>;
};

export function toCommand<T extends BaseArgs>(cmd: MonofoCommand<T>): CommandModule<T, T> {
  return {
    ...cmd,
    async handler(args) {
      await cmd.handler(args);
    },
  };
}
