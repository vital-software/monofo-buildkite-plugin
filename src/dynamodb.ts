import DynamoDB from 'aws-sdk/clients/dynamodb';

export const service = new DynamoDB({
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: 'local',
  }),
});

export const client = new DynamoDB.DocumentClient({ service });
