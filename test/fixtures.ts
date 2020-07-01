import { getBuildkiteInfo } from '../src/config';

export const ORG = 'dominics';
export const PIPELINE = 'monofo';
export const BRANCH = 'main';
export const COMMIT = 'f993bd4d8d59b9c70c8092d327c6ac1c6a263b1f';
export const BUILD_ID = 'f62a1b4d-10f9-4790-bc1c-e2c3a0c80983';

export function fakeProcess(): NodeJS.ProcessEnv {
  return {
    BUILDKITE_BRANCH: BRANCH,
    BUILDKITE_COMMIT: COMMIT,
    BUILDKITE_ORGANIZATION_SLUG: ORG,
    BUILDKITE_PIPELINE_DEFAULT_BRANCH: 'main',
    BUILDKITE_PIPELINE_SLUG: PIPELINE,
    BUILDKITE_SOURCE: 'webhook',
    BUILDKITE_API_ACCESS_TOKEN: '1234567890abcdefabc1298398f9812389',
  };
}

export function fakeBuildkiteInfo(): BuildkiteEnvironment {
  return getBuildkiteInfo(fakeProcess());
}

export function fakeBuildkiteBuild(): BuildkiteBuild {
  return {
    id: BUILD_ID,
    url: 'https://api.buildkite.com/v2/organizations/my-great-org/pipelines/my-pipeline/builds/1',
    web_url: 'https://buildkite.com/my-great-org/my-pipeline/builds/1',
    number: 1,
    state: 'passed',
    blocked: false,
    message: 'Bumping to version 0.2-beta.6',
    commit: COMMIT,
    branch: 'master',
    env: {},
    source: 'webhook',
    creator: {
      id: '3d3c3bf0-7d58-4afe-8fe7-b3017d5504de',
      name: 'Keith Pitt',
      email: 'keith@buildkite.com',
      avatar_url: 'https://www.gravatar.com/avatar/e14f55d3f939977cecbf51b64ff6f861',
      created_at: '2015-05-22T12:36:45.309Z',
    },
    jobs: [
      {
        id: 'b63254c0-3271-4a98-8270-7cfbd6c2f14e',
        type: 'script',
        name: '📦',
        step_key: 'package',
        agent_query_rules: ['*'],
        state: 'passed',
        web_url: 'https://buildkite.com/my-great-org/my-pipeline/builds/1#b63254c0-3271-4a98-8270-7cfbd6c2f14e',
        log_url:
          'https://api.buildkite.com/v2/organizations/my-great-org/pipelines/my-pipeline/builds/1/jobs/b63254c0-3271-4a98-8270-7cfbd6c2f14e/log',
        raw_log_url:
          'https://api.buildkite.com/v2/organizations/my-great-org/pipelines/my-pipeline/builds/1/jobs/b63254c0-3271-4a98-8270-7cfbd6c2f14e/log.txt',
        command: 'scripts/build.sh',
        soft_failed: false,
        exit_status: 0,
        artifact_paths: '',
        agent: {
          id: '0b461f65-e7be-4c80-888a-ef11d81fd971',
          url: 'https://api.buildkite.com/v2/organizations/my-great-org/agents/0b461f65-e7be-4c80-888a-ef11d81fd971',
          name: 'my-agent-123',
        },
        created_at: '2015-05-09T21:05:59.874Z',
        scheduled_at: '2015-05-09T21:05:59.874Z',
        runnable_at: '2015-05-09T21:06:59.874Z',
        started_at: '2015-05-09T21:07:59.874Z',
        finished_at: '2015-05-09T21:08:59.874Z',
      },
    ],
    created_at: '2015-05-09T21:05:59.874Z',
    scheduled_at: '2015-05-09T21:05:59.874Z',
    started_at: '2015-05-09T21:05:59.874Z',
    finished_at: '2015-05-09T21:05:59.874Z',
    meta_data: {},
    pull_request: {},
    pipeline: {
      id: '849411f9-9e6d-4739-a0d8-e247088e9b52',
      url: 'https://api.buildkite.com/v2/organizations/my-great-org/pipelines/my-pipeline',
      web_url: 'https://buildkite.com/my-great-org/my-pipeline',
      name: 'great-pipeline',
      slug: 'great-pipeline',
      repository: 'git@github.com:my-great-org/my-pipeline',
      branch_configuration: null,
      default_branch: 'master',
      provider: {
        id: 'github',
        webhook_url: 'https://webhook.buildkite.com/deliver/xxx',
        settings: {
          trigger_mode: 'code',
          build_pull_requests: true,
          pull_request_branch_filter_enabled: false,
          skip_pull_request_builds_for_existing_commits: true,
          build_pull_request_forks: false,
          prefix_pull_request_fork_branch_names: true,
          build_tags: false,
          publish_commit_status: true,
          publish_commit_status_per_step: false,
          publish_blocked_as_pending: false,
          repository: 'my-great-org/my-pipeline',
        },
      },
      skip_queued_branch_builds: false,
      skip_queued_branch_builds_filter: null,
      cancel_running_branch_builds: false,
      cancel_running_branch_builds_filter: null,
      builds_url: 'https://api.buildkite.com/v2/organizations/my-great-org/pipelines/my-pipeline/builds',
      badge_url: 'https://badge.buildkite.com/58b3da999635d0ad2daae5f784e56d264343eb02526f129bfb.svg',
      created_at: '2015-05-09T21:05:59.874Z',
      scheduled_builds_count: 0,
      running_builds_count: 0,
      scheduled_jobs_count: 0,
      running_jobs_count: 0,
      waiting_jobs_count: 0,
    },
  };
}

export function fakeBuildkiteBuildsListing(): BuildkiteBuild[] {
  return [fakeBuildkiteBuild()];
}
