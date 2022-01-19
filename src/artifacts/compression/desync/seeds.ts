import mkdirp from 'mkdirp';
import { Artifact } from '../../model';
import { seedBaseDir } from './config';

const seedCreatedStatCache: Record<string, boolean> = {};

export async function seedDirForArtifact(artifact: Artifact): Promise<string> {
  const dir = `${seedBaseDir}/${process.env.BUILDKITE_ORGANIZATION_SLUG}/${process.env.BUILDKITE_PIPELINE_SLUG}/${artifact.name}`;

  if (!(artifact.name in seedCreatedStatCache)) {
    await mkdirp(dir);
    seedCreatedStatCache[artifact.name] = true;
  }

  return dir;
}

/**
 * Get a couple of paths to use for seed files
 *
 * Always returns paths in an existing directory
 */
export async function seedFilesForArtifact(
  artifact: Artifact,
  key = 'latest'
): Promise<{ caibx: string; catar: string }> {
  const dir = await seedDirForArtifact(artifact);

  // TODO: possibly rotate how many seeds we keep here, so that we can
  //       get slightly better performance with e.g. concurrent differences

  return {
    // We need to be able to reference this from --ignore foo.catar.caibx (on desync chop)
    caibx: `${dir}/${key}.catar.caibx`,
    catar: `${dir}/${key}.catar`,
  };
}
