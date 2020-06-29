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
  steps: Record<string, unknown>[];
  env: Record<string, string>;
}

interface DecoratedConfig extends Config {
  changes: string[];
  buildId?: string;
}
