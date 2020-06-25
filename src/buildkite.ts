import _ from 'lodash';
import got from 'got';
import debug from 'debug';

const log = debug('monofo:buildkite');

/**
 * Our own internal value instance that collects environment variable values
 */
export interface BuildkiteInfo {
  branch: string;
  commit: string;
  defaultBranch: string;
  source: string;
  buildsUrl: string;
}

/**
 * As returned for a build from the Buildkite REST API
 */
export interface BuildkiteBuild {
  web_url: string;
  commit: string;
}

const required = [
  'BUILDKITE_BRANCH',
  'BUILDKITE_COMMIT',
  'BUILDKITE_ORGANIZATION_SLUG',
  'BUILDKITE_PIPELINE_DEFAULT_BRANCH',
  'BUILDKITE_PIPELINE_SLUG',
  'BUILDKITE_SOURCE',
  'BUILDKITE_API_ACCESS_TOKEN',
];

export function getBuildkiteInfo(e: NodeJS.ProcessEnv = process.env): BuildkiteInfo {
  if (typeof e !== 'object') {
    throw new Error('Invalid configuration source object');
  }

  required.forEach((req) => {
    if (!e[req]) {
      throw new Error(`Expected to find ${req} env var`);
    }
  });

  return {
    branch: e.BUILDKITE_BRANCH,
    commit: e.BUILDKITE_COMMIT,
    // We probably actually want the Github default branch, but close enough:
    defaultBranch: e.BUILDKITE_PIPELINE_DEFAULT_BRANCH,
    source: e.BUILDKITE_SOURCE,
    buildsUrl: [
      'https://api.buildkite.com/v2',
      `/organizations/${e.BUILDKITE_ORGANIZATION_SLUG}/pipelines/${e.BUILDKITE_PIPELINE_SLUG}/builds`,
      `?state=passed&branch=${encodeURIComponent(e.BUILDKITE_BRANCH)}`,
    ].join(''),
  };
}

/**
 * Get the commit of the last successful build of the current branch
 * @param info
 */
export function getLastSuccessfulBuildCommit(info: BuildkiteInfo): Promise<string> {
  return got(info.buildsUrl, {
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
        log(`Found successful build for ${info.branch}: ${builds[0].web_url} @ ${builds[0].commit}`);
        return builds[0].commit;
      }
    });
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
