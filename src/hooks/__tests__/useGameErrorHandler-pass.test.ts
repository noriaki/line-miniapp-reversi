/**
 * Game Error Handler Hook Tests - Phase 2 Migration
 * Pass notification functionality moved to useMessageQueue
 * This file now tests that pass notification is removed from useGameErrorHandler
 */

import { renderHook } from '@testing-library/react';
import { useGameErrorHandler } from '../useGameErrorHandler';

describe('useGameErrorHandler - Phase 2 Migration', () => {
  describe('Pass notification removal verification', () => {
    it('should not have passNotification property (moved to useMessageQueue)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - passNotification should not exist after Phase 2 migration
      expect(result.current.passNotification).toBeUndefined();
    });

    it('should not have notifyPass method (moved to useMessageQueue)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - notifyPass should not exist after Phase 2 migration
      expect(result.current.notifyPass).toBeUndefined();
    });

    it('should not have getPassMessage method (moved to useMessageQueue)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - getPassMessage should not exist after Phase 2 migration
      expect(result.current.getPassMessage).toBeUndefined();
    });

    it('should not have skipNotification property (removed)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - skipNotification should not exist
      expect(result.current.skipNotification).toBeUndefined();
    });

    it('should not have notifyTurnSkip method (removed)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - notifyTurnSkip should not exist
      expect(result.current.notifyTurnSkip).toBeUndefined();
    });

    it('should not have getSkipMessage method (removed)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - getSkipMessage should not exist
      expect(result.current.getSkipMessage).toBeUndefined();
    });

    it('should only provide hasInconsistency functionality', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // Only hasInconsistency-related methods should exist
      expect(result.current.hasInconsistency).toBeDefined();
      expect(result.current.inconsistencyReason).toBeDefined();
      expect(result.current.detectInconsistency).toBeDefined();
      expect(result.current.clearInconsistency).toBeDefined();
      expect(result.current.getInconsistencyMessage).toBeDefined();
    });
  });
});
