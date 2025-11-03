/**
 * Unit tests for AI Engine Service
 * Tests high-level AI API
 */

import { AIEngine } from '../ai-engine';
import type { Board } from '../../game/types';

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  postMessage(): void {
    // Simulate async response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(
          new MessageEvent('message', {
            data: {
              type: 'success',
              payload: {
                move: { row: 2, col: 3 },
                calculationTimeMs: 500,
              },
            },
          })
        );
      }
    }, 10);
  }

  terminate(): void {
    // Mock terminate
  }

  addEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.onmessage = listener as (event: MessageEvent) => void;
    } else if (type === 'error') {
      this.onerror = listener as (event: ErrorEvent) => void;
    }
  }

  removeEventListener(type: string): void {
    if (type === 'message') {
      this.onmessage = null;
    } else if (type === 'error') {
      this.onerror = null;
    }
  }
}

// Type-safe global object
const globalObj = global as typeof global & {
  Worker?: typeof Worker;
};

// Mock Worker constructor
globalObj.Worker = MockWorker as unknown as typeof Worker;

describe('AIEngine', () => {
  let aiEngine: AIEngine;
  const emptyBoard: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  beforeEach(() => {
    aiEngine = new AIEngine();
  });

  afterEach(() => {
    aiEngine.dispose();
  });

  describe('constructor', () => {
    it('should accept custom worker path', () => {
      const customPath = '/custom/worker.js';
      const customEngine = new AIEngine(customPath);

      expect(customEngine).toBeDefined();
      expect(customEngine.isReady()).toBe(false);

      customEngine.dispose();
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const result = await aiEngine.initialize();

      expect(result.success).toBe(true);
      expect(aiEngine.isReady()).toBe(true);
    });

    it('should handle Worker creation failure', async () => {
      // Create engine with invalid worker path
      const brokenEngine = new AIEngine();

      // Mock Worker constructor to throw
      const originalWorker = (global as { Worker: typeof Worker }).Worker;
      (global as { Worker: typeof Worker }).Worker = jest.fn(() => {
        throw new Error('Worker script not found');
      }) as unknown as typeof Worker;

      const result = await brokenEngine.initialize();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('initialization_error');
        expect(result.error.reason).toBe('wasm_load_failed');
        expect(result.error.message).toContain('Worker');
      }

      // Restore original Worker
      (global as { Worker: typeof Worker }).Worker = originalWorker;
      brokenEngine.dispose();
    });
  });

  describe('calculateMove', () => {
    it('should calculate AI move successfully', async () => {
      await aiEngine.initialize();

      const result = await aiEngine.calculateMove(emptyBoard, 'white');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeDefined();
        expect(result.value.row).toBeGreaterThanOrEqual(0);
        expect(result.value.row).toBeLessThan(8);
        expect(result.value.col).toBeGreaterThanOrEqual(0);
        expect(result.value.col).toBeLessThan(8);
      }
    }, 10000);

    it('should return error when not initialized', async () => {
      const result = await aiEngine.calculateMove(emptyBoard, 'white');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('ai_calculation_error');
        expect(result.error.reason).toBe('not_initialized');
      }
    });

    it('should handle timeout correctly', async () => {
      await aiEngine.initialize();

      // Mock worker that never responds
      const slowWorker = new MockWorker();
      slowWorker.postMessage = jest.fn(); // Does not call onmessage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (aiEngine as any).worker = slowWorker;

      const result = await aiEngine.calculateMove(emptyBoard, 'white', 100);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('ai_calculation_error');
        expect(result.error.reason).toBe('timeout');
      }
    }, 10000);

    it('should handle worker error response', async () => {
      await aiEngine.initialize();

      // Mock worker that returns error
      const errorWorker = new MockWorker();
      errorWorker.postMessage = function () {
        setTimeout(() => {
          if (this.onmessage) {
            this.onmessage(
              new MessageEvent('message', {
                data: {
                  type: 'error',
                  payload: {
                    error: 'WASM calculation failed',
                  },
                },
              })
            );
          }
        }, 10);
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (aiEngine as any).worker = errorWorker;

      const result = await aiEngine.calculateMove(emptyBoard, 'white');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('ai_calculation_error');
        expect(result.error.reason).toBe('wasm_error');
        expect(result.error.message).toContain('WASM calculation failed');
      }
    });

    it('should handle worker being null after initialization', async () => {
      await aiEngine.initialize();

      // Manually set worker to null and initialized to false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (aiEngine as any).worker = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (aiEngine as any).initialized = false;

      const result = await aiEngine.calculateMove(emptyBoard, 'white');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('ai_calculation_error');
        expect(result.error.reason).toBe('not_initialized');
        expect(result.error.message).toContain('initialize');
      }
    });
  });

  describe('isReady', () => {
    it('should return false before initialization', () => {
      expect(aiEngine.isReady()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await aiEngine.initialize();
      expect(aiEngine.isReady()).toBe(true);
    });

    it('should return false after disposal', async () => {
      await aiEngine.initialize();
      aiEngine.dispose();
      expect(aiEngine.isReady()).toBe(false);
    });
  });

  describe('dispose', () => {
    it('should clean up worker resources', async () => {
      await aiEngine.initialize();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worker = (aiEngine as any).worker;
      const terminateSpy = jest.spyOn(worker, 'terminate');

      aiEngine.dispose();

      expect(terminateSpy).toHaveBeenCalled();
      expect(aiEngine.isReady()).toBe(false);
    });

    it('should be safe to call multiple times', async () => {
      await aiEngine.initialize();

      expect(() => {
        aiEngine.dispose();
        aiEngine.dispose();
      }).not.toThrow();
    });
  });
});
