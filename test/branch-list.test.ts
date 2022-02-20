import path from 'path';
import Config from '../src/config';
import { getProjectFixturePath } from './fixtures';

async function getIncludedPipelinesForBranchName(branchName: string): Promise<string[]> {
  return (await Config.getAll(getProjectFixturePath('branch-exclusion')))
    .filter((config) => {
      return config.includedInBranchList(branchName);
    })
    .map((c) => c.monorepo.name);
}

describe('branchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows the main branch', async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('main');

    expect(pipelineNames).toStrictEqual(['explicit-all', 'implicit-all', 'implicit-rest']);
  });

  it('allows a random feature branch', async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('feature/allowed-feature');

    expect(pipelineNames).toStrictEqual([
      'explicit-all',
      'explicit-exclude-multiple',
      'explicit-include-exclude',
      'explicit-include-exclude-wildcard',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it("doesn't allow a excluded feature branch", async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('feature/excluded');

    expect(pipelineNames).toStrictEqual([
      'explicit-all',
      'explicit-exclude-multiple',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it("doesn't allow a excluded feature branch by wildcard", async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('feature/excluded-name');

    expect(pipelineNames).toStrictEqual([
      'explicit-all',
      'explicit-exclude-multiple',
      'explicit-include-exclude',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it('allows a wildcard-included feature branch', async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('feature/name-included');

    expect(pipelineNames).toStrictEqual([
      'explicit-all',
      'explicit-exclude-multiple',
      'explicit-include-exclude',
      'explicit-include-exclude-wildcard',
      'explicit-wildcard-end',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it("doesn't allow a wildcard-excluded feature branch", async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('feature/name-excluded');

    expect(pipelineNames).toStrictEqual([
      'explicit-all',
      'explicit-exclude-multiple',
      'explicit-include-exclude',
      'explicit-include-exclude-wildcard',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it('allows a single feature branch when multiple included', async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('feature/include-one');

    expect(pipelineNames).toStrictEqual([
      'explicit-all',
      'explicit-exclude-multiple',
      'explicit-include-exclude',
      'explicit-include-exclude-wildcard',
      'explicit-include-multiple',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it("doesn't allow a single feature branch when multiple excluded", async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('feature/exclude-one');

    expect(pipelineNames).toStrictEqual([
      'explicit-all',
      'explicit-include-exclude',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it('allows a single branch', async () => {
    const pipelineNames = await getIncludedPipelinesForBranchName('one');

    expect(pipelineNames).toStrictEqual(['explicit-all', 'explicit-one', 'implicit-all']);
  });
});
