// Reason types should fit into the sentence: "Foo has been included/excluded because it has {REASON}"
export enum IncludeReasonType {
  ALL_FILE_MATCH = 'matching change(s): all files match',
  NO_FILE_MATCH = 'no files match',
  FILE_MATCH = 'matching change(s):',
  FORCED = 'been forced to by',
  NO_PREVIOUS_SUCCESSFUL = 'no previous successful build, fallback to being included',
  DEPENDS_ON = 'been pulled in by a depends_on:',
}

export enum ExcludeReasonType {
  FILE_MATCH = 'no matching changes',
  BRANCH = 'a branches configuration which excludes the current branch',
  PIPELINE_RUN_OPT_OUT = 'been opted-out of PIPELINE_RUN_ALL via monorepo.matches === false',
  FORCED = 'been forced NOT to by',
  NO_PREVIOUS_SUCCESSFUL = 'no previous successful build, fallback to being excluded',
  BUILT_PREVIOUSLY = 'Built previously in',
}

export default class Reason {
  previousBuild?: string;

  pureCacheHit?: boolean;

  constructor(public reason: IncludeReasonType | ExcludeReasonType, public items: string[] = []) {}

  toString(): string {
    let reasonString = `${this.reason}`;

    let itemPart = '';
    let countPart = '';

    if (this.items.length) {
      if (this.reason !== IncludeReasonType.ALL_FILE_MATCH && this.reason !== IncludeReasonType.NO_FILE_MATCH) {
        itemPart = ` ${this.items.join(', ')}`;
      }

      if (this.reason === IncludeReasonType.FILE_MATCH || this.reason === IncludeReasonType.ALL_FILE_MATCH) {
        countPart = `${this.items.length} `;
      }
    }

    reasonString = `${countPart}${reasonString}${itemPart}`;

    if (typeof this.pureCacheHit !== 'undefined') {
      reasonString += this.pureCacheHit ? ' (Pure cache hit)' : ' (Pure cache missed)';
    }

    return reasonString;
  }
}
