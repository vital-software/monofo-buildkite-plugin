import * as crypto from 'crypto';
import * as fs from 'fs';
import debug from 'debug';

const log = debug('monofo:hash');

export const EMPTY_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

type ConfigFilePath = string;
type ContentHash = string | undefined;
type Manifest = Record<ConfigFilePath, ContentHash>;

/**
 * Per-process cache of content hashes, so we only ever need to hash a file once
 */
const hashCache: Manifest = {};

async function hashFile(configFilePath: ConfigFilePath): Promise<ContentHash> {
  const hash = crypto.createHash('sha256');
  const readStream = fs.createReadStream(configFilePath, { encoding: 'utf8', highWaterMark: 1024 });

  for await (const chunk of readStream) {
    hash.update(chunk);
  }

  return hash.digest('hex');
}

async function getHashForFile(configFilePath: ConfigFilePath): Promise<ContentHash> {
  if (hashCache[configFilePath]) {
    return hashCache[configFilePath];
  }

  let hash: ContentHash;

  try {
    hash = await hashFile(configFilePath);
    hashCache[configFilePath] = hash;
  } catch (e) {
    log('Failed to hash file, using fallback value', e);
    hash = EMPTY_HASH;
  }

  return hash;
}

function getHashForManifest(manifest: Manifest): ContentHash {
  const hash = crypto.createHash('sha256');

  for (const [f, h] of Object.entries(manifest)) {
    hash.update(`${f}: ${h || EMPTY_HASH}\n`);
  }

  return hash.digest('hex');
}

export async function hashFiles(files: ConfigFilePath[]): Promise<ContentHash> {
  const manifest: Manifest = await Promise.all(
    files.map((c) => getHashForFile(c).then((h: ContentHash) => [c, h] as [ConfigFilePath, ContentHash]))
  ).then((c) => Object.fromEntries(c));

  return getHashForManifest(manifest);
}
