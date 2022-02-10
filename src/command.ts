import { Command, Flags } from '@oclif/core';
import debug from 'debug';

export interface BaseFlags {
  chdir?: string;
  verbose: boolean;
}

export abstract class BaseCommand extends Command {
  static override strict = false;

  static override flags = {
    chdir: Flags.string({
      char: 'C',
      description: 'Directory to change to before executing command',
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Run with verbose logging',
      default: false,
    }),
    version: Flags.version({ char: 'V' }),
    help: Flags.version({ char: 'h', description: 'Show this help message' }),
  };

  protected override async init(): Promise<void> {
    const { flags } = await this.parse(BaseCommand);

    if (flags?.verbose) {
      debug.enable(process.env?.DEBUG || 'monofo:*');
    }

    if (flags?.chdir) {
      this.log(`Changing dir to ${flags.chdir}`);
      process.chdir(flags.chdir);
    }

    return Promise.resolve();
  }
}
