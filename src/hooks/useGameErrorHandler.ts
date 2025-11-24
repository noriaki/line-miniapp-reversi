/**
 * Game Error Handler Hook
 * Phase 2: Reduced to hasInconsistency detection only
 * handleInvalidMove and notifyPass functionality moved to useMessageQueue
 */

'use client';

import { useState, useCallback } from 'react';

type InconsistencyReason = 'invalid_board_size' | 'corrupted_state';

interface UseGameErrorHandlerReturn {
  // Game state inconsistency
  hasInconsistency: boolean;
  inconsistencyReason: InconsistencyReason | null;
  detectInconsistency: (reason: InconsistencyReason) => void;
  clearInconsistency: () => void;
  getInconsistencyMessage: () => string | null;
}

/**
 * Custom hook for game inconsistency detection
 * Phase 2: Only handles game state inconsistencies
 * Invalid move and pass notifications now handled by useMessageQueue
 */
export function useGameErrorHandler(): UseGameErrorHandlerReturn {
  // Game state inconsistency state
  const [hasInconsistency, setHasInconsistency] = useState<boolean>(false);
  const [inconsistencyReason, setInconsistencyReason] =
    useState<InconsistencyReason | null>(null);

  /**
   * Detect game state inconsistency
   */
  const detectInconsistency = useCallback((reason: InconsistencyReason) => {
    setHasInconsistency(true);
    setInconsistencyReason(reason);
  }, []);

  /**
   * Clear inconsistency flag
   */
  const clearInconsistency = useCallback(() => {
    setHasInconsistency(false);
    setInconsistencyReason(null);
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
    inconsistencyReason,
    detectInconsistency,
    clearInconsistency,
    getInconsistencyMessage,
  };
}
