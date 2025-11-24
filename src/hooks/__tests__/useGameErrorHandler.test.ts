/**
 * Game Error Handler Hook Tests
 * Phase 2: Tests for hasInconsistency-only functionality
 * handleInvalidMove and notifyPass tests removed (moved to useMessageQueue)
 */

import { renderHook, act } from '@testing-library/react';
import { useGameErrorHandler } from '../useGameErrorHandler';

describe('useGameErrorHandler', () => {
  describe('Game state inconsistency detection', () => {
    it('should detect invalid board state', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.detectInconsistency('invalid_board_size');
      });

      expect(result.current.hasInconsistency).toBe(true);
      expect(result.current.inconsistencyReason).toBe('invalid_board_size');
    });

    it('should provide reset suggestion message', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.detectInconsistency('corrupted_state');
      });

      expect(result.current.getInconsistencyMessage()).toBe(
        'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。'
      );
    });

    it('should allow clearing inconsistency flag', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.detectInconsistency('invalid_board_size');
      });

      expect(result.current.hasInconsistency).toBe(true);

      act(() => {
        result.current.clearInconsistency();
      });

      expect(result.current.hasInconsistency).toBe(false);
      expect(result.current.inconsistencyReason).toBeNull();
    });
  });

  describe('Task 5.2: Phase 2 - Reduced Interface', () => {
    it('should only export hasInconsistency-related functionality', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // Should have hasInconsistency functionality
      expect(result.current.hasInconsistency).toBeDefined();
      expect(result.current.inconsistencyReason).toBeDefined();
      expect(result.current.detectInconsistency).toBeDefined();
      expect(result.current.clearInconsistency).toBeDefined();
      expect(result.current.getInconsistencyMessage).toBeDefined();

      // Should NOT have invalid move functionality (moved to useMessageQueue)
      expect((result.current as any).handleInvalidMove).toBeUndefined();
      expect((result.current as any).getErrorMessage).toBeUndefined();
      expect((result.current as any).invalidMovePosition).toBeUndefined();
      expect((result.current as any).invalidMoveReason).toBeUndefined();

      // Should NOT have pass notification functionality (moved to useMessageQueue)
      expect((result.current as any).notifyPass).toBeUndefined();
      expect((result.current as any).getPassMessage).toBeUndefined();
      expect((result.current as any).passNotification).toBeUndefined();
    });
  });
});
