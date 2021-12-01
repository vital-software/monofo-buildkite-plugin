import debug from 'debug';
import execa from 'execa';
import { Artifact } from './model';

const log = debug('monofo:artifact:api');

export class ArtifactApi {
  public async search(artifact: Artifact): Promise<string> {
    const args = [
      'artifact',
      'search',
      artifact.filename,
      '--format',
      `$'%u\\n'`,
      artifact.buildId ? `--build` : '',
      artifact.buildId ? artifact.buildId : '',
    ];

    log(`Calling buildkite-agent ${args.join(' ')}`);

    return (
      await execa('buildkite-agent', args, {
        stdio: ['pipe', 'pipe', 'inherit'],
      })
    ).stdout.split('\n')[0];
  }
}
