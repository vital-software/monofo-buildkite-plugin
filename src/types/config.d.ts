interface ConfigFile {
  path: string;
}

interface Config extends ConfigFile {
  name: string;
  monorepo: {
    expects: string[];
    produces: string[];
    matches: string[];
    excluded_steps: Record<string, unknown>[];
  };
  steps: Step[];
  env: Record<string, string>;
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

interface ConfigWithDecision extends ConfigWithChanges {
  included: boolean;
  reason: string;
}
