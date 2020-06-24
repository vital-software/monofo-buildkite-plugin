export interface BuildkiteInfo {
  branch: string;
  commit: string;
  defaultBranch: string;
  organization_slug: string;
  pipeline_slug: string;
  source: string;
}

export function getBuildkiteInfo(): BuildkiteInfo {
  return {
    branch: process.env.BUILDKITE_BRANCH,
    commit: process.env.BUILDKITE_COMMIT,
    // We probably actually want the Github default branch, but close enough:
    defaultBranch: process.env.BUILDKITE_PIPELINE_DEFAULT_BRANCH,
    source: process.env.BUILDKITE_SOURCE,
    organization_slug: process.env.BUILDKITE_ORGANIZATION_SLUG,
    pipeline_slug: process.env.BUILDKITE_PIPELINE_SLUG,
  };
}

export function getLastSuccessfulBuildCommit(branch: string): Promise<string> {
  return Promise.resolve('HEAD');
}

declare global {
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
