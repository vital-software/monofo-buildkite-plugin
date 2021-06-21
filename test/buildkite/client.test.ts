import nock from 'nock';
import BuildkiteClient, { GetBuildsOptions } from '../../src/buildkite/client';
import { fakeBuildkiteBuildsListing, fakeBuildkiteInfo, COMMIT } from '../fixtures';

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

    it('can support multiple branches', () => {
      const fake = fakeBuildkiteInfo();
      const client = new BuildkiteClient(fake);
      const opts: GetBuildsOptions = { state: 'passed' };
      const url = client.urlGetBuilds(opts);

      expect(url.toString()).toBe(
        'https://api.buildkite.com/v2/organizations/dominics/pipelines/monofo/builds?branches%5B%5D=main&state=passed'
      );
    });
  });
});
