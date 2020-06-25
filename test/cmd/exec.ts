import yargs, { Arguments, CommandModule } from 'yargs';

/**
 * Note that even though this command returns a promise, it can't be used to run async command handlers until
 * yargsa or a similar library replaces it (yargs will call the parse callback long before an async command is
 * resolved: https://github.com/yargs/yargs/issues/1069)
 */
export default async function execSync(command: CommandModule, args: string): Promise<string> {
  return new Promise((resolve) => {
    yargs
      .command(command)
      .help()
      .parse(args, (err: Error | undefined, argv: Arguments<unknown>, output: string) => {
        resolve(output);
      });
  });
}
