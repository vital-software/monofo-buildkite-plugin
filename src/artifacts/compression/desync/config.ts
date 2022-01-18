import mkdirp from 'mkdirp';
import { Artifact } from '../../model';

class MissingConfigError extends Error {}

export function store(): string {
  if (!process.env?.MONOFO_DESYNC_STORE) {
    throw new MissingConfigError('Could not get store details from MONOFO_DESYNC_STORE');
  }
  return process.env.MONOFO_DESYNC_STORE;
}

export function cache(): string {
  if (!process.env.MONOFO_DESYNC_CACHE) {
    throw new MissingConfigError('Could not get cache details from MONOFO_DESYNC_CACHE');
  }
  return process.env.MONOFO_DESYNC_CACHE;
}

export function region(): string {
  return process.env.S3_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-2';
}

export function cacheFlags(as = 'cache'): string[] {
  return process.env.MONOFO_DESYNC_CACHE ? [`--${as}`, process.env.MONOFO_DESYNC_CACHE] : [];
}

export const seedDirBase: string = process.env?.MONOFO_DESYNC_SEED_DIR || '/var/cache/monofo/desync-seeds';
const seedCreatedStatCache: Record<string, boolean> = {};

export async function seedDirForArtifact(artifact: Artifact): Promise<string> {
  const dir = `${seedDirBase}/${process.env.BUILDKITE_ORGANIZATION_SLUG}/${process.env.BUILDKITE_PIPELINE_SLUG}/${artifact.name}`;

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
