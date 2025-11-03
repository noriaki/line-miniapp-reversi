/**
 * AI Engine Service
 * High-level API for AI move calculation using Web Worker
 */

import type { Board, Player, Position } from '../game/types';
import type {
  InitializationError,
  AICalculationError,
  Result,
  AIWorkerRequest,
  AIWorkerResponse,
} from './types';

/**
 * AIEngine Service
 * Manages Web Worker for AI calculations
 */
export class AIEngine {
  private worker: Worker | null = null;
  private initialized: boolean = false;
  private workerPath: string | URL;

  constructor(workerPath?: string | URL) {
    // Default worker path for production
    // In tests, pass a custom path or mock Worker
    if (workerPath) {
      this.workerPath = workerPath;
    } else {
      // Fallback for test environments
      this.workerPath = '/ai-worker.js';
    }
  }

  /**
   * Initialize AI Engine
   * Creates and initializes the Web Worker
   */
  async initialize(): Promise<Result<void, InitializationError>> {
    try {
      // Create worker
      this.worker = new Worker(this.workerPath, { type: 'module' });

      this.initialized = true;

      return {
        success: true,
        value: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'initialization_error',
          reason: 'wasm_load_failed',
          message:
            error instanceof Error ? error.message : 'Worker creation failed',
        },
      };
    }
  }

  /**
   * Calculate AI move
   * @param board - Current board state
   * @param player - AI player ('white' typically)
   * @param timeoutMs - Timeout in milliseconds (default 3000)
   * @returns Result with Position or error
   */
  async calculateMove(
    board: Board,
    player: Player,
    timeoutMs: number = 3000
  ): Promise<Result<Position, AICalculationError>> {
    if (!this.initialized || !this.worker) {
      return {
        success: false,
        error: {
          type: 'ai_calculation_error',
          reason: 'not_initialized',
          message: 'AI Engine not initialized. Call initialize() first.',
        },
      };
    }

    return new Promise((resolve) => {
      // this.workerの存在が保証されている (Line 75でチェック済み)
      const worker = this.worker!;

      // Set up timeout
      const timeout = setTimeout(() => {
        worker.removeEventListener('message', handleMessage);
        resolve({
          success: false,
          error: {
            type: 'ai_calculation_error',
            reason: 'timeout',
            message: `AI calculation timeout (>${timeoutMs}ms)`,
          },
        });
      }, timeoutMs);

      // Set up message listener
      const handleMessage = (event: MessageEvent<AIWorkerResponse>) => {
        clearTimeout(timeout);
        worker.removeEventListener('message', handleMessage);

        if (event.data.type === 'success') {
          resolve({
            success: true,
            value: event.data.payload.move!,
          });
        } else {
          resolve({
            success: false,
            error: {
              type: 'ai_calculation_error',
              reason: 'wasm_error',
              message: event.data.payload.error || 'Unknown error',
            },
          });
        }
      };

      worker.addEventListener('message', handleMessage);

      // Send calculation request to worker
      const request: AIWorkerRequest = {
        type: 'calculate',
        payload: {
          board,
          currentPlayer: player,
          timeoutMs,
        },
      };

      worker.postMessage(request);
    });
  }

  /**
   * Check if AI Engine is ready
   */
  isReady(): boolean {
    return this.initialized && this.worker !== null;
  }

  /**
   * Dispose of resources
   * Terminates the Web Worker
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.initialized = false;
  }
}
