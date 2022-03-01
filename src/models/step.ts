import { AbstractStep } from './abstract-step';

export interface CommandStep extends AbstractStep {
  command: string | string[];
}

export interface BlockStep extends AbstractStep {
  block: string;
}

export interface InputStep extends AbstractStep {
  input: string;
}

export interface TriggerStep extends AbstractStep {
  trigger: string;
}

export interface GroupStep extends AbstractStep {
  group: string | null;
  steps: Step[];

  allow_dependency_failure?: boolean;
  notify?: Record<string, unknown>;
}

export type Step = CommandStep | GroupStep | TriggerStep | BlockStep | InputStep;

export function isGroupStep(step: Step): step is GroupStep {
  return step?.group === null || Boolean(step?.group);
}

/**
 * Returns all step keys within the given set of steps
 *
 * Note that group steps con contain sub-steps, so it's not a simple map
 */
export function keysInSteps(steps: Step[]): string[] {
  return steps.flatMap((step: Step) => {
    const self = typeof step.key === 'string' ? [step.key] : [];

    if (isGroupStep(step)) {
      return [...self, ...keysInSteps(step.steps)];
    }

    return self;
  });
}
