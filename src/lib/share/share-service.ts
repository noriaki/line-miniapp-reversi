/**
 * Share Service
 * Provides LINE and Web Share API integration for game result sharing
 */

import liff from '@line/liff';
import { buildFlexMessage, type ShareResult } from './flex-message-builder';

/** Share operation outcome */
export type ShareOutcome =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

/**
 * Check if LINE shareTargetPicker API is available
 * Returns false if LIFF is not initialized or API is not supported
 */
export function canShareToLine(): boolean {
  try {
    return liff.isApiAvailable('shareTargetPicker');
  } catch {
    return false;
  }
}

/**
 * Check if Web Share API is available
 * Returns false if navigator.share is not supported
 */
export function canShareToWeb(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  // Check canShare if available
  if (typeof navigator.canShare === 'function') {
    try {
      return navigator.canShare({ text: 'test', url: 'https://example.com' });
    } catch {
      return false;
    }
  }

  // If canShare is not available, assume share is supported
  return true;
}

/**
 * Share game result to LINE via shareTargetPicker
 *
 * @param result - Game result data
 * @param permalinkUrl - Permalink URL for result page navigation (miniapp.line.me)
 * @param ogImageUrl - OG image URL for Flex Message hero (endpoint URL)
 * @param homeUrl - Home URL for new game navigation (miniapp.line.me)
 * @returns ShareOutcome indicating success, cancellation, or error
 */
export async function shareToLine(
  result: ShareResult,
  permalinkUrl: string,
  ogImageUrl: string,
  homeUrl: string
): Promise<ShareOutcome> {
  // Check API availability
  if (!canShareToLine()) {
    return {
      status: 'error',
      message: 'LINE share is not available in this environment',
    };
  }

  try {
    // Build Flex Message with permalink, OG image URL, and home URL
    const flexMessage = buildFlexMessage(
      result,
      permalinkUrl,
      ogImageUrl,
      homeUrl
    );

    // Call shareTargetPicker
    // Type assertion needed as our local type is compatible but not identical to LIFF's internal type
    await liff.shareTargetPicker([
      flexMessage as Parameters<typeof liff.shareTargetPicker>[0][number],
    ]);

    return { status: 'success' };
  } catch (error) {
    // Check for cancellation
    if (isCancelError(error)) {
      return { status: 'cancelled' };
    }

    // Return error with message
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return { status: 'error', message };
  }
}

/**
 * Share game result via Web Share API
 *
 * @param result - Game result data
 * @param shareUrl - Share URL (permalink for LINE Mini App)
 * @returns ShareOutcome indicating success, cancellation, or error
 */
export async function shareToWeb(
  result: ShareResult,
  shareUrl: string
): Promise<ShareOutcome> {
  // Check API availability
  if (!canShareToWeb()) {
    return {
      status: 'error',
      message: 'Web Share is not available in this environment',
    };
  }

  try {
    const { blackCount, whiteCount, winner } = result;

    // Build share text with result
    const winnerText = getWinnerText(winner);
    const shareText = `\u30EA\u30D0\u30FC\u30B7\u5BFE\u6226\u7D50\u679C: ${winnerText}\uFF01 \u9ED2${blackCount} - \u767D${whiteCount}`;

    // Call Web Share API (URL and text only, no files)
    await navigator.share({
      text: shareText,
      url: shareUrl,
    });

    return { status: 'success' };
  } catch (error) {
    // Check for user abort (cancellation)
    if (isAbortError(error)) {
      return { status: 'cancelled' };
    }

    // Return error with message
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return { status: 'error', message };
  }
}

/**
 * Check if error is a LIFF cancellation error
 */
function isCancelError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  // Check for cancel code (LIFF specific)
  if ((error as Error & { code?: string }).code === 'cancel') {
    return true;
  }

  // Check for cancel message patterns
  const message = error.message.toLowerCase();
  return message.includes('cancel') || message.includes('close');
}

/**
 * Check if error is a Web Share abort error
 */
function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === 'AbortError';
}

/**
 * Get winner display text
 */
function getWinnerText(winner: 'black' | 'white' | 'draw'): string {
  switch (winner) {
    case 'black':
      return '\u9ED2\u306E\u52DD\u3061';
    case 'white':
      return '\u767D\u306E\u52DD\u3061';
    case 'draw':
      return '\u5F15\u304D\u5206\u3051';
  }
}
