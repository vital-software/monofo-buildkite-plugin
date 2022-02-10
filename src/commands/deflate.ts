import { promises as fs } from 'fs';
import debug from 'debug';
import { compressors } from '../artifacts/compression';
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
      description: 'Path to a target deflated artifact file, like something.tar.gz or something.catar.caibx',
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args } = await this.parse<unknown, DeflateArguments>(Deflate);

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

    const compressor = compressors?.[artifact.ext];

    if (!compressor) {
      throw new Error(`Unsupported output artifact format: ${artifact.ext}`);
    }

    await compressor.deflate({ artifact, input: { tarPath: args.tarFile } });
  }
}
