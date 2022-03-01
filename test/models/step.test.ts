import Config from '../../src/models/config';
import { keysInSteps } from '../../src/models/step';
import { getProjectFixturePath } from '../fixtures';

describe('keysInSteps', () => {
  it('gets recursive keys', async () => {
    const configs = await Config.getAll(getProjectFixturePath('groups'));
    const keys = configs.map((config) => keysInSteps(config.steps));

    expect(keys).toStrictEqual([
      ['foo1-group', 'foo1'],
      ['foo1-group', 'foo2'],
      ['foo3-group', 'foo3'],
      ['foo4-group', 'foo4'],
    ]);
  });
});
