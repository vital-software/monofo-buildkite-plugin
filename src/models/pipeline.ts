import { Step } from './step';

export interface Pipeline {
  steps: Step[];
  env: Record<string, string>;
}
