import { Artifact } from '../../src/artifacts/model';
import { BUILD_ID, BUILD_ID_2 } from '../fixtures';

describe('model Artifact', () => {
  it('looks up the right env vars to find the build', () => {
    process.env.BUILDKITE_BUILD_ID = BUILD_ID;
    process.env.MONOFO_ARTIFACT_NODE_MODULES_BUILD_ID = BUILD_ID_2;

    const artifact = new Artifact('node-modules.tar.gz');
    expect(artifact.buildId).toBe(BUILD_ID_2);

    const artifact2 = new Artifact('node_modules.tar.gz');
    expect(artifact2.buildId).toBe(BUILD_ID_2);

    const artifact3 = new Artifact('other.tar.gz');
    expect(artifact3.buildId).toBe(BUILD_ID);
  });
});
