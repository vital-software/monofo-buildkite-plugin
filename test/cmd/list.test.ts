import path from 'path';
import { load as loadYaml } from 'js-yaml';
import _ from 'lodash';
import { mocked } from 'ts-jest/utils';
import { Arguments } from 'yargs';
import { CacheMetadataRepository } from '../../src/cache-metadata';
import * as list from '../../src/cmd/list';
import { service } from '../../src/dynamodb';
import { mergeBase, diff, revList } from '../../src/git';
import { BUILD_ID, BUILD_ID_2, BUILD_ID_3, COMMIT, fakeProcess } from '../fixtures';
import execSync from './exec';

jest.mock('../../src/git');
jest.mock('../../src/buildkite/client');

describe('monofo list', () => {
  it('returns help output', async () => {
    const output = await execSync(list, 'list --help');
    expect(output).toContain('List matching files');
  });

  it('returns matching files for the pure scenario', async () => {
    process.env = fakeProcess();
    process.chdir(path.resolve(__dirname, '../projects/pure'));

    const args: Arguments<unknown> = { $0: '', _: [], componentName: 'foo' };
    const output = await ((list.handler(args) as unknown) as Promise<string>)
    expect(output).toContain('foo/README.md')
  });
});
