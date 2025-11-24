/**
 * Unit tests for useMessageQueue hook
 * Test coverage: message queue state management, timer control, rate limiting
 */

import { renderHook, act } from '@testing-library/react';
import type { Message } from '@/types';
import { useMessageQueue } from '../useMessageQueue';

// Mock timers
jest.useFakeTimers();

describe('useMessageQueue', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    // Reset console.warn mock
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Task 2.1: Message queue state management', () => {
    it('should initialize with null currentMessage', () => {
      const { result } = renderHook(() => useMessageQueue());

      expect(result.current.currentMessage).toBeNull();
    });

    it('should update currentMessage when addMessage is called', () => {
      const { result } = renderHook(() => useMessageQueue());

      const testMessage: Message = {
        type: 'info',
        text: 'Test message',
        timeout: 3000,
      };

      act(() => {
        result.current.addMessage(testMessage);
      });

      expect(result.current.currentMessage).toEqual(testMessage);
    });

    it('should handle null message state correctly', () => {
      const { result } = renderHook(() => useMessageQueue());

      // Initially null
      expect(result.current.currentMessage).toBeNull();

      // Add message
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'Test',
          timeout: 3000,
        });
      });

      expect(result.current.currentMessage).not.toBeNull();

      // Clear message
      act(() => {
        result.current.clearMessage();
      });

      expect(result.current.currentMessage).toBeNull();
    });

    it('should cleanup timer on unmount', () => {
      const { result, unmount } = renderHook(() => useMessageQueue());

      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'Test',
          timeout: 3000,
        });
      });

      // Message should be present
      expect(result.current.currentMessage).not.toBeNull();

      // Unmount component
      unmount();

      // Timer should be cleared (no errors should occur)
      // If cleanup wasn't working, advancing timers would cause issues
      act(() => {
        jest.advanceTimersByTime(3000);
      });
    });
  });

  describe('Task 2.2: Message addition and timer control', () => {
    it('should auto-clear message after custom timeout', () => {
      const { result } = renderHook(() => useMessageQueue());

      // Add message with 3 second timeout (pass notification)
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'パスしました',
          timeout: 3000,
        });
      });

      expect(result.current.currentMessage).not.toBeNull();

      // Advance time by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentMessage).toBeNull();
    });

    it('should support different timeout values for different message types', () => {
      const { result } = renderHook(() => useMessageQueue());

      // Add warning message with 2 second timeout (invalid move)
      act(() => {
        result.current.addMessage({
          type: 'warning',
          text: 'その手は置けません',
          timeout: 2000,
        });
      });

      expect(result.current.currentMessage?.type).toBe('warning');

      // Advance time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.currentMessage).toBeNull();

      // Add info message with 3 second timeout
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'パスしました',
          timeout: 3000,
        });
      });

      expect(result.current.currentMessage?.type).toBe('info');

      // 2 seconds should not clear it
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.currentMessage).not.toBeNull();

      // Additional 1 second should clear it
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.currentMessage).toBeNull();
    });

    it('should replace existing message when new message is added', () => {
      const { result } = renderHook(() => useMessageQueue());

      // Add first message
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'First message',
          timeout: 3000,
        });
      });

      expect(result.current.currentMessage?.text).toBe('First message');

      // Add second message before first timeout
      act(() => {
        result.current.addMessage({
          type: 'warning',
          text: 'Second message',
          timeout: 2000,
        });
      });

      expect(result.current.currentMessage?.text).toBe('Second message');
      expect(result.current.currentMessage?.type).toBe('warning');
    });

    it('should cancel previous timer when new message is added', () => {
      const { result } = renderHook(() => useMessageQueue());

      // Add first message with 3s timeout
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'First',
          timeout: 3000,
        });
      });

      // Add second message after 1s
      act(() => {
        jest.advanceTimersByTime(1000);
        result.current.addMessage({
          type: 'warning',
          text: 'Second',
          timeout: 2000,
        });
      });

      // First message's timer should be cancelled
      // After 2 more seconds (total 3s from start), first timer shouldn't fire
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Second message should be cleared (2s timeout)
      expect(result.current.currentMessage).toBeNull();
    });

    it('should handle clearMessage function correctly', () => {
      const { result } = renderHook(() => useMessageQueue());

      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'Test',
          timeout: 3000,
        });
      });

      expect(result.current.currentMessage).not.toBeNull();

      act(() => {
        result.current.clearMessage();
      });

      expect(result.current.currentMessage).toBeNull();
    });

    it('should validate empty text and skip adding message', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      const { result } = renderHook(() => useMessageQueue());

      act(() => {
        result.current.addMessage({
          type: 'info',
          text: '',
          timeout: 3000,
        });
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid message: text is empty'
      );
      expect(result.current.currentMessage).toBeNull();
    });

    it('should validate timeout is positive number', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      const { result } = renderHook(() => useMessageQueue());

      // Test zero timeout
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'Test',
          timeout: 0,
        });
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid message: timeout must be a positive number'
      );
      expect(result.current.currentMessage).toBeNull();

      // Test negative timeout
      act(() => {
        result.current.addMessage({
          type: 'warning',
          text: 'Test',
          timeout: -1000,
        });
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid message: timeout must be a positive number'
      );
      expect(result.current.currentMessage).toBeNull();
    });

    it('should use useCallback for function memoization', () => {
      const { result, rerender } = renderHook(() => useMessageQueue());

      const firstAddMessage = result.current.addMessage;
      const firstClearMessage = result.current.clearMessage;

      // Trigger re-render
      rerender();

      // Functions should be the same reference (memoized)
      expect(result.current.addMessage).toBe(firstAddMessage);
      expect(result.current.clearMessage).toBe(firstClearMessage);
    });
  });

  describe('Task 2.3: Message rate control', () => {
    it('should track last message time', () => {
      const { result } = renderHook(() => useMessageQueue());

      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'First',
          timeout: 3000,
        });
      });

      // Time should be tracked (verified by next test that checks interval)
      expect(result.current.currentMessage?.text).toBe('First');
    });

    it('should warn on high-frequency messages (< 100ms interval)', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      const { result } = renderHook(() => useMessageQueue());

      // First message
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'First',
          timeout: 3000,
        });
      });

      // No warning for first message
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('High-frequency message detected')
      );

      // Second message immediately (< 100ms)
      act(() => {
        // Advance by only 50ms
        jest.advanceTimersByTime(50);
        result.current.addMessage({
          type: 'warning',
          text: 'Second',
          timeout: 2000,
        });
      });

      // Should warn about high frequency
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('High-frequency message detected')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('minimum: 100ms')
      );
    });

    it('should not warn when interval is >= 100ms', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      const { result } = renderHook(() => useMessageQueue());

      // First message
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'First',
          timeout: 3000,
        });
      });

      // Second message after 100ms
      act(() => {
        jest.advanceTimersByTime(100);
        result.current.addMessage({
          type: 'warning',
          text: 'Second',
          timeout: 2000,
        });
      });

      // Should not warn
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('High-frequency message detected')
      );
    });

    it('should still process message even with high-frequency warning (latest message priority)', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      const { result } = renderHook(() => useMessageQueue());

      // First message
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'First',
          timeout: 3000,
        });
      });

      // Second message immediately
      act(() => {
        jest.advanceTimersByTime(50);
        result.current.addMessage({
          type: 'warning',
          text: 'Second',
          timeout: 2000,
        });
      });

      // Should warn but still process
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result.current.currentMessage?.text).toBe('Second');
      expect(result.current.currentMessage?.type).toBe('warning');
    });

    it('should use Date.now() for time tracking', () => {
      const dateNowSpy = jest.spyOn(Date, 'now');

      const { result } = renderHook(() => useMessageQueue());

      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'Test',
          timeout: 3000,
        });
      });

      // Date.now() should be called for time tracking
      expect(dateNowSpy).toHaveBeenCalled();
    });

    it('should not apply debounce or throttle (immediate replacement strategy)', () => {
      const { result } = renderHook(() => useMessageQueue());

      // Add first message
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'First',
          timeout: 3000,
        });
      });

      expect(result.current.currentMessage?.text).toBe('First');

      // Add second message immediately (no debounce delay)
      act(() => {
        result.current.addMessage({
          type: 'warning',
          text: 'Second',
          timeout: 2000,
        });
      });

      // Should immediately replace (no debounce)
      expect(result.current.currentMessage?.text).toBe('Second');

      // Add third message immediately
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'Third',
          timeout: 3000,
        });
      });

      // Should immediately replace again
      expect(result.current.currentMessage?.text).toBe('Third');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle rapid message succession correctly', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      const { result } = renderHook(() => useMessageQueue());

      // Simulate rapid game events
      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'Message 1',
          timeout: 3000,
        });

        jest.advanceTimersByTime(50);

        result.current.addMessage({
          type: 'warning',
          text: 'Message 2',
          timeout: 2000,
        });

        jest.advanceTimersByTime(50);

        result.current.addMessage({
          type: 'info',
          text: 'Message 3',
          timeout: 3000,
        });
      });

      // Should warn about high frequency
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

      // Should show latest message
      expect(result.current.currentMessage?.text).toBe('Message 3');

      // Should clear after timeout
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.currentMessage).toBeNull();
    });

    it('should handle pass notification scenario (3s timeout)', () => {
      const { result } = renderHook(() => useMessageQueue());

      act(() => {
        result.current.addMessage({
          type: 'info',
          text: 'パスしました',
          timeout: 3000,
        });
      });

      expect(result.current.currentMessage?.text).toBe('パスしました');
      expect(result.current.currentMessage?.type).toBe('info');

      // Should not clear before 3s
      act(() => {
        jest.advanceTimersByTime(2999);
      });
      expect(result.current.currentMessage).not.toBeNull();

      // Should clear at 3s
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.currentMessage).toBeNull();
    });

    it('should handle invalid move warning scenario (2s timeout)', () => {
      const { result } = renderHook(() => useMessageQueue());

      act(() => {
        result.current.addMessage({
          type: 'warning',
          text: 'その手は置けません',
          timeout: 2000,
        });
      });

      expect(result.current.currentMessage?.text).toBe('その手は置けません');
      expect(result.current.currentMessage?.type).toBe('warning');

      // Should not clear before 2s
      act(() => {
        jest.advanceTimersByTime(1999);
      });
      expect(result.current.currentMessage).not.toBeNull();

      // Should clear at 2s
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.currentMessage).toBeNull();
    });
  });
});
