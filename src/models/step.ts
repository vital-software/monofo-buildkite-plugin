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
