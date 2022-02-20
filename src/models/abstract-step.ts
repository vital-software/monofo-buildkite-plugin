export interface ArtifactPluginConfig {
  'artifacts#v1.3.0': {
    build: string;
    upload: string[];
    download: string[];
  };
}

export interface AbstractStep {
  depends_on?: string | string[];
  key?: string;
  label?: string;
  plugins?: (Record<string, unknown> | ArtifactPluginConfig)[];
  [others: string]: unknown;
}
