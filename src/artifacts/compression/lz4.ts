import stream from 'stream';
import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { hasBin } from '../../util/exec';
import { tar } from '../../util/tar';
import { Artifact } from '../model';
import { Compression, TarInputArgs } from './compression';
import { execFromTar } from './tar';

const log = debug('monofo:artifact:compression:lz4');

let enabled: boolean | undefined;

async function checkEnabled() {
  if (enabled === undefined) {
    enabled = await hasBin('lz4');
  }

  if (!enabled) {
    throw new Error('LZ4 compression is disabled due to no lz4 binary found on PATH');
  }
}

export const lz4: Compression = {
  async deflate(output: Artifact, tarInputArgs: TarInputArgs): Promise<execa.ExecaChildProcess> {
    await checkEnabled();
    return execFromTar(tarInputArgs, ['|', 'lz4', '-2', '>', output.filename]);
  },

  async inflate(input: stream.Readable, outputPath = '.'): Promise<ExecaReturnValue> {
    await checkEnabled();
    log(`Inflating .tar.lz4 archive: tar -C ${outputPath} -x --use-compress-program=lz4 -f -`);

    const result = await execa(await tar(), ['-C', outputPath, '-x', '--use-compress-program=lz4', '-f', '-'], {
      input,
    });

    log('Finished inflating .tar.lz4 archive');

    return result;
  },
};
