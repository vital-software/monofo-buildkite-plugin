import stream from 'stream';
import debug from 'debug';
import execa from 'execa';
import got from 'got';
import { Artifact } from './model';

const log = debug('monofo:artifact:api');

/**
 * Searches for the download URL of an artifact
 *
 * @param artifact The artifact to search for; if this value object includes
 *                 a build ID, the search will be filtered to that build
 */
export async function search(artifact: Artifact): Promise<string> {
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

/**
 * Uploads an artifact
 *
 * The artifact must fully exist on disk first: buildkite-agent artifact upload
 * does not support stdin
 *
 * @param artifact The artifact to upload
 */
export async function upload(artifact: Artifact): Promise<void> {
  await execa('buildkite-agent', ['artifact', 'upload', artifact.filename], {
    stdio: ['inherit', 'inherit', 'inherit'],
  });
}

export async function download(artifact: Artifact): Promise<stream.Readable> {
  const url = await search(artifact);
  log('Downloading: ', url);

  return got.stream(url).on('end', () => {
    log('Finished downloading: ', url);
  });
}
