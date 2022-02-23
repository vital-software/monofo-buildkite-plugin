import _ from 'lodash';
import { Pipeline } from './pipeline';
import { GroupStep, Step } from './step';

class GroupMergeMismatchError extends Error {
  constructor(step: GroupStep, propertyName: string) {
    super(`Cannot merge groups under ${groupKey(step)}: ${propertyName} does not match`);
  }
}

function checkSimilarEnoughToMerge(step1: GroupStep, step2: GroupStep): void {
  if (step1.allow_dependency_failure !== step2.allow_dependency_failure) {
    throw new GroupMergeMismatchError(step2, 'allow_dependency_failure');
  }

  if (!_.isEqual(step1.depends_on, step2.depends_on)) {
    throw new GroupMergeMismatchError(step2, 'depends_on');
  }
}

/**
 * Merges groups within a merged pipeline
 *
 * Buildkite will error if a build has the same group defined more than once, but we might want to be able to define
 * groups across configs. So, as a late step, we combine any steps from pipelines with the same key
 *
 *
 * This could do with some refactoring:
 * The problem as it stands is that the combining step needs to remove steps from the combined run. But the combined run
 * is represented as Config[], not some other aggregate type. So, e.g. it's hard to safely remove steps (part of merging
 * them) until they've undergone toMerge()
 */
export function mergeGroups(pipeline: Pipeline): void {
  const groupSteps: Record<string, GroupStep> = {};

  for (const [idx, step] of pipeline.steps.entries()) {
    if (isGroupStep(step)) {
      const key = groupKey(step);

      if (key in groupSteps) {
        checkSimilarEnoughToMerge(groupSteps[key], step);

        // Actually do the merge
        groupSteps[key].steps.push(...step.steps);

        // eslint-disable-next-line no-param-reassign
        delete pipeline.steps[idx];
      } else {
        // This is the easy case where the group is unique so far, we note it and otherwise leave it alone
        groupSteps[key] = step;
      }
    }
  }

  // eslint-disable-next-line no-param-reassign
  pipeline.steps = pipeline.steps.filter((v) => v);
}

export function isGroupStep(step: Step): step is GroupStep {
  return step?.group === null || Boolean(step?.group);
}

export function groupKey(step: GroupStep): string {
  const key = step.key || step.group || step.label;

  if (!key) {
    throw new Error('Could not find group key on group step');
  }

  return key;
}

/**
 * Iteration helper for dealing with steps inside group steps
 *
 * Unpacks any group steps in the given set of steps, so that the sub-steps attached to that group are also in the
 * returned array at the top level
 */
export function withInnerSteps(steps: Step[]): Step[] {
  return steps.flatMap((step) => {
    if (isGroupStep(step)) {
      return [...step.steps, step];
    }
    return [step];
  });
}
