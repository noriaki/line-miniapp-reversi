/**
 * Game Error Handler Hook Tests

 * Test-Driven Development: Tests written BEFORE implementation
 */

import { renderHook, act } from '@testing-library/react';
import { useGameErrorHandler } from '../useGameErrorHandler';

describe('useGameErrorHandler', () => {
  describe('RED: Invalid move feedback', () => {
    it('should set invalid move position when invalid move is attempted', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.handleInvalidMove({ row: 2, col: 3 }, 'occupied');
      });

      expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });
      expect(result.current.invalidMoveReason).toBe('occupied');
    });

    it('should clear invalid move feedback after timeout', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.handleInvalidMove({ row: 2, col: 3 }, 'no_flips');
      });

      expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });

      // Fast-forward time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.invalidMovePosition).toBeNull();
      expect(result.current.invalidMoveReason).toBeNull();

      jest.useRealTimers();
    });

    it('should provide user-friendly error message for each reason', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.handleInvalidMove({ row: 0, col: 0 }, 'occupied');
      });
      expect(result.current.getErrorMessage()).toBe(
        'そのマスには既に石が置かれています'
      );

      act(() => {
        result.current.handleInvalidMove({ row: 0, col: 0 }, 'no_flips');
      });
      expect(result.current.getErrorMessage()).toBe(
        'そのマスに置いても石を反転できません'
      );

      act(() => {
        result.current.handleInvalidMove({ row: 0, col: 0 }, 'out_of_bounds');
      });
      expect(result.current.getErrorMessage()).toBe('無効な位置です');
    });
  });

  describe('RED: Pass notification', () => {
    it('should set pass notification when notifyPass is called', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyPass('black');
      });

      expect(result.current.passNotification).toBe('black');
      expect(result.current.getPassMessage()).toBe(
        '有効な手がありません。パスしました。'
      );
    });

    it('should clear pass notification after 5 seconds (3.2)', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyPass('white');
      });

      expect(result.current.passNotification).toBe('white');

      // Should still be visible after 4 seconds
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      expect(result.current.passNotification).toBe('white');

      // Should be cleared after 5 seconds
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(result.current.passNotification).toBeNull();

      jest.useRealTimers();
    });

    it('should cancel previous timer when new notifyPass is called', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useGameErrorHandler());

      // First notification
      act(() => {
        result.current.notifyPass('black');
      });
      expect(result.current.passNotification).toBe('black');

      // Advance time by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Second notification (should cancel first timer)
      act(() => {
        result.current.notifyPass('white');
      });
      expect(result.current.passNotification).toBe('white');

      // Advance time by 3 more seconds (6 seconds total from first notification)
      // First timer should have been cancelled, so notification should still be 'white'
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(result.current.passNotification).toBe('white');

      // Advance remaining 2 seconds to complete 5 seconds from second notification
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(result.current.passNotification).toBeNull();

      jest.useRealTimers();
    });

    it('should cleanup timer on unmount', () => {
      jest.useFakeTimers();
      const { result, unmount } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyPass('black');
      });

      expect(result.current.passNotification).toBe('black');

      // Unmount before timer completes
      unmount();

      // Advance time - timer should not fire after unmount
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // No error should occur (timer was cleaned up)
      jest.useRealTimers();
    });
  });

  describe('RED: Game state inconsistency detection', () => {
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
});
