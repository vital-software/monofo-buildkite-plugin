import { mergeGroups } from '../../src/models/group-step';
import { Pipeline } from '../../src/models/pipeline';

describe('mergeGroups', () => {
  it('merges a test group', () => {
    const pipeline: Pipeline = {
      env: {},
      steps: [
        {
          group: 'group-1',
          steps: [
            { key: 'a', trigger: 'foo' },
            { key: 'b', trigger: 'foo' },
          ],
        },
        {
          group: null,
          label: 'group-1',
          steps: [
            { key: 'c', trigger: 'foo' },
            { key: 'd', trigger: 'foo' },
          ],
        },
      ],
    };

    const merged = mergeGroups(pipeline);

    expect(merged).toStrictEqual({});
  });
});
