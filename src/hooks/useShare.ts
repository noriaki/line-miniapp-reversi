/**
 * useShare Hook
 *
 * Manages share functionality state and operations for game result sharing.
 * Handles LINE share via LIFF SDK and Web Share API.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useLiff } from './useLiff';
import { useMessageQueue } from './useMessageQueue';
import {
  pendingShareStorage,
  prepareShareImage as prepareShareImageService,
  shareViaLine,
  shareViaWebShare,
} from '@/lib/share';
import type { Board, Player } from '@/lib/game/types';

/**
 * LIFF endpoint URL for the app
 */
const APP_URL = process.env.NEXT_PUBLIC_LIFF_ENDPOINT_URL ?? '';

/**
 * Toast notification timeout in milliseconds
 */
const TOAST_TIMEOUT_MS = 3000;

/**
 * Return type for useShare hook
 */
export interface UseShareReturn {
  /** Share image ready state */
  readonly isShareReady: boolean;
  /** Share operation in progress */
  readonly isSharing: boolean;
  /** Web Share API availability */
  readonly canWebShare: boolean;
  /** Uploaded share image URL */
  readonly shareImageUrl: string | null;
  /** Pending share data from login redirect */
  readonly hasPendingShare: boolean;
  /** Handle LINE share button click */
  readonly handleLineShare: () => Promise<void>;
  /** Handle Web Share button click */
  readonly handleWebShare: () => Promise<void>;
  /** Prepare share image (called on game end) */
  readonly prepareShareImage: (
    containerRef: RefObject<HTMLDivElement | null>,
    board: Board,
    blackCount: number,
    whiteCount: number,
    winner: Player | 'draw'
  ) => Promise<void>;
}

/**
 * Check if Web Share API is available
 */
function checkWebShareAvailability(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return typeof navigator.share === 'function';
}

/**
 * useShare hook for share functionality
 */
export function useShare(): UseShareReturn {
  // State
  const [isShareReady, setIsShareReady] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareImageBlob, setShareImageBlob] = useState<Blob | null>(null);
  const [hasPendingShare, setHasPendingShare] = useState(false);
  const [canWebShare] = useState(() => checkWebShareAvailability());

  // Store game result for share operations
  const gameResultRef = useRef<{
    board: Board;
    blackCount: number;
    whiteCount: number;
    winner: Player | 'draw';
  } | null>(null);

  // Dependencies
  const { isLoggedIn, login } = useLiff();
  const { addMessage } = useMessageQueue();

  /**
   * Load pending share data on mount
   */
  useEffect(() => {
    const pendingData = pendingShareStorage.load();

    if (pendingData) {
      if (pendingShareStorage.isExpired(pendingData)) {
        // Clear expired data
        pendingShareStorage.clear();
        setHasPendingShare(false);
      } else {
        // Valid pending data exists
        setHasPendingShare(true);
      }
    }
  }, []);

  /**
   * Show success toast notification
   */
  const showSuccessToast = useCallback(() => {
    addMessage({
      type: 'info',
      text: 'シェアしました！',
      timeout: TOAST_TIMEOUT_MS,
    });
  }, [addMessage]);

  /**
   * Show error toast notification
   */
  const showErrorToast = useCallback(() => {
    addMessage({
      type: 'warning',
      text: 'シェアに失敗しました',
      timeout: TOAST_TIMEOUT_MS,
    });
  }, [addMessage]);

  /**
   * Show image preparation error toast
   */
  const showImageErrorToast = useCallback(() => {
    addMessage({
      type: 'warning',
      text: '画像の準備に失敗しました',
      timeout: TOAST_TIMEOUT_MS,
    });
  }, [addMessage]);

  /**
   * Clear pending share data
   */
  const clearPendingShare = useCallback(() => {
    pendingShareStorage.clear();
    setHasPendingShare(false);
  }, []);

  /**
   * Prepare share image for sharing
   */
  const prepareShareImage = useCallback(
    async (
      containerRef: RefObject<HTMLDivElement | null>,
      board: Board,
      blackCount: number,
      whiteCount: number,
      winner: Player | 'draw'
    ): Promise<void> => {
      // Store game result for later use
      gameResultRef.current = { board, blackCount, whiteCount, winner };

      const result = await prepareShareImageService(containerRef);

      if (result.success) {
        setShareImageUrl(result.data.imageUrl);
        setShareImageBlob(result.data.imageBlob);
        setIsShareReady(true);
      } else {
        showImageErrorToast();
        setIsShareReady(false);
      }
    },
    [showImageErrorToast]
  );

  /**
   * Handle LINE share button click
   */
  const handleLineShare = useCallback(async (): Promise<void> => {
    // Prevent multiple concurrent shares
    if (isSharing) {
      return;
    }

    // Check if image is ready
    if (!isShareReady || !shareImageUrl || !gameResultRef.current) {
      return;
    }

    // Check login state
    if (!isLoggedIn) {
      // Save state for redirect continuation
      const { board, blackCount, whiteCount, winner } = gameResultRef.current;
      pendingShareStorage.save({
        board: board as unknown as Parameters<
          typeof pendingShareStorage.save
        >[0]['board'],
        blackCount,
        whiteCount,
        winner,
      });

      // Redirect to login
      login();
      return;
    }

    // Start share operation
    setIsSharing(true);

    try {
      const { blackCount, whiteCount, winner } = gameResultRef.current;
      const result = await shareViaLine(
        shareImageUrl,
        { winner, blackCount, whiteCount },
        APP_URL
      );

      if (result.success) {
        showSuccessToast();
        clearPendingShare();
      } else if (result.error.type === 'cancelled') {
        // User cancelled - no toast, but clear pending share
        clearPendingShare();
      } else {
        showErrorToast();
      }
    } finally {
      setIsSharing(false);
    }
  }, [
    isSharing,
    isShareReady,
    shareImageUrl,
    isLoggedIn,
    login,
    showSuccessToast,
    showErrorToast,
    clearPendingShare,
  ]);

  /**
   * Handle Web Share button click
   */
  const handleWebShare = useCallback(async (): Promise<void> => {
    // Prevent multiple concurrent shares
    if (isSharing) {
      return;
    }

    // Check if image is ready
    if (!isShareReady || !shareImageBlob || !gameResultRef.current) {
      return;
    }

    // Start share operation
    setIsSharing(true);

    try {
      const { blackCount, whiteCount, winner } = gameResultRef.current;
      const result = await shareViaWebShare(
        shareImageBlob,
        { winner, blackCount, whiteCount },
        APP_URL
      );

      if (result.success) {
        showSuccessToast();
        clearPendingShare();
      } else if (result.error.type === 'cancelled') {
        // User cancelled - no toast, but clear pending share
        clearPendingShare();
      } else {
        showErrorToast();
      }
    } finally {
      setIsSharing(false);
    }
  }, [
    isSharing,
    isShareReady,
    shareImageBlob,
    showSuccessToast,
    showErrorToast,
    clearPendingShare,
  ]);

  return {
    isShareReady,
    isSharing,
    canWebShare,
    shareImageUrl,
    hasPendingShare,
    handleLineShare,
    handleWebShare,
    prepareShareImage,
  };
}
