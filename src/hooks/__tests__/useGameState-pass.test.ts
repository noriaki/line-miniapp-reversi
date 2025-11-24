/**
 * Game State Hook Tests - Pass Feature

 * Test-Driven Development: Comprehensive unit tests for pass counter
 */

import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';

describe('useGameState - Pass Feature', () => {
  describe('Pass counter state management', () => {
    it('should increment consecutivePassCount by 1', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.consecutivePassCount).toBe(0);

      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(1);
    });

    it('should reset consecutivePassCount to 0', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.incrementPassCount();
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(2);

      act(() => {
        result.current.resetPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should reset consecutivePassCount on game reset', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(1);

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.consecutivePassCount).toBe(0);
      expect(result.current.gameStatus.type).toBe('playing');
    });

    it('should maintain counter within 0-2 range', () => {
      const { result } = renderHook(() => useGameState());

      // Test multiple increments
      act(() => {
        result.current.incrementPassCount();
        result.current.incrementPassCount();
        result.current.incrementPassCount(); // Should cap at 2
      });

      expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);
      expect(result.current.consecutivePassCount).toBeGreaterThanOrEqual(0);
    });

    it('should not go below 0 after reset', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.resetPassCount();
        result.current.resetPassCount(); // Multiple resets
      });

      expect(result.current.consecutivePassCount).toBe(0);
    });
  });

  describe('Pass counter integration with game state', () => {
    it('should maintain pass count independently of player switches', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.incrementPassCount();
        result.current.switchPlayer();
      });

      expect(result.current.consecutivePassCount).toBe(1);
      expect(result.current.currentPlayer).toBe('white');
    });

    it('should maintain pass count when game status changes', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.incrementPassCount();
        result.current.updateGameStatus({ type: 'finished', winner: 'draw' });
      });

      expect(result.current.consecutivePassCount).toBe(1);
      expect(result.current.gameStatus.type).toBe('finished');
    });

    it('should reset all game state including pass count on resetGame', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.incrementPassCount();
        result.current.switchPlayer();
        result.current.setAIThinking(true);
        result.current.updateGameStatus({ type: 'finished', winner: 'black' });
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.consecutivePassCount).toBe(0);
      expect(result.current.currentPlayer).toBe('black');
      expect(result.current.isAIThinking).toBe(false);
      expect(result.current.gameStatus.type).toBe('playing');
    });
  });

  describe('Pass counter behavior under edge cases', () => {
    it('should handle rapid increment calls', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.incrementPassCount();
        }
      });

      expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);
    });

    it('should handle rapid reset calls', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.incrementPassCount();
      });

      act(() => {
        result.current.resetPassCount();
        result.current.resetPassCount();
        result.current.resetPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should handle increment-reset cycle', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.incrementPassCount();
        result.current.resetPassCount();
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(1);
    });
  });
});
