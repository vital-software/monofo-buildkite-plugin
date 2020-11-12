/**
 * Our own internal value instance that collects environment variable values
 */
interface BuildkiteEnvironment {
  buildId: string;
  branch: string;
  commit: string;
  defaultBranch: string;
  source: string;
  org: string;
  pipeline: string;
}

/**
 * As returned for a build from the Buildkite REST API
 */
interface BuildkiteBuild {
  id: string;
  web_url: string;
  commit: string;
  blocked: boolean;
  [others: string]: unknown;
}

interface Pipeline {
  steps: Step[];
  env: Record<string, string>;
}

interface Step {
  depends_on?: string | string[];
  key?: string;
  label?: string;
  plugins?: (Record<string, unknown> | ArtifactPluginConfig)[];
  [others: string]: unknown;
}

interface CommandStep extends Step {
  command: string;
}

interface ArtifactPluginConfig {
  'artifacts#v1.3.0': {
    build: string;
    upload: string[];
    download: string[];
  };
}
