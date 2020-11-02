interface ConfigFile {
  path: string;
  basePath: string;
}

interface MonorepoConfig {
  name?: string;
  expects: string[];
  produces: string[];
  matches: string[];
  depends_on: string[];
  excluded_steps: Record<string, unknown>[];
  excluded_env: Record<string, string>;
}

interface Config extends ConfigFile, Pipeline {
  /**
   * The name of the component pipeline - e.g. for pipeline.foo.yml, this is foo
   */
  name: string;
  monorepo: MonorepoConfig;
}

interface ConfigWithChanges extends Config {
  /**
   * A set of changes that match the configuration
   */
  changes: string[];

  /**
   * A base build we're comparing against, if one can be found. If one can't, we'll enter fallback mode and run
   * everything.
   */
  buildId?: string;
}

interface IncludeDecision {
  included: boolean;
  reason: string;
}

type ConfigWithDecision = IncludeDecision & ConfigWithChanges;
