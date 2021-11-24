import { URL } from 'url';
import debug from 'debug';
import got from 'got';
import { BuildkiteBuild, BuildkiteEnvironment } from './types';

const log = debug('monofo:buildkite:client');

interface PaginationOptions {
  page?: number;
  per_page?: number;
}

export interface GetBuildsOptions extends PaginationOptions {
  state?: string;
  'branch[]'?: string[];
}

export default class BuildkiteClient {
  constructor(
    private readonly info: BuildkiteEnvironment,
    private readonly accessToken: string = process.env.BUILDKITE_API_ACCESS_TOKEN
  ) {}

  private baseUrl = new URL(
    `https://api.buildkite.com/v2/organizations/${this.info.org}/pipelines/${this.info.pipeline}`
  );

  private async request<T>(url: URL): Promise<T> {
    log(`Making request to ${url.toString()}`);
    return got(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    }).json<T>();
  }

  getBuilds(options: GetBuildsOptions = {}): Promise<BuildkiteBuild[]> {
    return this.request<BuildkiteBuild[]>(this.urlGetBuilds(options));
  }

  /**
   * URLs are public so we can nock them
   */
  urlGetBuilds(options: GetBuildsOptions = {}): URL {
    const url = new URL(this.baseUrl.href);
    url.pathname += '/builds';

    const parameters = {
      ...options,
      'branch[]': options['branch[]'] ?? [this.info.branch],
    };

    Object.entries(parameters).forEach(([name, val]) => {
      if (typeof val !== 'undefined') {
        url.searchParams.append(name, String(val));
      }
    });

    return url;
  }
}
