import { safeDump } from 'js-yaml';
import { ConfigWithChanges } from './diff';

type Pipeline = { [key: string]: any };

export function toPipeline(results: ConfigWithChanges[]): Promise<Pipeline> {
  return Promise.resolve({});
}

export function outputPipeline(pipeline: Pipeline): Promise<void> {
  return new Promise((resolve, reject) =>
    process.stdout.write(safeDump(pipeline), 'utf-8', (err) => (err ? reject(err) : resolve()))
  );
}
