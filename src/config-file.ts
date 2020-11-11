import { basename } from 'path';
import { promisify } from 'util';
import debug from 'debug';
import globAsync from 'glob';
import _ from 'lodash';

const glob = promisify(globAsync);
const log = debug('monofo:config-file');

export /**
 * YAML helper for always returning an array of strings
 */
function strings(v: undefined | string[] | string): string[] {
  if (!v || v.length <= 0) {
    return [];
  }
  if (_.isArray(v)) {
    return v;
  }
  return [String(v)];
}

export default class ConfigFile {
  private static readonly PIPELINE_FILE_REGEX = /^pipeline\.(?<name>.*)\.yml$/;

  private static readonly PIPELINE_FILE_GLOB = '**/pipeline*.yml';

  private static readonly PIPELINE_FILE_IGNORE_GLOB = ['**/node_modules/**'];

  constructor(public readonly path: string, public readonly basePath = process.cwd()) {}

  nameFromFilename(): string | undefined {
    const match = ConfigFile.PIPELINE_FILE_REGEX.exec(basename(this.path));
    return match?.groups?.name || undefined;
  }

  /**
   * Searches for all pipeline files anywhere in the current working directory
   */
  static async search(cwd: string = process.cwd()): Promise<ConfigFile[]> {
    try {
      const pipelines = await glob(ConfigFile.PIPELINE_FILE_GLOB, {
        dot: true,
        cwd,
        ignore: ConfigFile.PIPELINE_FILE_IGNORE_GLOB,
      });

      return pipelines.map((path) => {
        return new ConfigFile(path, cwd);
      });
    } catch (e) {
      log(e);
      return [];
    }
  }
}
