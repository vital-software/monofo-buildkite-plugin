interface CommonArguments {
  verbose: boolean;
}

interface ArtifactArguments extends CommonArguments {
  build: string | string[];
  artifacts: string | string[];
}
