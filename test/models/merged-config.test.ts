import { MergedConfig } from '../../src/models/merged-config';
import { BASE_BUILD, selectScenario } from '../fixtures';

describe('MergedConfig', () => {
  describe('.matchConfigs', () => {
    describe('when many changed files', () => {
      const changedFiles = ['foo/abc.js', 'foo/README.md', 'bar/abc.ts', 'baz/abc.ts'];

      it('matches changed files against configs', async () => {
        selectScenario('kitchen-sink');
        const merged = await MergedConfig.fromDir();
        merged.setChangedFiles(BASE_BUILD, changedFiles);
        const changes = merged.configs.map((r) => r.changes);

        expect(changes).toHaveLength(16);
        expect(changes).toStrictEqual([
          changedFiles,
          [],
          [],
          ['foo/README.md'],
          ['foo/README.md'],
          [],
          [],
          changedFiles,
          changedFiles,
          [],
          changedFiles,
          changedFiles,
          [],
          ['baz/abc.ts'],
          [],
          changedFiles,
        ]);
      });
    });

    describe('when no changed files', () => {
      const changedFiles: string[] = [];

      it('still matches configs that have matches hard-coded to true', async () => {
        selectScenario('kitchen-sink');

        const merged = await MergedConfig.fromDir();
        merged.setChangedFiles(BASE_BUILD, changedFiles);
        const changes = merged.configs.map((r) => r.changes);

        expect(changes).toHaveLength(16);
        expect(changes).toStrictEqual([[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]);
      });
    });
  });
});
