import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fromEnv, fromInstanceMetadata } from '@aws-sdk/credential-providers';
import { Credentials } from '@aws-sdk/types';
import debug from 'debug';
import execa from 'execa';
import mkdirp from 'mkdirp';
import rimrafCb from 'rimraf';
import tempy from 'tempy';
import { exec, hasBin } from '../../util/exec';
import { Compression } from './compression';

const log = debug('monofo:artifact:compression:desync');

const rimraf = promisify(rimrafCb);

let enabled: boolean | undefined;

const configDir = tempy.directory();
const credentialsPath = path.join(configDir, 'credentials');
const configPath = path.join(configDir, 'config');

process.on('exit', () => {
  (async () => {
    await rimraf(configDir);
  })().catch((err) => {
    throw err;
  });
});

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

function region(): string {
  return process.env.S3_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-2';
}

function cacheFlags(as = 'cache'): string[] {
  return process.env.MONOFO_DESYNC_CACHE ? [`--${as}`, process.env.MONOFO_DESYNC_CACHE] : [];
}

async function writeCredentialsFile(credentials: Credentials): Promise<void> {
  await fs.writeFile(
    credentialsPath,
    `[profile_desync]
aws_access_key_id = ${credentials.accessKeyId}
aws_secret_access_key = ${credentials.secretAccessKey}
${credentials.sessionToken ? `aws_session_token = ${credentials.sessionToken}\n` : ''}`,
    { mode: 0o600 }
  );
}

async function setUpConfig(): Promise<void> {
  if (!needsDynamicConfig()) {
    return;
  }

  await fs.writeFile(
    configPath,
    `${JSON.stringify(
      {
        's3-credentials': {
          'https://s3-us-west-2.amazonaws.com': {
            'aws-credentials-file': credentialsPath,
            'aws-region': region(),
            'aws-profile': 'profile_desync',
          },
        },
      },
      null,
      4
    )}\n`,
    { mode: 0o640 }
  );
}

function needsDynamicConfig(): boolean {
  return !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY;
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
async function setUpCredentials(): Promise<void> {
  if (!needsDynamicConfig()) {
    if (!process.env.S3_REGION) {
      // This is only used with static security credentials :(
      // See https://github.com/folbricht/desync/blob/5dd803ef214b97059acffeddd156594fcc63edd8/cmd/desync/config.go#L61
      log(`Setting S3_REGION=${region()}`);
      process.env.S3_REGION = region();
    }

    return;
  }

  // For dynamic cde
  if (process.env.AWS_SESSION_TOKEN && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      log('Loading env var security credentials into file', credentialsPath);
      await writeCredentialsFile(await fromEnv()());

      log('Successfully loaded');
      process.env.AWS_PROFILE = 'desync';
      process.env.AWS_SHARED_CREDENTIALS_FILE = credentialsPath;

      return;
    } catch (err: unknown) {
      log('Failed to use env var credentials directly', err);
    }
  }

  try {
    log('Loading instance profile security credentials into file', credentialsPath);
    await writeCredentialsFile(await fromInstanceMetadata()());

    log('Successfully loaded');
    process.env.AWS_PROFILE = 'desync';
    process.env.AWS_SHARED_CREDENTIALS_FILE = credentialsPath;

    return;
  } catch (err: unknown) {
    log('Failed to use instance profile from metadata service', err);
  }

  throw new Error('Failed to write credentials for desync process');
}

async function checkEnabled(): Promise<void> {
  if (enabled === undefined) {
    if (!store()) {
      throw new Error('Desync compression disabled due to no MONOFO_DESYNC_STORE given');
    }

    const setup = [setUpConfig(), setUpCredentials(), mkdirp(store()), mkdirp(cache())];

    await Promise.all(setup);
    enabled = await hasBin('desync');
  }

  if (!enabled) {
    throw new Error('Desync compression disabled due to missing desync bin on PATH');
  }
}

export const desync: Compression = {
  /**
   * Deflate a tar file, creating a content-addressed index file
   */
  async deflate(output): Promise<string[]> {
    await checkEnabled();

    // prettier-ignore
    return [
      '|',
      'desync', 'tar',
        ...(needsDynamicConfig() ? ['--config', configPath] : []),
        '--verbose',
        '--tar-add-root',
        '--input-format', 'tar',
        '--index',
        '--store', store(),

      output.filename, // caidx file
      '-',             // tar will be received on input
    ];
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
  async inflate({ input, outputPath = '.', verbose = false }): Promise<execa.ExecaReturnValue> {
    await checkEnabled();

    const allArgs = [
      'untar',
      '--config',
      configPath,
      '--verbose',
      '--no-same-owner',
      '--index',
      '--store',
      store(),
      ...cacheFlags(),
      '-',
      outputPath,
    ];

    log(`Inflating .caidx archive: desync ${allArgs.join(' ')}`);

    const result = await exec(
      'desync',
      allArgs,
      {
        input,
      },
      verbose
    );

    log('Finished inflating desync .caidx');

    return result;
  },
};
