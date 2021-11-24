import { Arguments, CommandModule } from 'yargs';
import { BaseArgs } from '../handler';

export type Command<T extends BaseArgs = BaseArgs> = CommandModule<T, T> & {
  innerHandler: (args: Arguments<T>) => Promise<string>;
};
