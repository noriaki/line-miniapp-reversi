/**
 * Presigned URL API Route
 *
 * Generates presigned URLs for uploading images to Cloudflare R2.
 * R2 uses S3-compatible API, so we use AWS SDK.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MAX_FILE_SIZE = 1048576; // 1MB
const EXPIRES_IN = 300; // 5 minutes

interface PresignedUrlRequest {
  contentType: string;
  fileSize: number;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
}

interface ErrorResponse {
  error: string;
}

/**
 * Create JSON response helper
 */
function jsonResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Validate environment variables for R2 configuration
 */
function validateEnvironment():
  | { valid: true }
  | { valid: false; error: string } {
  const requiredVars = [
    'R2_ENDPOINT',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      return {
        valid: false,
        error: `Missing R2 configuration: ${varName}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Generate unique image ID
 */
function generateImageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create S3 client configured for R2
 */
function createR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * POST /api/upload/presigned
 *
 * Generate a presigned URL for uploading an image to R2.
 */
export async function POST(request: Request): Promise<Response> {
  // Validate environment
  const envResult = validateEnvironment();
  if (!envResult.valid) {
    console.error('R2 configuration error:', envResult.error);
    return jsonResponse<ErrorResponse>(
      { error: 'Server configuration error' },
      500
    );
  }

  // Parse request body
  let body: PresignedUrlRequest;
  try {
    body = (await request.json()) as PresignedUrlRequest;
  } catch {
    return jsonResponse<ErrorResponse>({ error: 'Invalid JSON body' }, 400);
  }

  // Validate required fields
  if (!body.contentType || typeof body.fileSize !== 'number') {
    return jsonResponse<ErrorResponse>(
      { error: 'Missing required fields: contentType, fileSize' },
      400
    );
  }

  // Validate content type (only image/png allowed)
  if (body.contentType !== 'image/png') {
    return jsonResponse<ErrorResponse>(
      { error: 'Only image/png content type is allowed' },
      400
    );
  }

  // Validate file size (max 1MB)
  if (body.fileSize > MAX_FILE_SIZE) {
    return jsonResponse<ErrorResponse>(
      { error: 'File size exceeds maximum allowed (1MB)' },
      413
    );
  }

  try {
    const client = createR2Client();
    const imageId = generateImageId();
    const key = `share-images/${imageId}.png`;

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: body.contentType,
      ContentLength: body.fileSize,
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: EXPIRES_IN,
    });

    // Construct public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    const response: PresignedUrlResponse = {
      uploadUrl,
      publicUrl,
      expiresIn: EXPIRES_IN,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    return jsonResponse<ErrorResponse>(
      { error: 'Failed to generate upload URL' },
      500
    );
  }
}
