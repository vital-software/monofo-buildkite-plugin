import path from 'path';
import { recordSuccessSteps } from '../../src/steps/record-success';
import { fakeProcess } from '../fixtures';

describe('recordSuccessSteps', () => {
  it('returns steps when given relevant configs', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    const r = await recordSuccessSteps([]);
    expect(r).toHaveLength(0);
  });
});
