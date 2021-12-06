import _ from 'lodash';

export class Artifact {
  readonly name: string;

  readonly ext: string;

  readonly buildId: string;

  readonly skip: boolean;

  readonly softFail: boolean;

  /**
   * @param filename A relative path to the artifact file
   */
  constructor(readonly filename: string) {
    [this.name] = this.filename.split('.');
    this.ext = this.filename.split('.').slice(1).join('.'); // Not extname() because that only gives the last ext

    const envName = _.upperCase(_.snakeCase(this.name));

    this.skip = Boolean(process.env?.[`MONOFO_ARTIFACT_${envName}_SKIP`]);
    this.softFail = Boolean(process.env?.[`MONOFO_ARTIFACT_${envName}_SOFT_FAIL`]);

    // This is a valid fallback, because if we don't pass --build <build-id> this env var would be used anyway
    this.buildId = process.env?.[`MONOFO_ARTIFACT_${envName}_BUILD_ID`] || process.env?.BUILDKITE_BUILD_ID;

    if (!this.buildId) {
      throw new Error(`Expected BUILDKITE_BUILD_ID or MONOFO_ARTIFACT_${envName}_BUILD_ID to be set`);
    }
  }
}
