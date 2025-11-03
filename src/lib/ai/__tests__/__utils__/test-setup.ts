/**
 * Test utilities for WASM loader tests
 * Web Worker環境のセットアップとクリーンアップ
 */
import type { MockEmscriptenModule } from '../__fixtures__/emscripten-module';

// Type-safe global object for Web Worker environment
const globalObj = global as typeof global & {
  self?: unknown;
};

// Shared location mock object - updated for each test via setupWorkerEnvironment
let locationMock: { origin: string; href: string } | null = null;

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
    const globalScope = global as typeof global & { self?: any };

    // Get existing module from self.Module (if exists) or global.Module
    const existingModule = globalScope.self?.Module || global.Module || {};

    // Create new module object merging existing configuration with mock
    const moduleObj = {
      ...existingModule,
      ...mockModule,
    };

    // Set both global.Module and globalScope.self.Module to the same object
    // This ensures wasm-loader.ts (which uses self.Module) and tests (which use global.Module) see the same object
    global.Module = moduleObj;
    if (globalScope.self) {
      globalScope.self.Module = moduleObj;
    }

    if (autoTriggerInit) {
      const trigger = () => {
        // Get module from self.Module (if exists) or global.Module
        const wasmModule = globalScope.self?.Module || global.Module;
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
  // In Web Worker, self.location is a WorkerLocation object with origin and href
  // Always ensure locationMock exists and has correct values for this test
  if (!locationMock) {
    locationMock = {
      origin,
      href: `${origin}/`,
    };
  } else {
    // Update existing locationMock object for this test
    locationMock.origin = origin;
    locationMock.href = `${origin}/`;
  }

  // Mock self: In Web Worker, self === global (globalThis)
  // In jsdom testEnvironment, global.location is not configurable and has origin: 'http://localhost'
  // We cannot delete or redefine it, so we use a Proxy to intercept location access
  // This way, wasm-loader.ts (which accesses self.location.origin) gets our mock
  if (!globalObj.self || (globalObj.self as any).__isProxy !== true) {
    (globalObj as any).self = new Proxy(globalObj, {
      get(target: any, prop: string | symbol) {
        if (prop === 'location') {
          return locationMock;
        }
        if (prop === '__isProxy') {
          return true;
        }
        return target[prop];
      },
      set(target: any, prop: string | symbol, value: any) {
        target[prop] = value;
        return true;
      },
    });
  }
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

  // Note: We keep locationMock object alive and just update its values in each test
  // This avoids "Cannot redefine property" errors when running multiple tests
  // The location property with getter is defined once and reused across all tests

  // Note: We don't delete global.self because it's set to global itself
  // Deleting it would break the reference

  // Clear mock call history but preserve the mock function itself
  // importScripts is set globally in jest.setup.js and should not be removed
  if (
    global.importScripts &&
    typeof (global.importScripts as jest.Mock).mockClear === 'function'
  ) {
    (global.importScripts as jest.Mock).mockClear();
  }
}
