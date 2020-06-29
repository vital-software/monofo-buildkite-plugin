import { exec } from 'child_process';
import debug from 'debug';

const log = debug('monofo:buildkite:agent');

export interface AgentOutput {
  stdout: string;
  stderr: string;
}

function agent(command: string): Promise<AgentOutput> {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        log(`Failed to execute \`${command}\`:\n${stderr}`);
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function esc(v: string): string {
  return `'${v.replace(/'/g, `'\\''`)}'`;
}

export function download(
  file: string,
  destination: string,
  buildId: string | undefined = undefined
): Promise<AgentOutput> {
  log(`Looking within ${buildId || 'current build'}`);
  return agent(
    `buildkite-agent artifact download ${buildId ? `--build=${esc(buildId)} ` : ''}${esc(file)} ${esc(destination)}`
  );
}
