import debug from 'debug';

const log = debug('monofo:steps');

export const ARTIFACT_INJECTION_STEP_KEY = 'monorepo-inject-artifacts';
const ARTIFACT_INJECTION_STEP_LABEL = `:crystal_ball: Get skipped artifacts`;
const EMPTY_PIPELINE: Pipeline = { env: {}, steps: [] };

export function artifactInjectionStep(configs: ConfigWithDecision[]): Pipeline {
  const names = configs.filter((c) => !c.included).map((c) => c.name);
  const produces = configs.filter((c) => !c.included).flatMap((e) => e.monorepo.produces);
  const { buildId } = configs[0];

  if (names.length < 1 || produces.length < 1 || !buildId) {
    log("Not adding inject artifacts step: doesn't seem to be needed");
    return EMPTY_PIPELINE;
  }

  if (!buildId) {
    log('Not adding inject artifacts step: no build ID found');
    return EMPTY_PIPELINE;
  }

  return {
    env: {},
    steps: [
      {
        key: ARTIFACT_INJECTION_STEP_KEY,
        label: ARTIFACT_INJECTION_STEP_LABEL,
        command: `echo 'inject for: ${names.join(', ')}'`,
        plugins: [
          {
            'artifacts#v1.3.0': {
              build: buildId,
              download: produces,
              upload: produces,
            },
          },
        ],
      } as CommandStep,
    ],
  };
}
