import * as fs from 'fs';
import { parse, ParsedPath } from 'path';
import stream from 'stream';
import { promisify } from 'util';
import execa, { ExecaChildProcess } from 'execa';
import got from 'got';
import Request from 'got/dist/source/core';
import { GotStream } from 'got/dist/source/types';
import _ from 'lodash';

const pipeline = promisify(stream.pipeline);

const toStream = (process: ExecaChildProcess): stream.Writable => {
  if (!process.stdin) {
    throw new Error('Could not access stdin on child process');
  }

  return process.stdin;
};

export class Artifact {
  readonly name: string;

  readonly buildId?: string;

  readonly skip: boolean;

  readonly softFail: boolean;

  readonly path: ParsedPath;

  constructor(readonly filename: string, config = process.env) {
    this.path = parse(filename);
    this.name = this.path.name;

    const envName = _.upperCase(_.snakeCase(this.name));

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

  public async startDownload(): Promise<Request> {
    const url = await this.getDownloadUrl();
    return got.stream(url);
  }

  public async downloadAndExtract(): Promise<void> {
    const artifact = await this.startDownload();
    artifact.pipe(this.extractStream());
  }

  private extractStream(): NodeJS.WritableStream {
    if (this.path.ext.endsWith('.tar.lz4')) {
      return this.extractLz4();
    }

    if (this.path.ext.endsWith('.tar.cbidx')) {
      return this.extractDesync();
    }

    return fs.createWriteStream(this.filename);
  }

  private extractLz4(): NodeJS.WritableStream {
    return toStream(execa('tar', ['-xv', '--use-compress-program=lz4', '-f', '-'], { buffer: false }));
  }

  private extractDesync(): NodeJS.WritableStream {
    return toStream(execa('desync', ['tar'], { buffer: false }));
  }
}
