/**
 * Test utilities for WASM loader tests
 * Web Worker環境のセットアップとクリーンアップ
 */
import type { MockEmscriptenModule } from '../__fixtures__/emscripten-module';

// Type-safe global object for Web Worker environment
const globalObj = global as typeof global & {
  self?: unknown;
};

export interface WorkerEnvironmentOptions {
  origin?: string;
  initDelay?: number;
  autoTriggerInit?: boolean;
  useMicrotask?: boolean;
}

/**
 * Setup Web Worker environment with Emscripten module
 *
 * @param mockModule - Mock Emscripten module to use
 * @param options - Configuration options
 * @param options.origin - Origin for self.location (default: 'http://localhost:3000')
 * @param options.initDelay - Delay before triggering onRuntimeInitialized in ms (default: 0)
 * @param options.autoTriggerInit - Automatically trigger runtime initialization (default: true)
 * @param options.useMicrotask - Use process.nextTick() instead of setTimeout() (default: false)
 *
 * @example
 * ```typescript
 * const mockModule = createEmscriptenModule();
 * setupWorkerEnvironment(mockModule, { origin: 'http://localhost' });
 * ```
 */
export function setupWorkerEnvironment(
  mockModule: MockEmscriptenModule,
  options: WorkerEnvironmentOptions = {}
): void {
  const {
    origin = 'http://localhost:3000',
    initDelay = 0,
    autoTriggerInit = true,
    useMicrotask = false,
  } = options;

  // Ensure importScripts exists (it might have been deleted by a previous test)
  if (!global.importScripts) {
    global.importScripts = jest.fn();
  }

  // Mock importScripts behavior
  (global.importScripts as jest.Mock).mockImplementation(() => {
    const existingModule = global.Module || {};
    global.Module = {
      ...existingModule,
      ...mockModule,
    };

    if (autoTriggerInit) {
      const trigger = () => {
        const wasmModule = global.Module;
        if (wasmModule?.onRuntimeInitialized) {
          // Copy HEAP views to global scope (Emscripten behavior in Web Worker)
          global.HEAP8 = mockModule.HEAP8;
          global.HEAPU8 = mockModule.HEAPU8;
          global.HEAP32 = mockModule.HEAP32;
          global.HEAPU32 = mockModule.HEAPU32;
          global.wasmMemory = mockModule.memory;

          wasmModule.onRuntimeInitialized();
        }
      };

      // Use setTimeout to ensure the callback is set after importScripts returns
      // This allows loadWASM to set Module.onRuntimeInitialized before we try to call it
      if (useMicrotask) {
        process.nextTick(trigger);
      } else {
        setTimeout(trigger, initDelay);
      }
    }
  });

  // Mock self.location
  globalObj.self = {
    location: { origin, href: `${origin}/` },
  } as typeof globalObj.self;
}

/**
 * Cleanup Web Worker environment
 *
 * Removes all global variables set by setupWorkerEnvironment() and clears mock call history.
 * Should be called in afterEach() to ensure clean state between tests.
 *
 * Note: Does not remove global.importScripts as it's set by jest.setup.js globally.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   cleanupWorkerEnvironment();
 * });
 * ```
 */
export function cleanupWorkerEnvironment(): void {
  delete global.Module;
  delete global.HEAP8;
  delete global.HEAPU8;
  delete global.HEAP32;
  delete global.HEAPU32;
  delete global.wasmMemory;
  if (globalObj.self !== undefined) {
    delete (globalObj as { self?: unknown }).self;
  }

  // Clear mock call history but preserve the mock function itself
  // importScripts is set globally in jest.setup.js and should not be removed
  if (
    global.importScripts &&
    typeof (global.importScripts as jest.Mock).mockClear === 'function'
  ) {
    (global.importScripts as jest.Mock).mockClear();
  }
}
