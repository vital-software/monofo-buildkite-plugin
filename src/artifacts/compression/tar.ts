import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import { EmptyArgsError, exec, hasBin } from '../../util/exec';
import { tar as tarBin } from '../../util/tar';
import { Compression, TarInputArgs } from './compression';

const log = debug('monofo:artifact:compression:lz4');

let enabled: boolean | undefined;

async function checkEnabled() {
  if (enabled === undefined) {
    enabled = await hasBin('tar');
  }

  if (!enabled) {
    throw new Error('tar is disabled due to no tar binary found on PATH');
  }
}

export function tarExecArgs(tarInputArgs: TarInputArgs): string[] {
  if ('file' in tarInputArgs) {
    return ['cat', tarInputArgs.file]; // https://porkmail.org/era/unix/award.html#cat
  }

  return tarInputArgs.argv;
}

export function tarExecOptions(tarInputArgs: TarInputArgs): Partial<execa.Options> {
  if ('input' in tarInputArgs) {
    return { input: tarInputArgs.input };
  }

  return {};
}

export function execFromTar(
  tarInputArgs: TarInputArgs,
  argv: string[],
  options: execa.Options = {}
): Promise<execa.ExecaChildProcess> {
  const [first, ...rest] = [...tarExecArgs(tarInputArgs), ...argv];

  if (!first) {
    throw new EmptyArgsError();
  }

  return exec(first, rest, { ...tarExecOptions(tarInputArgs), ...options });
}

export const tar: Compression = {
  async deflate(output): Promise<string[]> {
    await checkEnabled();
    return ['>', output.filename];
  },

  async inflate({ input, outputPath = '.' }): Promise<ExecaReturnValue> {
    await checkEnabled();

    log(`Inflating .tar archive: tar -C ${outputPath} -x -f -`);

    const result = await exec((await tarBin()).bin, ['-C', outputPath, '-x', '-f', '-'], {
      input,
    });

    log('Finished inflating .tar archive');

    return result;
  },
};
