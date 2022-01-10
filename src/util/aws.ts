import got from 'got';

export async function hasInstanceMetadata(): Promise<boolean> {
  try {
    await got.get('http://169.254.169.254/latest/', {
      timeout: 500,
    });
    return true;
  } catch (err) {
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

  const credentialsBody = (
    await got.get(`http://169.254.169.254/latest/meta-data/iam/security-credentials/${defaultRole}/`, {
      timeout: 2000,
    })
  ).body;

  return JSON.parse(credentialsBody) as InstanceProfileCredentials;
}
