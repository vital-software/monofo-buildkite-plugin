import yargs, { Arguments, CommandModule } from 'yargs';

/**
 * Note that even though this command returns a promise, it can't be used to run async command handlers until
 * yargsa or a similar library replaces it (yargs will call the parse callback long before an async command is
 * resolved: https://github.com/yargs/yargs/issues/1069)
 */
export default async function execSync<T = CommonArguments, U = unknown>(
  command: CommandModule<T, U>,
  args: string
): Promise<string> {
  return new Promise((resolve) => {
    yargs
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .command<U>(command)
      .help()
      .parse(args, (_err: Error | undefined, _argv: Arguments<U>, output: string) => {
        resolve(output);
      });
  });
}
