import fs from 'fs';
import path from 'path';
import stream from 'stream';
import util from 'util';
import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import tempy from 'tempy';
import { hasBin } from '../../util/exec';
import { Compression } from './compression';

const mkdir = util.promisify(fs.mkdir);

const log = debug('monofo:artifact:compression:desync');

let enabled: boolean | undefined;

class MissingConfigError extends Error {}

function store(): string {
  if (!process.env?.MONOFO_DESYNC_STORE) {
    throw new MissingConfigError('Could not get store details from MONOFO_DESYNC_STORE');
  }
  return process.env.MONOFO_DESYNC_STORE;
}

function cache(): string {
  if (!process.env.MONOFO_DESYNC_CACHE) {
    throw new MissingConfigError('Could not get cache details from MONOFO_DESYNC_CACHE');
  }
  return process.env.MONOFO_DESYNC_CACHE;
}

function cacheFlags(as = 'cache'): string[] {
  return process.env.MONOFO_DESYNC_CACHE ? [`--${as}`, process.env.MONOFO_DESYNC_CACHE] : [];
}

function tarFlags() {
  return ['tar', '--tar-add-root', '--input-format', 'tar', '--index', '--store', store()];
}

function untarFlags() {
  return ['untar', '--no-same-owner', '--index', '--store', store(), ...cacheFlags()];
}

/**
 * Recursively creates a directory if it doesn't exist, ignoring any path parts that do exist
 *
 * @param maybeDir function returning string because it'll throw if there's no such configured store/cache directory type
 */
async function ensureExists(maybeDir: () => string) {
  try {
    const dir = maybeDir();

    // Only local caches/stores
    if (dir.indexOf(':') !== -1 || dir.startsWith('s3')) {
      return;
    }

    if (dir) {
      await mkdir(dir, { recursive: true });
    }
  } catch (err: unknown) {
    if (err instanceof MissingConfigError) return;
    throw err;
  }
}

/**
 * When using STS credentials, these are set:
 *
 * AWS_ACCESS_KEY_ID=ASIAABCDEFABCDEF
 * AWS_SECRET_ACCESS_KEY=(40 chars)
 * AWS_SESSION_TOKEN=(392 chars)
 *
 * But we can only get Desync to use the session token via the credentials file:
 *  https://github.com/folbricht/desync/blob/651a6cea14a080326bb64b28b82c14495c2028ff/cmd/desync/config.go#L67
 *
 * So, we write out a temporary credentials file and mutate process.env to refer to it
 */
function ensureConfig() {
  const configDir = tempy.directory();
  const configFile = path.join(configDir, 'credentials');

  if (process.env.AWS_SESSION_TOKEN && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    log('Creating desync config file to allow for use of STS credentials');

    const credentials = fs.createWriteStream(configFile, { mode: 0o600 });
    credentials.write(`[profile_desync]\n`);
    credentials.write(`aws_access_key_id = ${process.env.AWS_ACCESS_KEY_ID}\n`);
    credentials.write(`aws_secret_access_key = ${process.env.AWS_SECRET_ACCESS_KEY}\n`);
    credentials.write(`aws_session_token = ${process.env.AWS_SESSION_TOKEN}\n`);
    credentials.end();

    process.env.AWS_PROFILE = 'desync';
    process.env.AWS_SHARED_CREDENTIALS_FILE = configFile;

    delete process.env.AWS_SESSION_TOKEN;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  }
}

export const desync: Compression = {
  extension: 'caidx',

  async checkEnabled() {
    if (!store()) {
      throw new Error('Desync compression disabled due to no MONOFO_DESYNC_STORE given');
    }

    if (enabled === undefined) {
      ensureConfig();

      await ensureExists(() => store());
      await ensureExists(() => cache());

      enabled = await hasBin('desync');
    }

    if (!enabled) {
      throw new Error('Desync compression disabled due to missing desync bin on PATH');
    }
  },

  /**
   * Deflate a tar file, creating a content-addressed index file
   */
  deflateCmd(): string[] {
    return ['desync', ...tarFlags(), '-', '-'];
  },

  /**
   * Untar an index file, inflating it at the output path
   *
   * - Expects the contents of a .caidx file to be piped into the returned writable stream
   * - Only outputs debugging information to stdout/stderr
   * - Directly inflates the extracted files and writes them to disk
   *
   * @return ExecaChildProcess The result of running desync untar
   */
  async inflate(input: stream.Readable, outputPath = '.'): Promise<ExecaReturnValue> {
    log(`Inflating .caidx archive: desync ${untarFlags().join(' ')} - ${outputPath}`);

    const result = await execa('desync', [...untarFlags(), '-', outputPath], {
      input,
    });

    log('Finished inflating desync .caidx');

    return result;
  },
};
