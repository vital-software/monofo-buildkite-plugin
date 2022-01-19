import mkdirp from 'mkdirp';
import { Artifact } from '../../model';

class MissingConfigError extends Error {}

export function store(): string {
  if (!process.env?.MONOFO_DESYNC_STORE) {
    throw new MissingConfigError(
      'Expected MONOFO_DESYNC_STORE to be set to a remote store string, like s3+https://...'
    );
  }

  return process.env.MONOFO_DESYNC_STORE;
}

export const cacheDir = process.env.MONOFO_DESYNC_CACHE || '/tmp/monofo/desync-store';
export const seedBaseDir = process.env?.MONOFO_DESYNC_SEED_DIR || '/tmp/monofo/desync-seeds';
export const region = process.env.S3_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-2';

export function cacheFlags(as = 'cache'): string[] {
  return [`--${as}`, cacheDir];
}
