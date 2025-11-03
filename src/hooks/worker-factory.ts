/**
 * Worker Factory
 * Handles Web Worker instantiation with import.meta.url
 * Separated to enable easier testing (this file can be mocked in tests)
 */

import type { AIWorkerResponse } from '@/lib/ai/types';

/**
 * Create AI Worker instance
 * @returns Worker instance or null if creation fails
 */
export function createAIWorker(): Worker | null {
  try {
    // Use import.meta.url for worker URL (only works in modern bundlers, not Jest)
    // Note: Omit file extension - Next.js will resolve it correctly
    const workerURL = new URL('../workers/ai-worker', import.meta.url);
    return new Worker(workerURL, { type: 'module' });
  } catch (error) {
    // Enhanced error logging for better debugging
    console.error('Failed to create AI worker:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });
    return null;
  }
}

/**
 * MockWorker type for testing
 * Actual implementation is in __mocks__/worker-factory.ts
 */
export interface MockWorker extends Worker {
  simulateMessage(data: AIWorkerResponse): void;
  isWorkerTerminated(): boolean;
}
