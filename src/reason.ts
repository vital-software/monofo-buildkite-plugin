// Reason types should fit into the sentence: "Foo has been included/excluded because it has {REASON}"
export enum IncludeReasonType {
  ALL_FILE_MATCH = 'all files match',
  NO_FILE_MATCH = 'no files match',
  FILE_MATCH = 'matching change(s)',
  FORCED = 'been forced to',
  NO_PREVIOUS_SUCCESSFUL = 'no previous successful build, task fallback to being included',
  DEPENDS_ON = 'been pulled in by a depends_on',
}

export enum ExcludeReasonType {
  FILE_MATCH = 'no matching change(s)',
  BRANCH = 'a branches configuration which excludes the current branch',
  PIPELINE_RUN_OPT_OUT = 'been opted-out of PIPELINE_RUN_ALL via monorepo.matches === false',
  FORCED = 'been forced NOT to',
  NO_PREVIOUS_SUCCESSFUL = 'no previous successful build, task fallback to being excluded',
}

export default class Reason {
  previousBuild?: string;

  pureCacheHit?: boolean;

  constructor(public reason: IncludeReasonType | ExcludeReasonType, public items: string[] = []) {}

  toString(): string {
    let reasonString = `${this.reason}`;

    if (
      this.items.length &&
      this.reason !== IncludeReasonType.ALL_FILE_MATCH &&
      this.reason !== IncludeReasonType.NO_FILE_MATCH
    ) {
      reasonString += ` (${this.items.join(', ')})`;
    }

    if (this.pureCacheHit) {
      reasonString += ' (Pure cache hit)';
    }

    if (this.previousBuild) {
      reasonString += ` (Previous build: ${this.previousBuild})`;
    }

    return reasonString;
  }
}
