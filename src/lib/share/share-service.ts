/**
 * ShareService
 *
 * Provides share processing business logic for game results.
 * Coordinates image generation, upload, and sharing via LINE and Web Share API.
 */

import liff from '@line/liff';
import type { GameResult, ShareError } from './types';
import { generateImageBlob } from './share-image-generator';
import { uploadImage } from './image-uploader';
import { buildShareFlexMessage } from './flex-message-builder';
import { buildShareText } from './share-text-builder';

/**
 * Result type for share service operations
 */
export type ShareServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ShareError };

/**
 * Data returned from prepareShareImage
 */
export interface PreparedShareImage {
  /** Public URL of the uploaded image */
  imageUrl: string;
  /** Blob of the generated image (for Web Share API) */
  imageBlob: Blob;
}

/**
 * Prepare share image by generating and uploading
 *
 * Flow:
 * 1. Generate image blob from DOM element using html2canvas
 * 2. Upload blob to cloud storage
 * 3. Return both URL and blob for different share methods
 *
 * @param containerRef - React ref to the share image preview element
 * @returns ShareServiceResult with image URL and blob on success
 */
export async function prepareShareImage(
  containerRef: React.RefObject<HTMLDivElement | null>
): Promise<ShareServiceResult<PreparedShareImage>> {
  // Step 1: Generate image blob
  const generateResult = await generateImageBlob(containerRef);

  if (!generateResult.success) {
    return generateResult;
  }

  const imageBlob = generateResult.data;

  // Step 2: Upload to storage
  const uploadResult = await uploadImage(imageBlob);

  if (!uploadResult.success) {
    return uploadResult;
  }

  // Step 3: Return both URL and blob
  return {
    success: true,
    data: {
      imageUrl: uploadResult.data,
      imageBlob,
    },
  };
}

/**
 * Share via LINE using LIFF shareTargetPicker
 *
 * Preconditions:
 * - LIFF must be initialized
 * - User must be logged in
 *
 * @param imageUrl - URL of the share image (must be HTTPS)
 * @param result - Game result for message content
 * @param appUrl - LIFF endpoint URL for the play button
 * @returns ShareServiceResult with void on success
 */
export async function shareViaLine(
  imageUrl: string,
  result: GameResult,
  appUrl: string
): Promise<ShareServiceResult<void>> {
  // Check if shareTargetPicker is available
  if (!liff.isApiAvailable('shareTargetPicker')) {
    return {
      success: false,
      error: { type: 'not_supported' },
    };
  }

  try {
    // Build Flex Message
    const flexMessage = buildShareFlexMessage(imageUrl, result, appUrl);

    // Call shareTargetPicker
    const shareResult = await liff.shareTargetPicker([flexMessage]);

    // Check if user completed the share
    // shareTargetPicker returns undefined or object without status='success' when cancelled
    if (!shareResult || shareResult.status !== 'success') {
      return {
        success: false,
        error: { type: 'cancelled' },
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('LINE share failed:', error);
    return {
      success: false,
      error: {
        type: 'share_failed',
        message: error instanceof Error ? error.message : 'LINE share failed',
      },
    };
  }
}

/**
 * Share via Web Share API
 *
 * Uses navigator.share() with file support for sharing
 * the game result image along with text.
 *
 * @param imageBlob - Image blob to share
 * @param result - Game result for share text
 * @param appUrl - App URL to include in share text
 * @returns ShareServiceResult with void on success
 */
export async function shareViaWebShare(
  imageBlob: Blob,
  result: GameResult,
  appUrl: string
): Promise<ShareServiceResult<void>> {
  // Check if Web Share API is available
  if (typeof navigator === 'undefined' || !navigator.share) {
    return {
      success: false,
      error: { type: 'not_supported' },
    };
  }

  // Create File from blob
  const file = new File([imageBlob], 'reversi-result.png', {
    type: 'image/png',
  });

  // Build share data
  const shareText = buildShareText(result, appUrl);
  const shareData: ShareData = {
    files: [file],
    text: shareText,
  };

  // Check if sharing with files is supported
  if (navigator.canShare && !navigator.canShare(shareData)) {
    return {
      success: false,
      error: { type: 'not_supported' },
    };
  }

  try {
    await navigator.share(shareData);
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    // AbortError means user cancelled
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: { type: 'cancelled' },
      };
    }

    console.error('Web Share failed:', error);
    return {
      success: false,
      error: {
        type: 'share_failed',
        message:
          error instanceof Error ? error.message : 'Web Share API failed',
      },
    };
  }
}
