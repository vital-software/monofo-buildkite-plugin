import path from 'path';
import _ from 'lodash';
import mkdirp from 'mkdirp';

const seedDirBase: string = process.env?.MONOFO_DESYNC_SEED_DIR || '/var/tmp/desync-seeds';

export class Artifact {
  readonly name: string;

  readonly ext: string;

  readonly buildId: string;

  readonly skip: boolean;

  readonly softFail: boolean;

  private createdSeedDir = false;

  /**
   * @param filename A relative path to the artifact file
   */
  constructor(readonly filename: string) {
    const basename = path.basename(filename);

    [this.name] = basename.split('.');
    this.ext = basename.split('.').slice(1).join('.'); // Not extname() because that only gives the last ext

    const envName = _.snakeCase(this.name).toUpperCase();

    this.skip = Boolean(process.env?.[`MONOFO_ARTIFACT_${envName}_SKIP`]);
    this.softFail = Boolean(process.env?.[`MONOFO_ARTIFACT_${envName}_SOFT_FAIL`]);

    // This is a valid fallback, because if we don't pass --build <build-id> this env var would be used anyway
    this.buildId = process.env?.[`MONOFO_ARTIFACT_${envName}_BUILD_ID`] || process.env?.BUILDKITE_BUILD_ID;

    if (!this.buildId) {
      throw new Error(`Expected BUILDKITE_BUILD_ID or MONOFO_ARTIFACT_${envName}_BUILD_ID to be set`);
    }

    // This is a valid fallback, because if we don't pass --build <build-id> this env var would be used anyway
    this.buildId = process.env?.[`MONOFO_ARTIFACT_${envName}_BUILD_ID`] || process.env?.BUILDKITE_BUILD_ID;
  }

  public async seedDir(): Promise<string> {
    const seedDir = `${seedDirBase}/${process.env.BUILDKITE_ORGANIZATION_SLUG}/${process.env.BUILDKITE_PIPELINE_SLUG}/${this.name}`;

    if (!this.createdSeedDir) {
      await mkdirp(seedDir);
      this.createdSeedDir = true;
    }

    return seedDir;
  }
}
