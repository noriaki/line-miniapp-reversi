/**
 * R2 operations utility module
 * Provides object existence check, upload, and URL builder functions
 */

import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, R2_PUBLIC_DOMAIN } from './client';

/**
 * Check if object exists in R2
 * @param key - Object key in R2 bucket
 * @returns true if exists, false if not found
 * @throws Error on connection failure
 */
export async function checkR2Exists(key: string): Promise<boolean> {
  try {
    await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    // NotFound means object doesn't exist
    if (error instanceof Error && error.name === 'NotFound') {
      return false;
    }
    // Log and re-throw other errors
    console.error('R2 checkR2Exists error:', error);
    throw error;
  }
}

/**
 * Upload buffer to R2
 * @param key - Object key in R2 bucket
 * @param body - Buffer to upload
 * @throws Error on upload failure
 */
export async function uploadToR2(key: string, body: Buffer): Promise<void> {
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: 'image/png',
      })
    );
  } catch (error) {
    console.error('R2 uploadToR2 error:', error);
    throw error;
  }
}

/**
 * Build R2 public URL for object
 * @param key - Object key in R2 bucket
 * @returns Full public URL for the object
 */
export function buildR2Url(key: string): string {
  return `https://${R2_PUBLIC_DOMAIN}/${key}`;
}
