import nock from 'nock';
import { fakeBuildkiteBuildsListing, fakeBuildkiteInfo, COMMIT } from '../../test/fixtures';
import BuildkiteClient, { GetBuildsOptions } from './client';

describe('BuildkiteClient', () => {
  describe('getLastSuccessfulBuild()', () => {
    it('returns the last successful build', () => {
      const fake = fakeBuildkiteInfo();
      const client = new BuildkiteClient(fake);
      const opts: GetBuildsOptions = { state: 'passed' };
      const url = client.urlGetBuilds(opts);

      nock(url.origin)
        .get(`${url.pathname}${url.search}`)
        .reply(200, JSON.stringify(fakeBuildkiteBuildsListing()))
        .matchHeader('accept', 'application/json');

      return expect(client.getBuilds(opts)).resolves.toEqual(
        expect.arrayContaining([expect.objectContaining({ commit: COMMIT })])
      );
    });
  });
});
