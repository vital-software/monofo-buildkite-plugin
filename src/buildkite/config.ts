const BUILDKITE_REQUIRED_ENV = [
  'BUILDKITE_BUILD_ID',
  'BUILDKITE_BRANCH',
  'BUILDKITE_COMMIT',
  'BUILDKITE_ORGANIZATION_SLUG',
  'BUILDKITE_PIPELINE_DEFAULT_BRANCH',
  'BUILDKITE_PIPELINE_SLUG',
  'BUILDKITE_SOURCE',
  'BUILDKITE_API_ACCESS_TOKEN',
];

export function getBuildkiteInfo(e: NodeJS.ProcessEnv = process.env): BuildkiteEnvironment {
  if (typeof e !== 'object') {
    throw new Error('Invalid configuration source object');
  }

  BUILDKITE_REQUIRED_ENV.forEach((req) => {
    if (!e[req]) {
      throw new Error(`Expected to find ${req} env var`);
    }
  });

  return {
    buildId: e.BUILDKITE_BUILD_ID,
    // We probably actually want the Github default branch, but close enough:
    defaultBranch: e.MONOFO_DEFAULT_BRANCH || e.BUILDKITE_PIPELINE_DEFAULT_BRANCH,
    org: e.BUILDKITE_ORGANIZATION_SLUG,
    pipeline: e.BUILDKITE_PIPELINE_SLUG,
    branch: e.BUILDKITE_BRANCH,
    commit: e.BUILDKITE_COMMIT,
    source: e.BUILDKITE_SOURCE,
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      BUILDKITE_BUILD_ID: string;
      BUILDKITE_BRANCH: string;
      BUILDKITE_COMMIT: string;
      BUILDKITE_ORGANIZATION_SLUG: string;
      BUILDKITE_PIPELINE_DEFAULT_BRANCH: string;
      BUILDKITE_PIPELINE_SLUG: string;
      BUILDKITE_SOURCE: string;
      BUILDKITE_API_ACCESS_TOKEN: string;
      PIPELINE_RUN_ALL?: string;
      PIPELINE_RUN_ONLY?: string;
      MONOFO_DEFAULT_BRANCH?: string;
    }
  }
}
