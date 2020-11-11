import AWS from 'aws-sdk';

export const METADATA_TABLE_NAME = 'monofo_cache_metadata';

export const db = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
