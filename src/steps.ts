import debug from 'debug';

const log = debug('monofo:steps');

export const ARTIFACT_INJECTION_STEP_KEY = 'monorepo-inject-artifacts';
const ARTIFACT_INJECTION_STEP_LABEL = `:crystal_ball:`;

export function artifactInjectionSteps(configs: ConfigWithDecision[]): Step[] {
  const names = configs.filter((c) => !c.included).map((c) => c.name);
  const produces = configs
    .filter((c) => !c.included)
    .flatMap((e) => e.monorepo.produces)
    .filter((artifact) => !artifact.startsWith('.phony/'));
  const { buildId } = configs[0];

  if (names.length < 1 || produces.length < 1 || !buildId) {
    log("Not adding inject artifacts step: doesn't seem to be needed");
    return [];
  }

  if (!buildId) {
    log('Not adding inject artifacts step: no build ID found');
    return [];
  }

  return [
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
  ];
}

const NOTHING_TO_DO_STEP_LABEL = `:white_check_mark: :shrug: Nothing to do`;

/**
 * When no subcomponents match, pop a message onto the build
 *
 * @todo add a block step, ask the user if they want to do a full build?
 */
export function nothingToDoSteps(configs: ConfigWithDecision[]): Step[] {
  if (configs.find((v) => v.included)) {
    return [];
  }

  return [
    {
      label: NOTHING_TO_DO_STEP_LABEL,
      command: `echo 'All build parts were skipped'`,
    } as CommandStep,
  ];
}
