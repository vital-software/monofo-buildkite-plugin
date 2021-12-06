import stream from 'stream';
import commandExists from 'command-exists';
import { ExecaChildProcess } from 'execa';

export function hasBin(bin: string): Promise<boolean> {
  return commandExists(bin)
    .then(() => true)
    .catch(() => false);
}

export function stdinWritable(child: ExecaChildProcess): stream.Writable {
  if (!child.stdin) {
    throw new Error('Could not access stdin on child process');
  }

  return child.stdin;
}

export function stdoutReadable(child: ExecaChildProcess): stream.Readable {
  if (!child.stdout) {
    throw new Error('Could not access stdout on child process');
  }

  return child.stdout;
}
