// Reason types should fit into the sentence: "Foo has been included/excluded because it has {REASON}"
export enum IncludeReasonType {
  ALL_FILE_MATCH = 'matching change(s): all files match',
  DEPENDS_ON = 'been pulled in by a depends_on from',
  FILE_MATCH = 'matching change(s):',
  FORCED = 'been forced to by',
  NO_FILE_MATCH = 'no files match',
  NO_PREVIOUS_SUCCESSFUL = 'no previous successful build, fallback to being included',
  PIPELINE_ONLY_OPT_OUT = 'been opted-out of PIPELINE_RUN_ONLY via monorepo.matches === true',
  ALWAYS_INCLUDED = 'been always included by monorepo.matches === true',
}

export enum ExcludeReasonType {
  BRANCH = 'a branches configuration which excludes the current branch',
  BUILT_PREVIOUSLY = 'been built previously in',
  FILE_MATCH = 'no matching changes',
  FORCED = 'been forced NOT to by',
  NO_PREVIOUS_SUCCESSFUL = 'no previous successful build, fallback to being excluded',
  PIPELINE_RUN_OPT_OUT = 'been opted-out of PIPELINE_RUN_ALL via monorepo.matches === false',
  NEVER_INCLUDED = 'been always excluded by monorepo.matches === false',
}

export default class Reason {
  previousBuild?: string;

  pureCacheHit?: boolean;

  constructor(public reason: IncludeReasonType | ExcludeReasonType, public items: string[] = []) {}

  toString(): string {
    let reasonString = `${this.reason}`;

    // Pluralizing output
    if (reasonString.match(/\(s\)/)) {
      reasonString = reasonString.replace(/\(s\)/, this.items.length > 1 ? 's' : '');
    }

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
