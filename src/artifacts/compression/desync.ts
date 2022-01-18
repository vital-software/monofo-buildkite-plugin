import { promises as fs } from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { Credentials } from '@aws-sdk/types';
import debug from 'debug';
import execa from 'execa';
import mkdirp from 'mkdirp';
import prettyBytes from 'pretty-bytes';
import rimrafCb from 'rimraf';
import tempy from 'tempy';
import { exec, hasBin } from '../../util/exec';
import { execFromTar } from '../../util/tar';
import { Artifact } from '../model';
import { Compressor } from './compressor';

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

function needsDynamicConfig(): boolean {
  return !process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY;
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

  let credentials: Credentials;

  try {
    credentials = await defaultProvider({ timeout: 3000, maxRetries: 3 })();
  } catch (err: unknown) {
    log('Could not find AWS credentials, but require dynamic credentials for desync');
    throw err;
  }

  log('Loading env var security credentials into file', credentialsPath);
  await fs.writeFile(
    credentialsPath,
    `[profile_desync]
aws_access_key_id = ${credentials.accessKeyId}
aws_secret_access_key = ${credentials.secretAccessKey}
${credentials.sessionToken ? `aws_session_token = ${credentials.sessionToken}\n` : ''}`,
    { mode: 0o600 }
  );
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

async function inflateCatar({
  artifact,
  input,
  catar,
  caidx,
  verbose = false,
}: {
  /**
   * The input artifact, used to find the seed dir
   */
  artifact: Artifact;

  /**
   * A stream of the caidx contents
   */
  input: stream.Readable;

  /**
   * An output path the caidx is written to
   */
  caidx: string;

  /**
   * An output path the catar is written to
   */
  catar: string;

  /**
   * Passed on to exec if given
   */
  verbose?: boolean;
}) {
  log('Inflating .caidx into .catar');
  await exec(
    [
      'tee',
      caidx,
      `| desync extract`,
      `--config ${configPath}`,
      '--verbose',
      `--seed-dir ${await artifact.seedDir()}`,
      `--store ${store()}`,
      ...cacheFlags(),
      `-`,
      catar,
    ],
    { input },
    verbose
  );
  log('Finished inflating .caidx into .catar');
}

async function moveToSeed({
  catar,
  caidx,
  artifact,
}: {
  catar: string;
  caidx: string;
  artifact: Artifact;
}): Promise<void> {
  await exec(['mv', '-f', catar, caidx, `${await artifact.seedDir()}/`]);
}

async function extractToOutput({
  outputPath,
  catar,
  verbose = false,
}: {
  outputPath: string;
  catar: string;
  verbose?: boolean;
}): Promise<execa.ExecaReturnValue> {
  log(`Extracting archive to output path ${outputPath}`);
  const result = await exec(
    ['desync', 'untar', '--config', configPath, '--verbose', '--no-same-owner', catar, outputPath, '&'] as string[],
    {},
    verbose
  );
  log('Finished extracting archive to output path');
  return result;
}

async function printSizes({ catar, caidx }: { catar: string; caidx: string }): Promise<void> {
  const caidxStat = await fs.stat(caidx);
  const catarStat = await fs.stat(catar);

  log(`Stored caidx file is ${prettyBytes(caidxStat.size)}`);
  log(`Stored catar file is ${prettyBytes(catarStat.size)}`);
}

export const desync: Compressor = {
  /**
   * Deflate a tar file, creating a content-addressed index file
   */
  async deflate({ artifact, input }): Promise<void> {
    await checkEnabled();

    // TODO: split into tar->catar, and catar->store, tee and keep the intermediate catar

    log('Indexing and storing catar directly (TODO: fix)');
    await execFromTar(input)([
      '|',
      'desync',
      'tar',
      ...(needsDynamicConfig() ? ['--config', configPath] : []),
      '--verbose',
      '--tar-add-root',
      '--input-format',
      'tar',
      '--index',
      '--store',
      store(),

      artifact.filename, // caidx file
      '-', // tar will be received on input
    ]);

    // TODO: copy the catar and caidx to the seed dir

    // TODO: chop into the local cache
    //   if working.caidx is the output.filename, and working.catar is the intermediate output from the above process, then
    //   desync chop ...cacheFlags('store') working.caidx working.catar
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
  async inflate({ input, artifact, outputPath = '.', verbose = false }): Promise<void> {
    await checkEnabled();

    const tmpDir = tempy.directory();

    log(`Will store temporary stdin to ${tmpDir} as ${artifact.name}.caidx`);
    log(`Will store temporary output to ${tmpDir} as a ${artifact.name}.catar`);
    const catar = [tmpDir, `${artifact.name}.catar`].join(path.sep);
    const caidx = [tmpDir, `${artifact.name}.caidx`].join(path.sep);

    await inflateCatar({ artifact, input, catar, caidx, verbose });
    await printSizes({ catar, caidx });
    await extractToOutput({ catar, outputPath, verbose });
    await moveToSeed({ caidx, catar, artifact });
  },
};
