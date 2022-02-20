import { recordSuccessSteps } from '../../src/steps/record-success';
import { selectScenario } from '../fixtures';

describe('recordSuccessSteps', () => {
  it('returns steps when given relevant configs', async () => {
    selectScenario('pure');
    await expect(recordSuccessSteps([])).resolves.toHaveLength(0);
  });
});
