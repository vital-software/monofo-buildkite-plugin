import { promises as fs } from 'fs';
import * as path from 'path';
import { safeLoad } from 'js-yaml';

const CONFIG_REL_PATH = '.buildkite/';
const PIPELINE_FILE = /^pipeline\.(.*)\.yml$/;

export async function getConfigFiles(dir: string): Promise<Array<string>> {
  return fs.readdir(dir).then((files) => files.filter((p) => PIPELINE_FILE.test(p)).map((p) => path.join(dir, p)));
}

async function readConfig(path: string) {
  return fs.readFile(path).then((buf) => [path, safeLoad(buf.toString())]);
}

export async function getConfig(): Promise<Array<any>> {
  const configDir = path.join(process.cwd(), CONFIG_REL_PATH);
  const files = await getConfigFiles(configDir);
  return Promise.all(files.map(readConfig));
}
