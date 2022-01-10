import { promises as fs } from 'fs';
import path from 'path';
import stream from 'stream';
import { fromEnv, fromInstanceMetadata } from '@aws-sdk/credential-providers';
import { Credentials } from '@aws-sdk/types/dist-types/credentials';
import debug from 'debug';
import execa, { ExecaReturnValue } from 'execa';
import tempy from 'tempy';
import { hasInstanceMetadata, getInstanceProfileSecurityCredentials } from '../../util/aws.js';
import { hasBin } from '../../util/exec.js';
import { Compression } from './compression.js';

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
      log(`Ensuring ${dir} exists via mkdir`);
      await fs.mkdir(dir, { recursive: true });
    }
  } catch (err: unknown) {
    if (err instanceof MissingConfigError) return;
    throw err;
  }
}

async function writeConfigFile(credentials: Credentials, configFile: string): Promise<void> {
  await fs.writeFile(
    configFile,
    `[profile_desync]
aws_access_key_id = ${credentials.accessKeyId}
aws_secret_access_key = ${credentials.secretAccessKey}
${credentials.sessionToken ? `aws_session_token = ${credentials.sessionToken}\n` : ''}`,
    { mode: 0o600 }
  );
}

/**
 * If S3_ACCESS_KEY, S3_SECRET_KEY (static credentials) are given, those are used. Otherwise, these are the standard way
 * to set STS credentials:
 *
 * AWS_ACCESS_KEY_ID=ASIAABCDEFABCDEF
 * AWS_SECRET_ACCESS_KEY=(40 chars)
 * AWS_SESSION_TOKEN=(392 chars)
 *
 * But first we must read them from instance metadata, because they're not in environment variables to start with.
 *
 * But we can only get Desync to use the session token via the credentials file:
 *  https://github.com/folbricht/desync/blob/651a6cea14a080326bb64b28b82c14495c2028ff/cmd/desync/config.go#L67
 *
 * So, we write out a temporary credentials file and mutate process.env to refer to it.
 */
async function ensureConfigExists(): Promise<void> {
  log('Checking whether to create config file');

  const configDir = tempy.directory();
  const configFile = path.join(configDir, 'credentials');
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

  if (region && !process.env.S3_REGION) {
    log(`Setting S3_REGION=${region}`);
    process.env.S3_REGION = region;
  }

  /*
   * Desync only understands S3_ACCESS_KEY, S3_SECRET_KEY - not the standard AWS_*
   *
   * We will translated those, via the configuration file. But first, if they're not already set, perhaps we can
   * load them from the instance metadata (i.e. if you're in EC2)
   */
  if (process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
    log('Using static S3 credentials');
    return;
  }

  if (process.env.AWS_SESSION_TOKEN && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      log('Loading env var security credentials into config file', configFile);
      await writeConfigFile(await fromEnv()(), configFile);

      log('Successfully loaded');
      process.env.AWS_PROFILE = 'desync';
      process.env.AWS_SHARED_CREDENTIALS_FILE = configFile;
    } catch (err: unknown) {
      log('Failed to use env var credentials directly', err);
    }
  }

  try {
    log('Loading instance profile security credentials into config file', configFile);
    await writeConfigFile(await fromInstanceMetadata()(), configFile);

    log('Successfully loaded');
    process.env.AWS_PROFILE = 'desync';
    process.env.AWS_SHARED_CREDENTIALS_FILE = configFile;
  } catch (err: unknown) {
    log('Failed to use instance profile from metadata service', err);
  }
}

async function checkEnabled(): Promise<void> {
  if (!store()) {
    throw new Error('Desync compression disabled due to no MONOFO_DESYNC_STORE given');
  }

  if (enabled === undefined) {
    await ensureConfigExists();

    await ensureExists(() => store());
    await ensureExists(() => cache());

    enabled = await hasBin('desync');
  }

  if (!enabled) {
    throw new Error('Desync compression disabled due to missing desync bin on PATH');
  }
}

export const desync: Compression = {
  extension: 'caidx',

  /**
   * Deflate a tar file, creating a content-addressed index file
   */
  async deflateCmd(): Promise<string[]> {
    await checkEnabled();

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
    await checkEnabled();

    log(`Inflating .caidx archive: desync ${untarFlags().join(' ')} - ${outputPath}`);

    const result = await execa('desync', [...untarFlags(), '-', outputPath], {
      input,
    });

    log('Finished inflating desync .caidx');

    return result;
  },
};
