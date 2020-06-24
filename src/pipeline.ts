import { ConfigWithChanges } from './diff';
import _ from 'lodash';
import debug from 'debug';

const log = debug('monofo:pipeline');

interface Pipeline {
  steps: { [key: string]: any }[];
  env: { [key: string]: any };
}

const EMPTY_PIPELINE: Pipeline = { env: {}, steps: [] };

const s = (n: number) => (n === 1 ? '' : 's');
const count = (arr: Array<unknown>, name: string) => `${arr.length} ${name}${s(arr.length)}`;

/**
 * If a config has changes, its steps are merged into the final build. Otherwise, it is excluded, its excluded_steps are
 * merged in instead
 */
function toMerge({ name, changes, env, steps, monorepo }: ConfigWithChanges): Pipeline {
  if (changes.length <= 0) {
    log(
      `${name} will be EXCLUDED because it has no matching changes. ${count(
        monorepo.excluded_steps,
        'replacement step'
      )} will be used instead.`
    );
    return { env, steps: monorepo.excluded_steps };
  } else {
    log(`${name} will be INCLUDED because it has ${count(changes, 'matching change')}: ${changes.join(', ')}`);
    return { env, steps };
  }
}

export function toPipeline(results: ConfigWithChanges[]): Pipeline {
  return _.mergeWith(EMPTY_PIPELINE, ...results.map(toMerge), (dst: any, src: any) =>
    _.isArray(dst) ? dst.concat(src) : undefined
  );
}
