import debug from 'debug';
import Config from '../config';

const log = debug('monofo:steps:artifact-injection');

export const ARTIFACT_INJECTION_STEP_KEY = 'monorepo-inject-artifacts';
const ARTIFACT_INJECTION_STEP_LABEL = `:crystal_ball:`;

/**
 * @todo Should group into parallel steps by build ID?
 */
export function artifactInjectionSteps(configs: Config[]): Step[] {
  const names = configs.filter((c) => !c.included).map((c) => c.monorepo.name);
  const produces = configs
    .filter((c) => !c.included)
    .flatMap((e) => e.monorepo.produces)
    .filter((artifact) => !artifact.startsWith('.phony/'));
  const { buildId } = configs[0];

  if (names.length < 1 || produces.length < 1) {
    log("Not adding inject artifacts step: doesn't seem to be needed by any steps");
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
