import { CommandModule } from 'yargs';
import { BaseArgs } from './handler';

export const plurals = (n: number): string => (n === 1 ? '' : 's');
export const count = (arr: Array<unknown>, name: string): string => `${arr.length} ${name}${plurals(arr.length)}`;

export type Command<T extends BaseArgs = BaseArgs> = CommandModule<T, T>;
