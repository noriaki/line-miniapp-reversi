/**
 * Game Inconsistency Detector Hook
 * Phase 3: Separated inconsistency detection from useGameErrorHandler
 *
 * Responsible for detecting and managing game state inconsistencies
 * such as invalid board size or corrupted state.
 */

'use client';

import { useState, useCallback } from 'react';

type InconsistencyReason = 'invalid_board_size' | 'corrupted_state';

interface UseGameInconsistencyDetectorReturn {
  // Game state inconsistency
  hasInconsistency: boolean;
  checkInconsistency: (reason: InconsistencyReason) => void;
  clearInconsistency: () => void;
  getInconsistencyMessage: () => string | null;
}

/**
 * Custom hook for game state inconsistency detection
 * Detects issues with game state that require user attention
 */
export function useGameInconsistencyDetector(): UseGameInconsistencyDetectorReturn {
  // Game state inconsistency state
  const [hasInconsistency, setHasInconsistency] = useState<boolean>(false);

  /**
   * Check for game state inconsistency
   */
  const checkInconsistency = useCallback((_reason: InconsistencyReason) => {
    setHasInconsistency(true);
  }, []);

  /**
   * Clear inconsistency flag
   */
  const clearInconsistency = useCallback(() => {
    setHasInconsistency(false);
  }, []);

  /**
   * Get inconsistency message
   */
  const getInconsistencyMessage = useCallback((): string | null => {
    if (!hasInconsistency) {
      return null;
    }

    return 'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。';
  }, [hasInconsistency]);

  return {
    hasInconsistency,
    checkInconsistency,
    clearInconsistency,
    getInconsistencyMessage,
  };
}
