import path from 'path';
import Config from '../src/config';

describe('branchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows the main branch', async () => {
    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/branch-exclusion')))
      .filter((config) => {
        return config.includedInBranchList('main');
      })
      .map((c) => c.monorepo.name);

    expect(configNames).toStrictEqual(['explicit-all', 'implicit-all', 'implicit-rest']);
  });

  it('allows a random feature branch', async () => {
    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/branch-exclusion')))
      .filter((config) => {
        return config.includedInBranchList('feature/allowed-feature');
      })
      .map((c) => c.monorepo.name);

    expect(configNames).toStrictEqual([
      'explicit-all',
      'explicit-include-exclude',
      'explicit-include-exclude-wildcard',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it("doesn't allow a excluded feature branch", async () => {
    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/branch-exclusion')))
      .filter((config) => {
        return config.includedInBranchList('feature/excluded');
      })
      .map((c) => c.monorepo.name);

    expect(configNames).toStrictEqual(['explicit-all', 'explicit-wildcards', 'implicit-all', 'implicit-rest']);
  });

  it("doesn't allow a excluded feature branch by wildcard", async () => {
    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/branch-exclusion')))
      .filter((config) => {
        return config.includedInBranchList('feature/excluded-name');
      })
      .map((c) => c.monorepo.name);

    expect(configNames).toStrictEqual([
      'explicit-all',
      'explicit-include-exclude',
      'explicit-wildcards',
      'implicit-all',
      'implicit-rest',
    ]);
  });

  it('allows a single branch', async () => {
    const configNames = (await Config.getAll(path.resolve(__dirname, 'projects/branch-exclusion')))
      .filter((config) => {
        return config.includedInBranchList('one');
      })
      .map((c) => c.monorepo.name);

    expect(configNames).toStrictEqual(['explicit-all', 'explicit-one', 'implicit-all']);
  });
});
