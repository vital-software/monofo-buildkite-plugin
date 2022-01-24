import path from 'path';
import _ from 'lodash';
import mkdirp from 'mkdirp';
import { isUuid } from '../util/helper';

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
      throw new Error(`Expected BUILDKITE_BUILD_ID or MONOFO_ARTIFACT_${envName}_BUILD_ID to be set to a UUID`);
    }

    if (!isUuid(this.buildId)) {
      throw new Error(`Expected build ID ${this.buildId} to be a UUID`);
    }

    // This is a valid fallback, because if we don't pass --build <build-id> this env var would be used anyway
    this.buildId = process.env?.[`MONOFO_ARTIFACT_${envName}_BUILD_ID`] || process.env?.BUILDKITE_BUILD_ID;
  }

  public async seedDir(): Promise<string> {
    const seedDir = `FOOAPDSKMasdmalskdm${process.env.BUILDKITE_ORGANIZATION_SLUG}/${process.env.BUILDKITE_PIPELINE_SLUG}/${this.name}`;

    if (!this.createdSeedDir) {
      await mkdirp(seedDir);
      this.createdSeedDir = true;
    }

    return seedDir;
  }

  public async seedFiles(key = 'latest'): Promise<{ caibx: string; catar: string }> {
    const dir = await this.seedDir();

    // TODO: possibly rotate how many seeds we keep here, so that we can
    //       get slightly better performance with e.g. concurrent differences

    return {
      // We need to be able to reference this from --ignore foo.catar.caibx (on desync chop)
      caibx: `${dir}/${key}.catar.caibx`,
      catar: `${dir}/${key}.catar`,
    };
  }
}
