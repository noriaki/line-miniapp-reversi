/**
 * ShareImageGenerator
 *
 * Generates share images from DOM elements using html2canvas
 * and handles image upload to storage.
 *
 * Requirements: 4.1, 8.1
 */

import type { ShareError, ImageGenerationOptions } from './types';

/**
 * Result type for image generation operations
 */
export type ImageGenerationResult =
  | { success: true; data: Blob }
  | { success: false; error: ShareError };

/**
 * Default options for image generation
 */
const DEFAULT_OPTIONS: Required<ImageGenerationOptions> = {
  scale: 2,
  format: 'image/png',
  quality: 0.9,
  maxSizeBytes: 1048576, // 1MB
};

/**
 * Convert canvas to blob using a Promise wrapper
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      format,
      format === 'image/jpeg' ? quality : undefined
    );
  });
}

/**
 * Generate an image blob from a DOM element reference
 *
 * Uses html2canvas to capture the DOM element and convert it to a Blob.
 * Supports customization via ImageGenerationOptions.
 *
 * @param containerRef - React ref to the DOM element to capture
 * @param options - Optional configuration for image generation
 * @returns ImageGenerationResult with blob on success, error on failure
 */
export async function generateImageBlob(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options?: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  // Merge options with defaults
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate element exists
  if (!containerRef.current) {
    return {
      success: false,
      error: {
        type: 'share_failed',
        message: 'Share image element not found',
      },
    };
  }

  try {
    // Dynamic import html2canvas to allow for mocking and lazy loading
    const html2canvas = (await import('html2canvas')).default;

    // Generate canvas from DOM element
    const canvas = await html2canvas(containerRef.current, {
      scale: opts.scale,
      useCORS: false, // Don't use CORS for external images
      logging: false, // Disable logging in production
      backgroundColor: null, // Use element's background
    });

    // Convert canvas to blob
    const blob = await canvasToBlob(canvas, opts.format, opts.quality);

    if (!blob) {
      return {
        success: false,
        error: {
          type: 'share_failed',
          message: 'Failed to convert canvas to blob',
        },
      };
    }

    // Check file size
    if (blob.size > opts.maxSizeBytes) {
      return {
        success: false,
        error: {
          type: 'image_too_large',
          message: `Image size (${blob.size} bytes) exceeds maximum allowed size (${opts.maxSizeBytes} bytes)`,
        },
      };
    }

    return {
      success: true,
      data: blob,
    };
  } catch (error) {
    console.error('Image generation failed:', error);
    return {
      success: false,
      error: {
        type: 'share_failed',
        message:
          error instanceof Error ? error.message : 'Image generation failed',
      },
    };
  }
}
