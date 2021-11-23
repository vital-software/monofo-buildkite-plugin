import { exec } from 'child_process';
import debug from 'debug';

const log = debug('monofo:git');

function git(...args: string[]): Promise<string> {
  const command = ['git'].concat(args).join(' ');

  return new Promise((resolve, reject) => {
    log(`Running command: ${command}`);
    exec(command, (err, stdout, stderr) => {
      if (err) {
        log(`Failed to execute ${command} (stderr follows):\n${stderr}`);
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function mergeBase(...args: string[]): Promise<string> {
  return git('merge-base', ...args).then((v) => v.trim());
}

export function diff(...args: string[]): Promise<string[]> {
  return git('diff', '--name-only', ...args).then((names) => names.split('\n').filter((v) => v));
}

export function revList(...args: string[]): Promise<string[]> {
  return git('rev-list', ...args).then((v) => v.trim().split('\n'));
}

export function commitExists(commit: string): Promise<boolean> {
  return git('cat-file', '-e', `${commit}^{commit}`)
    .then(() => true)
    .catch(() => false);
}
