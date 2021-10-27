import debug from 'debug';
import _ from 'lodash';
import Config from '../config';

const log = debug('monofo:steps:artifact-injection');

export const ARTIFACT_INJECTION_STEP_KEY = 'monorepo-inject-artifacts';
const ARTIFACT_INJECTION_STEP_LABEL = `:crystal_ball:`;

function copyArtifactCommand(artifact: string, buildId: string): string {
  return (
    `# Copy ${artifact} from ${buildId} into current build\n` +
    `buildkite-agent artifact download '${artifact}' . --build '${buildId}' && buildkite-agent artifact upload '${artifact}' && rm -rf '${artifact}' &`
  );
}
//
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

  let command = [`echo 'inject for: ${names.join(', ')}'`];

  command = command.concat(
    skipped
      .groupBy((c) => c.baseBuild?.id)
      .flatMap((configsForBuild) => {
        const { baseBuild } = configsForBuild[0];

        if (!baseBuild) {
          log('Not adding inject artifacts step: no base build found');
          return [];
        }

        const produces = configsForBuild
          .flatMap((e) => e.monorepo.produces)
          .filter((artifact) => !artifact.startsWith('.phony/'));

        return produces.map((artifact) => copyArtifactCommand(artifact, baseBuild.id));
      })
      .value()
  );

  command = command.concat([`wait`]);

  const step: CommandStep = {
    key: ARTIFACT_INJECTION_STEP_KEY,
    label: ARTIFACT_INJECTION_STEP_LABEL,
    command,
  };

  return [step];
}
