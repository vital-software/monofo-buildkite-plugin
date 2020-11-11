import { version } from '../../package.json';
import Config from '../config';
import { FileHasher } from '../hash';

export const RECORD_SUCCESS_STEP_KEY = 'monorepo-record-success-';
const RECORD_SUCCESS_STEP_LABEL = `:up:`;

function getSelfCommandLine(): string {
  return process.env?.MONOFO_SELF || `npx monofo@${version || 'latest'}`;
}

let anonymousKeyIndex = 0;

function anonymousKey(): string {
  anonymousKeyIndex += 1;
  return `anon-step-${anonymousKeyIndex}`;
}

/**
 * Returns a set of steps, one for each config that is pure and included
 *
 * These steps have:
 *  - depends_on all the other steps in the config they're in
 *  - a command which records success
 */
export function recordSuccessSteps(configs: Config[]): Promise<Step[]> {
  const hasher = new FileHasher();

  return Promise.all(
    configs
      .filter((c) => c.included && c.monorepo.pure)
      .flatMap(
        async (c): Promise<Step[]> => {
          const dependsOn = c.steps.map((step) => {
            if (!step.key) {
              // eslint-disable-next-line no-param-reassign
              step.key = anonymousKey(); // TODO: could move to a validation step when creating pure config
            }
            return step.key;
          });

          const step = {
            label: RECORD_SUCCESS_STEP_LABEL,
            key: `${RECORD_SUCCESS_STEP_KEY}${c.monorepo.name}`,
            command: `${getSelfCommandLine()} record-success '${c.monorepo.name}' '${await c.getContentHash(hasher)}'`,
            depends_on: dependsOn,
          };

          return [step];
        }
      )
  ).then((c) => c.flat());
}
