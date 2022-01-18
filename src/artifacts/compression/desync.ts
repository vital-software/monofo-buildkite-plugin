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
import { exists } from '../../util/helper';
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

function generateTemporaryFilePaths(artifact: Artifact): { caibx: string; catar: string } {
  const tmpDir = tempy.directory();

  log(`Will store temporary output to ${tmpDir} as a ${artifact.name}.catar`);
  log(`Will store temporary stdin to ${tmpDir} as ${artifact.name}.catar.caibx`);

  const catar = [tmpDir, `${artifact.name}.catar`].join(path.sep);
  const caibx = [tmpDir, `${artifact.name}.catar.caibx`].join(path.sep);

  return { catar, caibx };
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
  caibx,
  verbose = false,
}: {
  /**
   * The input artifact, used to find the seed dir
   */
  artifact: Artifact;

  /**
   * A stream of the caibx contents
   */
  input: stream.Readable;

  /**
   * An output path the caibx is written to
   */
  caibx: string;

  /**
   * An output path the catar is written to
   */
  catar: string;

  /**
   * Passed on to exec if given
   */
  verbose?: boolean;
}) {
  log('Inflating .catar.caibx into .catar');
  await exec(
    [
      'tee',
      caibx,
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
  log('Finished inflating .catar.caibx into .catar');
}

/**
 * Moves the artifact files to the seed dir
 *
 * The contract of our seed dir is:
 *  - IFF files are there, they have been chunked and stored to the main S3 storage
 *  - So, it's safe to ignore (i.e. not chop/upload) any chunks present in any
 *    index file in the seed dir
 *
 * So, take care that you wait for the successful S3 upload before calling this
 */
async function moveToSeed({
  catar,
  caibx,
  artifact,
}: {
  catar: string;
  caibx: string;
  artifact: Artifact;
}): Promise<void> {
  const seed = await artifact.seedFiles();

  await Promise.all([
    // important to cp the index, because it might have been placed at artifact.filename
    exec(['cp', '-f', caibx, seed.caibx]),
    // important to mv the archive, because we have no guarantees of its location, and it can be huge
    exec(['mv', '-f', catar, seed.catar]),
  ]);
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
  log(`Extracting archive to output path ${outputPath} (from ${process.cwd()})`);
  const result = await exec(
    ['desync untar', `--config ${configPath}`, '--verbose', '--no-same-owner', catar, outputPath],
    {},
    verbose
  );
  log('Finished extracting archive to output path');
  return result;
}

async function printSizes({ catar, caibx }: { catar: string; caibx: string }): Promise<void> {
  const caibxStat = await fs.stat(caibx);
  const catarStat = await fs.stat(catar);

  log(`Stored caibx file is ${prettyBytes(caibxStat.size)}`);
  log(`Stored catar file is ${prettyBytes(catarStat.size)}`);
}

export const desync: Compressor = {
  /**
   * Deflate a tar file, creating a content-addressed index file
   */
  async deflate({ artifact, input }): Promise<void> {
    await checkEnabled();

    const { catar } = generateTemporaryFilePaths(artifact);

    log(`Generating catar at ${catar}`);
    const tarResult = await execFromTar(input)([
      '|',
      'desync tar',
      ...(needsDynamicConfig() ? ['--config', configPath] : []),
      '--verbose',
      '--tar-add-root',
      '--input-format tar',
      catar,
      '-',
    ]);
    log(`Finished generating catar for ${artifact.name}`, tarResult.stderr);

    log(`Chunking, indexing and storing ${artifact.name} to local cache first`);
    const makeResult = await exec(['desync make', ...cacheFlags('store'), artifact.filename, catar]);
    log(`Chunking and storing finished, index file created at ${artifact.filename}`, makeResult.stderr);

    // We've successfully made an index file
    const caibx = artifact.filename;
    await printSizes({ catar, caibx });

    log(`Chopping ${artifact.name} into remote store (S3)`);

    const seed = await artifact.seedFiles();
    const hasSeed = await exists(seed.caibx);

    await exec([
      'desync chop',
      ...(needsDynamicConfig() ? ['--config', configPath] : []),
      '--verbose',
      `--store ${store()}`,
      hasSeed ? `--ignore ${seed.caibx}` : ``,
      caibx,
      catar,
    ]);

    log(`Finished chopping ${artifact.name} into remote store`);

    await moveToSeed({ catar, caibx, artifact });
    // TODO: copy the catar and caibx to the seed dir

    // TODO: chop into the local cache
    //   if working.catar.caibx is the output.filename, and working.catar is the intermediate output from the above process, then
    //   desync chop ...cacheFlags('store') working.catar.caibx working.catar
  },

  /**
   * Untar an index file, inflating it at the output path
   *
   * - Expects the contents of a .catar.caibx file to be piped into the returned writable stream
   * - Only outputs debugging information to stdout/stderr
   * - Directly inflates the extracted files and writes them to disk
   *
   * @return ExecaChildProcess The result of running desync untar
   */
  async inflate({ input, artifact, outputPath = '.', verbose = false }): Promise<void> {
    await checkEnabled();

    const { catar, caibx } = generateTemporaryFilePaths(artifact);

    await inflateCatar({ artifact, input, catar, caibx, verbose });
    await printSizes({ catar, caibx });
    await extractToOutput({ catar, outputPath, verbose });
    await moveToSeed({ caibx, catar, artifact });
  },
};
