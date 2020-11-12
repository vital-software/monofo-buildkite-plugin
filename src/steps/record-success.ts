import crypto from 'crypto';
import { getBuildkiteInfo } from '../buildkite/config';
import { CACHE_METADATA_TABLE_NAME } from '../cache-metadata';
import Config from '../config';
import { FileHasher } from '../hash';

export const RECORD_SUCCESS_STEP_KEY = 'record-success-';
const RECORD_SUCCESS_STEP_LABEL = `:ok:`;

function anonymousKey(step: CommandStep | Step): string {
  const hash = crypto.createHash('md5');
  hash.update(`${step.label || ''}:`);
  hash.update(JSON.stringify(step.depends_on) || ':');
  hash.update(JSON.stringify(step.plugins) || ':');
  hash.update(`${(step as CommandStep)?.command || ''}:`);
  return `anon-step-${hash.digest('hex').slice(0, 12)}`;
}

async function command(config: Config, hasher: FileHasher): Promise<string> {
  const info = getBuildkiteInfo();

  const item = {
    contentHash: { S: await config.getContentHash(hasher) },
    component: { S: config.getComponent() },
    buildId: { S: info.buildId },
    expiresAt: { N: String(Date.now() / 1000 + 7 * 24 * 60 * 60) },
  };

  const shellItem = `'${JSON.stringify(item).replace("'", "'\\''")}'`;
  return `aws dynamodb put-item --table-name ${CACHE_METADATA_TABLE_NAME} --item ${shellItem}`;
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
              step.key = anonymousKey(step); // TODO: could move to a validation step when creating pure config
            }
            return step.key;
          });

          const step = {
            label: RECORD_SUCCESS_STEP_LABEL,
            key: `${RECORD_SUCCESS_STEP_KEY}${c.monorepo.name}`,
            command: await command(c, hasher),
            depends_on: dependsOn,
          };

          return [step];
        }
      )
  ).then((c) => c.flat());
}
