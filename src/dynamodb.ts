import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export const service: DynamoDB = new DynamoDB({
  ...(process.env.MOCK_DYNAMODB_ENDPOINT
    ? {
        endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
        sslEnabled: false,
        region: 'local',
      }
    : {}),
});

export const client: DynamoDBDocument = DynamoDBDocument.from(service);
