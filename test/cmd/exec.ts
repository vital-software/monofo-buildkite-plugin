import yargs, { Argv, CommandModule } from 'yargs';
import { BaseArgs } from '../../src/handler';

/**
 * Note that even though this command returns a promise, it can't be used to run async command handlers until
 * yargsa or a similar library replaces it (yargs will call the parse callback long before an async command is
 * resolved: https://github.com/yargs/yargs/issues/1069)
 */
export default async function execSync<T extends BaseArgs = BaseArgs>(
  command: CommandModule<T, T>,
  args: string
): Promise<string> {
  let output = '';

  await (yargs as Argv<T>)
    .command(command)
    .help()
    .exitProcess(false)
    .parse(args, {}, (_err, _argv, out) => {
      output = out;
    });

  return output;
}
