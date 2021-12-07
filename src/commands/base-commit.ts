import { getBuildkiteInfo } from '../buildkite/config';
import { BaseCommand } from '../command';
import { getBaseBuild } from '../diff';

export default class BaseCommit extends BaseCommand {
  static override description = 'output a base commit hash, against which the current build would be compared';

  static override examples = [
    `$ monofo base-commit
6c4fe0eda8b93de6764c3f99758505f0e4370103
`,
  ];

  static override flags = { ...BaseCommand.flags };

  async run() {
    const base = await getBaseBuild(getBuildkiteInfo(process.env));
    process.stdout.write(`${base.commit}\n`);
  }
}
