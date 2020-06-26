// @todo This unfortunately can't live in test/__mocks__, see https://github.com/facebook/jest/issues/2726

import { fakeBuildkiteBuildsListing } from '../../test/fixtures';

export const mockGetBuilds = jest.fn().mockImplementation(() => Promise.resolve(fakeBuildkiteBuildsListing()));

const mock = jest.fn().mockImplementation(() => {
  return { getBuilds: mockGetBuilds };
});

export default mock;
