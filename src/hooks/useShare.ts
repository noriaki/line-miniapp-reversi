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
import type { ShareResult } from '@/lib/share/flex-message-builder';
import { useMessageQueue } from './useMessageQueue';

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

/**
 * Custom hook for managing share operations
 *
 * @param baseUrl - Base URL for the application
 * @returns Share state and operations
 */
export function useShare(baseUrl: string): UseShareReturn {
  const [isSharing, setIsSharing] = useState(false);
  const messageQueue = useMessageQueue();

  // Check share availability (memoized to avoid recalculation)
  const canShareLine = useMemo(() => canShareToLine(), []);
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

      setIsSharing(true);

      try {
        const outcome = await shareToLineService(result, baseUrl);

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
    [isSharing, baseUrl, showSuccessToast, showErrorToast]
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

      setIsSharing(true);

      try {
        const outcome = await shareToWebService(result, baseUrl);

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
    [isSharing, baseUrl, showSuccessToast, showErrorToast]
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
