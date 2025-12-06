/**
 * Image Uploader
 *
 * Handles uploading images to cloud storage via presigned URLs.
 * Supports environment-based configuration for dev/prod switching.
 */

import type { ShareError } from './types';

/**
 * Result type for upload operations
 */
export type UploadResult =
  | { success: true; data: string }
  | { success: false; error: ShareError };

/**
 * Response from presigned URL API
 */
interface PresignedUrlResponse {
  /** R2 direct upload URL */
  uploadUrl: string;
  /** Public URL after upload */
  publicUrl: string;
  /** URL expiration time in seconds */
  expiresIn: number;
}

/**
 * Get the API base URL from environment or default
 * Default is empty string (relative path) to use same-domain API Routes
 */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SHARE_API_URL || '';
}

/**
 * Validate presigned URL response
 */
function isValidPresignedResponse(data: unknown): data is PresignedUrlResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const response = data as Record<string, unknown>;

  return (
    typeof response.uploadUrl === 'string' &&
    typeof response.publicUrl === 'string' &&
    typeof response.expiresIn === 'number'
  );
}

/**
 * Request a presigned URL for uploading
 */
async function getPresignedUrl(
  contentType: string,
  fileSize: number
): Promise<
  | { success: true; data: PresignedUrlResponse }
  | { success: false; error: ShareError }
> {
  const apiUrl = getApiBaseUrl();
  const endpoint = `${apiUrl}/api/upload/presigned`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType,
        fileSize,
      }),
    });

    // Handle 413 Payload Too Large specifically
    if (response.status === 413) {
      return {
        success: false,
        error: {
          type: 'image_too_large',
          message: 'Image file is too large for upload',
        },
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: {
          type: 'upload_failed',
          message: `Failed to get presigned URL: ${response.status} ${response.statusText}`,
        },
      };
    }

    const data: unknown = await response.json();

    if (!isValidPresignedResponse(data)) {
      return {
        success: false,
        error: {
          type: 'upload_failed',
          message: 'Invalid presigned URL response',
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to get presigned URL:', error);
    return {
      success: false,
      error: {
        type: 'upload_failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to get presigned URL',
      },
    };
  }
}

/**
 * Upload blob to presigned URL
 */
async function uploadToPresignedUrl(
  uploadUrl: string,
  blob: Blob
): Promise<{ success: true } | { success: false; error: ShareError }> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': blob.type,
      },
      body: blob,
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          type: 'upload_failed',
          message: `Failed to upload image: ${response.status} ${response.statusText}`,
        },
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to upload to presigned URL:', error);
    return {
      success: false,
      error: {
        type: 'upload_failed',
        message:
          error instanceof Error ? error.message : 'Failed to upload image',
      },
    };
  }
}

/**
 * Upload an image blob to storage
 *
 * Flow:
 * 1. Request presigned URL from API
 * 2. Upload blob to presigned URL
 * 3. Return public URL
 *
 * @param blob - Image blob to upload
 * @returns UploadResult with public URL on success, error on failure
 */
export async function uploadImage(blob: Blob): Promise<UploadResult> {
  // Step 1: Get presigned URL
  const presignedResult = await getPresignedUrl(blob.type, blob.size);

  if (!presignedResult.success) {
    return presignedResult;
  }

  // Step 2: Upload to presigned URL
  const uploadResult = await uploadToPresignedUrl(
    presignedResult.data.uploadUrl,
    blob
  );

  if (!uploadResult.success) {
    return uploadResult;
  }

  // Step 3: Return public URL
  return {
    success: true,
    data: presignedResult.data.publicUrl,
  };
}
