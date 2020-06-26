import _ from 'lodash';
import got from 'got';
import debug from 'debug';
import { URL } from 'url';

const log = debug('monofo:buildkite');

export function buildsUrl(bk: BuildkiteEnvironment): string {
  const url = new URL(`/organizations/${bk.org}/pipelines/${bk.pipeline}/builds`, 'https://api.buildkite.com/');
  url.search = `?state=passed&branch=${encodeURIComponent(bk.branch)}`;
  return url.toString();
}

/**
 * Get the commit of the last successful build of the current branch
 *
 * @todo last should be defined by commit topology, not when the build was triggered
 */
export function getLastSuccessfulBuild(info: BuildkiteEnvironment): Promise<BuildkiteBuild> {
  return got(buildsUrl(info), {
    headers: {
      Authorization: `Bearer ${process.env.BUILDKITE_API_ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
  })
    .json<BuildkiteBuild[]>()
    .then((builds) => {
      if (!_.isArray(builds) || builds.length < 1) {
        throw new Error('Could not find any matching successful builds');
      } else {
        const [build] = builds;
        log(`Found successful build for ${info.branch}: ${build.web_url} @ ${build.commit}`);
        return build;
      }
    });
}

export function lookBackwardForSuccessfulBuild(
  info: BuildkiteEnvironment,
  beforeCommit: string
): Promise<BuildkiteBuild> {
  return Promise.reject(new Error('Unimplemented backward lookup for successful build'));
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      BUILDKITE_BRANCH: string;
      BUILDKITE_COMMIT: string;
      BUILDKITE_ORGANIZATION_SLUG: string;
      BUILDKITE_PIPELINE_DEFAULT_BRANCH: string;
      BUILDKITE_PIPELINE_SLUG: string;
      BUILDKITE_SOURCE: string;
      BUILDKITE_API_ACCESS_TOKEN: string;
    }
  }
}
