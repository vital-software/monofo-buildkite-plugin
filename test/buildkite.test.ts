import nock from 'nock';
import { URL } from 'url';
import { getLastSuccessfulBuildCommit } from '../src/buildkite';
import { fakeBuildkiteBuildsListing, fakeBuildkiteInfo, COMMIT } from './fixtures';

describe('getLastSuccessfulBuildCommit', () => {
  it('returns the commit of a successful build', () => {
    const fake = fakeBuildkiteInfo();
    const url = new URL(fake.buildsUrl);

    nock(url.origin)
      .get(`${url.pathname}${url.search}`)
      .reply(200, JSON.stringify(fakeBuildkiteBuildsListing()))
      .matchHeader('accept', 'application/json');

    return expect(getLastSuccessfulBuildCommit(fake)).resolves.toBe(COMMIT);
  });
});
