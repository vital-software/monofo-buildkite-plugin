import { Command, flags as f } from '@oclif/command';

export interface BaseFlags {
  chdir?: string;
  verbose: boolean;
}

export abstract class BaseCommand extends Command {
  static override strict = false;

  static override flags = {
    chdir: f.string({
      char: 'C',
      description: 'Directory to change to before executing command',
    }),
    verbose: f.boolean({
      char: 'v',
      description: 'Run with verbose logging',
      default: false,
    }),
    version: f.version({ char: 'V' }),
    help: f.version({ char: 'h', description: 'Show this help message' }),
  };

  protected override init(): Promise<void> {
    const { flags } = this.parse(BaseCommand);

    if (flags?.chdir) {
      this.log(`Changing dir to ${flags.chdir}`);
      process.chdir(flags.chdir);
    }

    return Promise.resolve();
  }
}
