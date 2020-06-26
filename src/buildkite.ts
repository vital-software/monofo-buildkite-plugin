import got from 'got';
import debug from 'debug';
import { URL } from 'url';

const log = debug('monofo:buildkite:client');

interface PaginationOptions {
  page?: number;
  per_page?: number;
}

export interface GetBuildsOptions extends PaginationOptions {
  state?: string;
  branch?: string;
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
    const u = new URL(this.baseUrl.href);

    u.pathname += '/foo';
    u.searchParams.append('branch', options.branch || this.info.branch);

    Object.entries(options).forEach(([name, value]) => {
      u.searchParams.append(name, value);
    });

    return u;
  }
}
