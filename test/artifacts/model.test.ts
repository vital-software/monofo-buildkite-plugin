import { Artifact } from '../../src/artifacts/model';
import { BUILD_ID, BUILD_ID_2 } from '../fixtures';

describe('model Artifact', () => {
  it('looks up the right env vars to find overridden build IDs', () => {
    process.env.BUILDKITE_BUILD_ID = BUILD_ID;
    process.env.MONOFO_ARTIFACT_NODE_MODULES_BUILD_ID = BUILD_ID_2;

    const hasExtraEnvVar = new Artifact('node-modules.tar.gz');
    expect(hasExtraEnvVar.buildId).toBe(BUILD_ID_2);

    const noExtraEnvVar = new Artifact('other.tar.gz');
    expect(noExtraEnvVar.buildId).toBe(BUILD_ID);
  });

  it.each([
    ['node-modules.tar.gz', 'node-modules', 'tar.gz'],
    ['/some/path/node-modules.tar.gz', 'node-modules', 'tar.gz'],
    ['./node-modules.caidx', 'node-modules', 'caidx'],
  ])('when given file %s produces name %s and ext %s', (filename, name, ext) => {
    process.env.BUILDKITE_BUILD_ID = BUILD_ID;
    process.env.MONOFO_ARTIFACT_NODE_MODULES_BUILD_ID = BUILD_ID_2;

    const artifact = new Artifact(filename);
    expect(artifact.name).toBe(name);
    expect(artifact.ext).toBe(ext);
  });
});
