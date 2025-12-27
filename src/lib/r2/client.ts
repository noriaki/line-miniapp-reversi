/**
 * R2 S3-compatible client initialization module
 * Configures client from environment variables for Cloudflare R2 storage
 */

import { S3Client } from '@aws-sdk/client-s3';

// Validate required environment variables
function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const R2_ACCOUNT_ID = getRequiredEnv('R2_ACCOUNT_ID');
const R2_ACCESS_KEY_ID = getRequiredEnv('R2_ACCESS_KEY_ID');
const R2_SECRET_ACCESS_KEY = getRequiredEnv('R2_SECRET_ACCESS_KEY');

/** R2 bucket name from environment */
export const R2_BUCKET = getRequiredEnv('R2_BUCKET');

/** R2 public domain from environment */
export const R2_PUBLIC_DOMAIN = getRequiredEnv('R2_PUBLIC_DOMAIN');

/** R2 S3 Client instance */
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
