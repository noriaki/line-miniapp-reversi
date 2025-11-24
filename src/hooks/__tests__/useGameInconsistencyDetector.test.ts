/**
 * Game Inconsistency Detector Hook Tests
 * Phase 3: Separated inconsistency detection from useGameErrorHandler
 */

import { renderHook, act } from '@testing-library/react';
import { useGameInconsistencyDetector } from '../useGameInconsistencyDetector';

describe('useGameInconsistencyDetector', () => {
  describe('Inconsistency detection', () => {
    it('should initially have no inconsistency', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      expect(result.current.hasInconsistency).toBe(false);
    });

    it('should detect invalid board size inconsistency', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      act(() => {
        result.current.checkInconsistency('invalid_board_size');
      });

      expect(result.current.hasInconsistency).toBe(true);
    });

    it('should detect corrupted state inconsistency', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      act(() => {
        result.current.checkInconsistency('corrupted_state');
      });

      expect(result.current.hasInconsistency).toBe(true);
    });
  });

  describe('Inconsistency message', () => {
    it('should return null when no inconsistency', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      expect(result.current.getInconsistencyMessage()).toBeNull();
    });

    it('should provide appropriate message when inconsistency detected', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      act(() => {
        result.current.checkInconsistency('invalid_board_size');
      });

      expect(result.current.getInconsistencyMessage()).toBe(
        'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。'
      );
    });

    it('should provide same message for any inconsistency type', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      act(() => {
        result.current.checkInconsistency('corrupted_state');
      });

      expect(result.current.getInconsistencyMessage()).toBe(
        'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。'
      );
    });
  });

  describe('Clear inconsistency', () => {
    it('should clear inconsistency flag', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      act(() => {
        result.current.checkInconsistency('invalid_board_size');
      });

      expect(result.current.hasInconsistency).toBe(true);

      act(() => {
        result.current.clearInconsistency();
      });

      expect(result.current.hasInconsistency).toBe(false);
    });

    it('should return null message after clearing', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      act(() => {
        result.current.checkInconsistency('invalid_board_size');
      });

      act(() => {
        result.current.clearInconsistency();
      });

      expect(result.current.getInconsistencyMessage()).toBeNull();
    });
  });

  describe('Interface contract', () => {
    it('should export only inconsistency detection functionality', () => {
      const { result } = renderHook(() => useGameInconsistencyDetector());

      // Should have inconsistency detection functionality
      expect(result.current.hasInconsistency).toBeDefined();
      expect(result.current.checkInconsistency).toBeDefined();
      expect(result.current.clearInconsistency).toBeDefined();
      expect(result.current.getInconsistencyMessage).toBeDefined();

      // Should NOT have message queue functionality
      expect((result.current as any).addMessage).toBeUndefined();
      expect((result.current as any).currentMessage).toBeUndefined();
    });
  });
});
