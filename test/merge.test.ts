import { replaceExcludedKeys } from '../src/merge';
import Config from '../src/models/config';
import Reason, { ExcludeReasonType } from '../src/reason';
import { ARTIFACT_INJECTION_STEP_KEY } from '../src/steps/artifact-injection';
import { getProjectFixturePath } from './fixtures';

describe('merge', () => {
  describe('replaceExcludedKeys', () => {
    it('replaces depends_on inside group steps', async () => {
      const configs = await Config.getAll(getProjectFixturePath('groups'));

      // decide the first two configs aren't being included
      configs[0].decide(false, new Reason(ExcludeReasonType.FORCED));
      configs[1].decide(false, new Reason(ExcludeReasonType.FORCED));

      // the other two configs should be mutated by this operation
      replaceExcludedKeys(configs, true);

      expect(configs[2].steps[0].depends_on).toStrictEqual([ARTIFACT_INJECTION_STEP_KEY]);
      expect(configs[3].steps[0].depends_on).toStrictEqual([ARTIFACT_INJECTION_STEP_KEY]);
    });
  });
});
