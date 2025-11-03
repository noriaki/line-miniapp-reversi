/**
 * Worker Factory
 * Handles Web Worker instantiation with import.meta.url
 * Separated to enable easier testing (this file can be mocked in tests)
 */

/**
 * Create AI Worker instance
 * @returns Worker instance or null if creation fails
 */
export function createAIWorker(): Worker | null {
  try {
    // Use import.meta.url for worker URL (only works in modern bundlers, not Jest)
    const workerURL = new URL('../workers/ai-worker.ts', import.meta.url);
    return new Worker(workerURL, { type: 'module' });
  } catch (error) {
    console.error('Failed to create AI worker:', error);
    return null;
  }
}
