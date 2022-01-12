import { promises as fs } from 'fs';
import debug from 'debug';
import { deflator } from '../artifacts/compression';
import { Artifact } from '../artifacts/model';
import { BaseCommand } from '../command';

const log = debug('monofo:cmd:deflate');

interface DeflateArguments {
  tarFile: string;
  output: string;
}

export default class Deflate extends BaseCommand {
  static override description = 'deflate a tar resource into a given artifact name';

  static override flags = { ...BaseCommand.flags };

  static override args = [
    { name: 'tarFile', description: 'Path to a .tar file', required: true },
    {
      name: 'output',
      description: 'Path to a target deflated artifact file, like something.tar.gz or something.caidx',
      required: true,
    },
  ];

  async run(): Promise<string> {
    const { args } = this.parse<unknown, DeflateArguments>(Deflate);

    try {
      const stat = await fs.stat(args.tarFile);

      if (!stat.isFile()) {
        throw new Error(`Expected ${args.tarFile} to be an existing file`);
      }
    } catch (err: unknown) {
      log(err);
      throw err;
    }

    const artifact = new Artifact(args.output);

    const result = await deflator(artifact, { file: args.tarFile });
    return result.stdout;
  }
}
