import debug from 'debug';
import got from 'got';

const log = debug('monofo:util:aws');

export async function hasInstanceMetadata(): Promise<boolean> {
  try {
    log('Checking for instance metadata server');
    await got.head('http://169.254.169.254/latest/', {
      timeout: 500,
    });
    log('Server is present');
    return true;
  } catch (err: unknown) {
    log('Server is NOT present', err);
    return false;
  }
}

interface InstanceProfileCredentials {
  Code: string;
  LastUpdated: string;
  Type: string;
  AccessKeyId: string;
  SecretAccessKey: string;
  Token: string;
  Expiration: string;
}

export async function getInstanceProfileSecurityCredentials(): Promise<InstanceProfileCredentials> {
  const defaultRole = (
    await got.get('http://169.254.169.254/latest/meta-data/iam/security-credentials/', {
      timeout: 2000,
    })
  ).body.trim();

  log(`Using instance profile role: ${defaultRole}`);

  const credentialsBody = (
    await got.get(`http://169.254.169.254/latest/meta-data/iam/security-credentials/${defaultRole}/`, {
      timeout: 2000,
    })
  ).body;

  return JSON.parse(credentialsBody) as InstanceProfileCredentials;
}
