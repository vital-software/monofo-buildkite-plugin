import stream from 'stream';
import debug from 'debug';
import got from 'got';
import { exec } from '../util/exec';
import { getTimeouts } from '../util/got';
import { Artifact } from './model';

const log = debug('monofo:artifact:api');

/**
 * Searches for the download URL of an artifact
 *
 * @param artifact The artifact to search for; if this value object includes
 *                 a build ID, the search will be filtered to that build
 */
export async function search(artifact: Artifact): Promise<string> {
  log(`Searching for artifact ${artifact.name}`);

  const args = [
    'buildkite-agent',
    'artifact',
    'search',
    artifact.filename,
    '--format',
    '%u',
    artifact.buildId ? `--build` : '',
    artifact.buildId ? artifact.buildId : '',
  ];

  return (await exec(args, { stderr: 'inherit' })).stdout.split('\n')[0];
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
  await exec(['buildkite-agent', 'artifact', 'upload', artifact.filename], {
    stdio: ['inherit', 'inherit', 'inherit'],
  });
}

export async function download(artifact: Artifact): Promise<stream.Readable> {
  const url = await search(artifact);
  log('Downloading: ', url);

  return got
    .stream(url, {
      timeout: getTimeouts(),
    })
    .on('end', () => {
      log('Finished downloading: ', url);
    });
}
