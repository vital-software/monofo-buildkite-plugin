import * as fs from 'fs';
import { parse } from 'path';
import stream from 'stream';
import { promisify } from 'util';
import execa from 'execa';
import got from 'got';
import _ from 'lodash';

const pipeline = promisify(stream.pipeline);

export class Artifact {
  readonly name: string;

  readonly buildId?: string;

  readonly skip: boolean;

  readonly softFail: boolean;

  constructor(readonly filename: string, config = process.env) {
    const path = parse(filename);
    const envName = _.upperCase(_.snakeCase(path.name));

    this.name = path.name;
    this.skip = Boolean(config?.[`MONOFO_ARTIFACT_${envName}_SKIP`]);
    this.buildId = config?.[`MONOFO_ARTIFACT_${envName}_BUILD_ID`];
    this.softFail = Boolean(config?.[`MONOFO_ARTIFACT_${envName}_SOFT_FAIL`]);
  }

  public async getDownloadUrl(): Promise<string> {
    return (
      await execa('buildkite-agent', [
        'artifact',
        'search',
        '--format',
        `$'%u\\n'`,
        this.buildId ? `--build` : '',
        this.buildId ? this.buildId : '',
      ])
    ).stdout.split('\n')[0];
  }

  public async download(): Promise<void> {
    const url = await this.getDownloadUrl();
    await pipeline(got.stream(url), fs.createWriteStream(this.filename));
  }
}
