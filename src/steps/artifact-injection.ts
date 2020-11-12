import debug from 'debug';
import _ from 'lodash';
import Config from '../config';

const log = debug('monofo:steps:artifact-injection');

export const ARTIFACT_INJECTION_STEP_KEY = 'monorepo-inject-artifacts';
const ARTIFACT_INJECTION_STEP_LABEL = `:crystal_ball:`;

/**
 * @todo One step, multiple plugin configs
 */
export function artifactInjectionSteps(configs: Config[]): Step[] {
  const skipped = _(configs).filter((c) => !c.included);
  const names = skipped.map((c) => c.monorepo.name).value();

  const allProducedArtifacts = skipped
    .flatMap((e) => e.monorepo.produces)
    .filter((artifact) => !artifact.startsWith('.phony/'))
    .value();

  if (allProducedArtifacts.length < 1) {
    log("Not adding inject artifacts step: doesn't seem to be needed by any steps");
    return [];
  }

  const plugins: ArtifactPluginConfig[] = skipped
    .groupBy((c) => c.buildId)
    .flatMap((configsForBuild) => {
      const { buildId } = configsForBuild[0];

      if (!buildId) {
        log('Not adding inject artifacts step: no build ID found');
        return [];
      }

      const produces = configsForBuild
        .flatMap((e) => e.monorepo.produces)
        .filter((artifact) => !artifact.startsWith('.phony/'));

      if (produces.length < 1) {
        return [];
      }

      return [
        {
          'artifacts#v1.3.0': {
            build: buildId,
            download: produces,
            upload: produces,
          },
        },
      ];
    })
    .value();

  const step: CommandStep = {
    key: ARTIFACT_INJECTION_STEP_KEY,
    label: ARTIFACT_INJECTION_STEP_LABEL,
    command: `echo 'inject for: ${names.join(', ')}'`,
    plugins,
  };

  return [
    {
      key: ARTIFACT_INJECTION_STEP_KEY,
      label: ARTIFACT_INJECTION_STEP_LABEL,
      command: `echo 'inject for: ${names.join(', ')}'`,
      plugins,
    } as CommandStep,
  ];
}
