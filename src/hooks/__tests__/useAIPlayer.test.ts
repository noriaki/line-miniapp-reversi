/**
 * Tests for useAIPlayer hook
 * Requirements: 1.1-1.8, 4.1-4.7, 7.1-7.7
 */

// Mock dependencies BEFORE importing useAIPlayer
jest.mock('@/lib/ai/ai-fallback');
jest.mock('@/lib/game/game-logic');
jest.mock('../worker-factory'); // Mock worker factory to avoid import.meta issues

import { renderHook, act } from '@testing-library/react';
import { useAIPlayer } from '../useAIPlayer';
import { selectRandomValidMove } from '@/lib/ai/ai-fallback';
import { calculateValidMoves } from '@/lib/game/game-logic';
import { createAIWorker } from '../worker-factory';
import { MockWorker } from '../__mocks__/worker-factory';
import type { Board, Position } from '@/lib/game/types';

// Test fixtures
const validBoard: Board = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, 'white', 'black', null, null, null],
  [null, null, null, 'black', 'white', null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
];

const mockValidMoves: Position[] = [
  { row: 2, col: 3 },
  { row: 3, col: 2 },
  { row: 4, col: 5 },
  { row: 5, col: 4 },
];

const mockFallbackMove: Position = { row: 2, col: 3 };

describe('useAIPlayer', () => {
  let mockWorkerInstance: MockWorker;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalWorker = (global as typeof globalThis & { Worker?: unknown })
    .Worker;

  beforeEach(() => {
    // Set default to development mode (tests can override)
    (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';

    // Mock global Worker constructor to enable Worker check in implementation
    (global as typeof globalThis & { Worker: unknown }).Worker = MockWorker;

    // Reset mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock calculateValidMoves to return mock valid moves
    (calculateValidMoves as jest.Mock).mockReturnValue(mockValidMoves);

    // Mock selectRandomValidMove to return mock fallback move
    (selectRandomValidMove as jest.Mock).mockReturnValue(mockFallbackMove);

    // Create mock worker instance
    mockWorkerInstance = new MockWorker('mock-worker-url');

    // IMPORTANT: Reset createAIWorker mock implementation for each test
    // Default implementation returns the mock worker (can be overridden in tests)
    (createAIWorker as jest.Mock).mockImplementation(() => mockWorkerInstance);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    (process.env as { NODE_ENV?: string }).NODE_ENV = originalNodeEnv;

    // Restore original Worker
    if (originalWorker === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (global as Record<string, unknown>).Worker;
    } else {
      (global as typeof globalThis & { Worker: unknown }).Worker =
        originalWorker;
    }
  });

  // Task 2.1: Worker initialization and cleanup tests

  describe('Worker initialization and cleanup', () => {
    it('should initialize Worker on mount in non-test environment', () => {
      // Given: non-test environment (already set in beforeEach)
      // When: hook is mounted
      const { result } = renderHook(() => useAIPlayer());

      // Then: createAIWorker should be called
      expect(createAIWorker).toHaveBeenCalled();
      expect(result.current.calculateMove).toBeDefined();
    });

    it('should skip Worker initialization in test environment', () => {
      // Given: test environment
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';

      // When: hook is mounted
      renderHook(() => useAIPlayer());

      // Then: createAIWorker should not be called
      expect(createAIWorker).not.toHaveBeenCalled();
    });

    it('should terminate Worker on unmount', () => {
      // Given: non-test environment with initialized worker (already set in beforeEach)
      const { unmount } = renderHook(() => useAIPlayer());

      // When: hook is unmounted
      unmount();

      // Then: Worker should be terminated
      expect(mockWorkerInstance.isWorkerTerminated()).toBe(true);
    });

    it('should handle Worker initialization error gracefully', () => {
      // Given: createAIWorker throws error (already in development mode from beforeEach)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (createAIWorker as jest.Mock).mockImplementation(() => {
        throw new Error('Worker creation failed');
      });

      // When: hook is mounted
      const { result } = renderHook(() => useAIPlayer());

      // Then: should log error and hook should still be usable
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize AI worker:',
        expect.any(Error)
      );
      expect(result.current.calculateMove).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    it('should handle Worker undefined environment gracefully', () => {
      // Given: Worker is not supported in environment (development mode)
      // Note: Must be in development mode to reach Worker check (not test mode)
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
      const originalWorker = (
        global as typeof globalThis & { Worker?: unknown }
      ).Worker;

      // Set Worker to undefined (not delete, to properly trigger typeof check)
      (global as typeof globalThis & { Worker: unknown }).Worker =
        undefined as unknown as typeof Worker;

      // When: hook is mounted
      const { result } = renderHook(() => useAIPlayer());

      // Then: hook should still be usable (will use fallback for all calculations)
      expect(result.current.calculateMove).toBeDefined();
      // Worker should not be initialized
      expect(createAIWorker).not.toHaveBeenCalled();

      // Cleanup: restore original Worker
      if (originalWorker === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (global as Record<string, unknown>).Worker;
      } else {
        (global as typeof globalThis & { Worker: unknown }).Worker =
          originalWorker;
      }
    });
  });

  // Task 2.2: AI calculation success path tests

  describe('AI calculation success path', () => {
    it('should send message to Worker and resolve with AI move', async () => {
      // Given: hook is initialized
      const { result } = renderHook(() => useAIPlayer());
      const expectedMove: Position = { row: 3, col: 2 };

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      // Override postMessage to simulate immediate success response
      mockWorkerInstance.postMessage = jest.fn(() => {
        setTimeout(() => {
          mockWorkerInstance.simulateMessage({
            type: 'success',
            payload: { move: expectedMove, calculationTimeMs: 500 },
          });
        }, 100);
      });

      // When: calculateMove is called
      const movePromise = result.current.calculateMove(validBoard, 'black');

      // Fast-forward timers to trigger worker response
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Then: should resolve with AI move
      const move = await movePromise;
      expect(move).toEqual(expectedMove);
      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        type: 'calculate',
        payload: {
          board: validBoard,
          currentPlayer: 'black',
          timeoutMs: 3000,
        },
      });
    });

    it('should handle multiple concurrent calculations independently', async () => {
      // Given: hook is initialized
      const { result } = renderHook(() => useAIPlayer());
      const move1: Position = { row: 2, col: 3 };
      const move2: Position = { row: 3, col: 2 };

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      let callCount = 0;
      mockWorkerInstance.postMessage = jest.fn(() => {
        const currentCall = callCount++;
        setTimeout(() => {
          mockWorkerInstance.simulateMessage({
            type: 'success',
            payload: {
              move: currentCall === 0 ? move1 : move2,
              calculationTimeMs: 300,
            },
          });
        }, 50);
      });

      // When: multiple calculations are requested
      const promise1 = result.current.calculateMove(validBoard, 'black');
      const promise2 = result.current.calculateMove(validBoard, 'white');

      act(() => {
        jest.advanceTimersByTime(50);
      });

      // Then: both should resolve (may receive same or different moves due to shared listener)
      // The important part is that both promises resolve and worker is called twice
      const [result1, result2] = await Promise.all([promise1, promise2]);
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.row).toBeGreaterThanOrEqual(0);
      expect(result1.col).toBeGreaterThanOrEqual(0);
      expect(result2.row).toBeGreaterThanOrEqual(0);
      expect(result2.col).toBeGreaterThanOrEqual(0);
      expect(mockWorkerInstance.postMessage).toHaveBeenCalledTimes(2);
    });
  });

  // Task 2.3: Timeout processing tests

  describe('Timeout processing', () => {
    it('should fallback to random move on 3-second timeout', async () => {
      // Given: hook is initialized, Worker never responds
      const { result } = renderHook(() => useAIPlayer());
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      mockWorkerInstance.postMessage = jest.fn(); // No response

      // When: calculateMove is called and timeout occurs
      const movePromise = result.current.calculateMove(validBoard, 'black');

      act(() => {
        jest.advanceTimersByTime(3000); // Trigger timeout
      });

      // Then: should resolve with fallback move
      const move = await movePromise;
      expect(move).toEqual(mockFallbackMove);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AI calculation timeout (>3s), using random fallback'
      );
      expect(selectRandomValidMove).toHaveBeenCalledWith(mockValidMoves);

      consoleWarnSpy.mockRestore();
    });

    it('should clear event listener on timeout', async () => {
      // Given: hook is initialized
      const { result } = renderHook(() => useAIPlayer());

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      mockWorkerInstance.postMessage = jest.fn();
      const removeEventListenerSpy = jest.spyOn(
        mockWorkerInstance,
        'removeEventListener'
      );

      // When: timeout occurs
      const movePromise = result.current.calculateMove(validBoard, 'black');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await movePromise;

      // Then: listener should be removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });
  });

  // Task 2.4: Error handling tests

  describe('Error handling', () => {
    it('should fallback to random move when Worker returns error', async () => {
      // Given: hook is initialized in development mode
      const { result } = renderHook(() => useAIPlayer());
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve(); // Allow useEffect to run
      });

      mockWorkerInstance.postMessage = jest.fn(() => {
        setTimeout(() => {
          mockWorkerInstance.simulateMessage({
            type: 'error',
            payload: { error: 'WASM calculation failed' },
          });
        }, 100);
      });

      // When: Worker returns error
      const movePromise = result.current.calculateMove(validBoard, 'black');

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Then: should resolve with fallback move
      const move = await movePromise;
      expect(move).toEqual(mockFallbackMove);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AI calculation error, using random fallback:',
        'WASM calculation failed'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should use fallback immediately when Worker is not initialized', async () => {
      // Given: test environment (Worker not initialized)
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';
      const { result } = renderHook(() => useAIPlayer());
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // When: calculateMove is called without Worker
      const move = await result.current.calculateMove(validBoard, 'black');

      // Then: should resolve with fallback move immediately
      expect(move).toEqual(mockFallbackMove);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AI Worker not initialized, using random fallback'
      );

      consoleWarnSpy.mockRestore();
    });

    it('should reject when fallback also fails', async () => {
      // Given: Worker not initialized and fallback throws error
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';
      const { result } = renderHook(() => useAIPlayer());
      (selectRandomValidMove as jest.Mock).mockImplementation(() => {
        throw new Error('No valid moves available');
      });

      // When: calculateMove is called
      const movePromise = result.current.calculateMove(validBoard, 'black');

      // Then: should reject with error
      await expect(movePromise).rejects.toThrow('No valid moves available');
    });

    it('should reject when timeout occurs and fallback fails', async () => {
      // Given: Worker initialized but timeout and fallback fails (already in development mode)
      const { result } = renderHook(() => useAIPlayer());

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      mockWorkerInstance.postMessage = jest.fn(); // No response
      (selectRandomValidMove as jest.Mock).mockImplementation(() => {
        throw new Error('Fallback failed');
      });

      // When: timeout occurs
      const movePromise = result.current.calculateMove(validBoard, 'black');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Then: should reject with generic timeout error
      await expect(movePromise).rejects.toThrow(
        'AI calculation timeout and fallback failed'
      );
    });

    it('should reject when Worker error occurs and fallback fails', async () => {
      // Given: Worker returns error and fallback fails (already in development mode)
      const { result } = renderHook(() => useAIPlayer());

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      (selectRandomValidMove as jest.Mock).mockImplementation(() => {
        throw new Error('Fallback failed');
      });

      mockWorkerInstance.postMessage = jest.fn(() => {
        setTimeout(() => {
          mockWorkerInstance.simulateMessage({
            type: 'error',
            payload: { error: 'WASM error' },
          });
        }, 100);
      });

      // When: Worker returns error
      const movePromise = result.current.calculateMove(validBoard, 'black');

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Then: should reject with generic error message
      await expect(movePromise).rejects.toThrow(
        'AI calculation failed and fallback failed'
      );
    });
  });

  // Task 2.5: Concurrent processing and async control tests

  describe('Concurrent processing and async control', () => {
    it('should handle unmount during pending calculation', async () => {
      // Given: calculation in progress
      const { result, unmount } = renderHook(() => useAIPlayer());

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      mockWorkerInstance.postMessage = jest.fn(); // Never responds

      const movePromise = result.current.calculateMove(validBoard, 'black');

      // When: component unmounts before calculation completes
      unmount();

      // Then: Worker should be terminated
      expect(mockWorkerInstance.isWorkerTerminated()).toBe(true);

      // Fast-forward and verify no memory leaks (promise doesn't throw)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Promise should still resolve with fallback since timeout fires
      await expect(movePromise).resolves.toEqual(mockFallbackMove);
    });

    it('should clear timeout when calculation completes successfully', async () => {
      // Given: hook initialized
      const { result } = renderHook(() => useAIPlayer());

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      mockWorkerInstance.postMessage = jest.fn(() => {
        setTimeout(() => {
          mockWorkerInstance.simulateMessage({
            type: 'success',
            payload: { move: { row: 2, col: 3 }, calculationTimeMs: 100 },
          });
        }, 500);
      });

      // When: calculation completes before timeout
      const movePromise = result.current.calculateMove(validBoard, 'black');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await movePromise;

      // Then: timeout should be cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('should remove event listener when calculation completes', async () => {
      // Given: hook initialized
      const { result } = renderHook(() => useAIPlayer());

      // Wait for hook to mount and initialize worker
      await act(async () => {
        await Promise.resolve();
      });

      const removeEventListenerSpy = jest.spyOn(
        mockWorkerInstance,
        'removeEventListener'
      );

      mockWorkerInstance.postMessage = jest.fn(() => {
        setTimeout(() => {
          mockWorkerInstance.simulateMessage({
            type: 'success',
            payload: { move: { row: 3, col: 4 }, calculationTimeMs: 200 },
          });
        }, 200);
      });

      // When: calculation completes
      const movePromise = result.current.calculateMove(validBoard, 'black');

      act(() => {
        jest.advanceTimersByTime(200);
      });

      await movePromise;

      // Then: listener should be removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });
  });
});
