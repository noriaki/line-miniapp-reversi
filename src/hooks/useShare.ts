/**
 * useShare Hook
 * Manages share state, exclusion control, and toast notifications
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  canShareToLine,
  canShareToWeb,
  shareToLine as shareToLineService,
  shareToWeb as shareToWebService,
} from '@/lib/share/share-service';
import {
  buildPermalink,
  buildHomeUrl,
  buildEndpointUrl,
  buildResultPath,
  buildOgImagePath,
} from '@/lib/share/url-builder';
import type { ShareResult } from '@/lib/share/flex-message-builder';
import { useMessageQueue } from './useMessageQueue';
import { useLiff } from './useLiff';

/** Toast display duration in milliseconds */
const TOAST_TIMEOUT_MS = 3000;

/** Return type for useShare hook */
export interface UseShareReturn {
  /** Whether a share operation is in progress */
  readonly isSharing: boolean;

  /** Whether LINE share is available */
  readonly canShareLine: boolean;

  /** Whether Web Share is available */
  readonly canShareWeb: boolean;

  /** Share to LINE via shareTargetPicker */
  shareToLine: (result: ShareResult) => Promise<void>;

  /** Share via Web Share API */
  shareToWeb: (result: ShareResult) => Promise<void>;

  /** Message queue for toast display */
  readonly messageQueue: ReturnType<typeof useMessageQueue>;
}

/** Configuration for useShare hook */
export interface UseShareConfig {
  /** Base URL for endpoint access (OGP images) - fallback when ogImageUrl is not provided */
  readonly baseUrl: string;
  /** LIFF ID for permalink construction */
  readonly liffId: string | undefined;
  /** R2 public domain URL for OGP image (optional - uses baseUrl fallback if not provided) */
  readonly ogImageUrl?: string;
}

/**
 * Custom hook for managing share operations
 *
 * @param config - Configuration object with baseUrl and liffId
 * @returns Share state and operations
 */
export function useShare({
  baseUrl,
  liffId,
  ogImageUrl: providedOgImageUrl,
}: UseShareConfig): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const messageQueue = useMessageQueue();
  const { isReady: liffIsReady } = useLiff();

  // Check share availability (re-evaluate when LIFF becomes ready)
  const canShareLine = useMemo(() => canShareToLine(), [liffIsReady]);
  const canShareWeb = useMemo(() => canShareToWeb(), []);

  /**
   * Show success toast
   */
  const showSuccessToast = useCallback(() => {
    messageQueue.addMessage({
      type: 'info',
      text: '\u30B7\u30A7\u30A2\u3057\u307E\u3057\u305F',
      timeout: TOAST_TIMEOUT_MS,
    });
  }, [messageQueue]);

  /**
   * Show error toast
   */
  const showErrorToast = useCallback(() => {
    messageQueue.addMessage({
      type: 'warning',
      text: '\u30B7\u30A7\u30A2\u306B\u5931\u6557\u3057\u307E\u3057\u305F',
      timeout: TOAST_TIMEOUT_MS,
    });
  }, [messageQueue]);

  /**
   * Share to LINE via shareTargetPicker
   */
  const shareToLine = useCallback(
    async (result: ShareResult): Promise<void> => {
      // Prevent concurrent shares
      if (isSharing) {
        return;
      }

      // Check LIFF ID availability
      if (!liffId) {
        showErrorToast();
        return;
      }

      setIsSharing(true);

      try {
        // Build URLs
        const path = buildResultPath(result.side, result.encodedMoves);
        const permalinkUrl = buildPermalink(liffId, path);
        const homeUrl = buildHomeUrl(liffId);

        // Use provided R2 URL if available, otherwise fall back to endpoint URL
        const ogImageUrl =
          providedOgImageUrl ??
          buildEndpointUrl(
            baseUrl,
            buildOgImagePath(result.side, result.encodedMoves)
          );

        const outcome = await shareToLineService(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );

        switch (outcome.status) {
          case 'success':
            showSuccessToast();
            break;
          case 'error':
            showErrorToast();
            break;
          case 'cancelled':
            // No toast for cancellation
            break;
        }
      } finally {
        setIsSharing(false);
      }
    },
    [
      isSharing,
      liffId,
      baseUrl,
      providedOgImageUrl,
      showSuccessToast,
      showErrorToast,
    ]
  );

  /**
   * Share via Web Share API
   */
  const shareToWeb = useCallback(
    async (result: ShareResult): Promise<void> => {
      // Prevent concurrent shares
      if (isSharing) {
        return;
      }

      // Check LIFF ID availability
      if (!liffId) {
        showErrorToast();
        return;
      }

      setIsSharing(true);

      try {
        // Build permalink URL for sharing
        const path = buildResultPath(result.side, result.encodedMoves);
        const shareUrl = buildPermalink(liffId, path);

        const outcome = await shareToWebService(result, shareUrl);

        switch (outcome.status) {
          case 'success':
            showSuccessToast();
            break;
          case 'error':
            showErrorToast();
            break;
          case 'cancelled':
            // No toast for cancellation
            break;
        }
      } finally {
        setIsSharing(false);
      }
    },
    [isSharing, liffId, showSuccessToast, showErrorToast]
  );

  return {
    isSharing,
    canShareLine,
    canShareWeb,
    shareToLine,
    shareToWeb,
    messageQueue,
  };
}
