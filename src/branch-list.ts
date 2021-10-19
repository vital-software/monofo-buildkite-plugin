import _ from 'lodash';

export interface ParsedBranchList {
  allowed: string[];
  blocked: string[];
}

export function parseBranchList(branchList?: string): ParsedBranchList {
  if (!branchList) {
    return {
      allowed: [],
      blocked: [],
    };
  }

  const [allowed, blocked] = _.partition(branchList.split(' '), (item) => item.indexOf('!'));

  return {
    allowed,
    blocked,
  };
}
