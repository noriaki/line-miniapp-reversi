/// <reference lib="webworker" />

/**
 * Unit tests for WASM Loader - Emscripten Integration
 * Tests Emscripten Module loading approach
 */

import { loadWASM } from '../wasm-loader';
import {
  createEmscriptenModule,
  type MockEmscriptenModule,
} from './__fixtures__/emscripten-module';
import {
  setupWorkerEnvironment,
  cleanupWorkerEnvironment,
} from './__utils__/test-setup';

// Type-safe global object
const globalObj = global as typeof global & {
  importScripts?: ((...urls: string[]) => void) | undefined;
};

describe('loadWASM - Emscripten Integration', () => {
  let mockModule: MockEmscriptenModule;

  beforeEach(() => {
    // Create mock Emscripten Module
    mockModule = createEmscriptenModule();

    // Setup Web Worker environment with localhost origin (different from wasm-loader.test.ts)
    setupWorkerEnvironment(mockModule, {
      origin: 'http://localhost',
    });
  });

  afterEach(() => {
    // Cleanup global state
    cleanupWorkerEnvironment();
  });

  it('should load WASM via Emscripten Module in Web Worker context', async () => {
    const result = await loadWASM('/ai.wasm');

    // Should call importScripts with absolute ai.js URL
    expect(global.importScripts).toHaveBeenCalledWith('http://localhost/ai.js');

    // Should successfully return Module
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBeDefined();
      expect(result.value._init_ai).toBeDefined();
      expect(result.value._malloc).toBeDefined();
      expect(result.value._calc_value).toBeDefined();
    }
  });

  it('should wait for onRuntimeInitialized callback', async () => {
    let callbackWasSet = false;

    // Override importScripts for this specific test to track callback setter
    (global.importScripts as jest.Mock).mockImplementation(() => {
      const emscriptenModule = createEmscriptenModule();

      // Custom setter to track when callback is set and use process.nextTick
      Object.defineProperty(emscriptenModule, 'onRuntimeInitialized', {
        set(callback: () => void) {
          callbackWasSet = true;
          // Simulate async runtime initialization with nextTick (microtask)
          process.nextTick(() => {
            callback();
          });
        },
        configurable: true,
      });

      global.Module = emscriptenModule;
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(true);
    expect(callbackWasSet).toBe(true);
  });

  it('should return error when importScripts is not available (not in Worker)', async () => {
    if (globalObj.importScripts !== undefined) {
      delete (
        globalObj as {
          importScripts?: ((...urls: string[]) => void) | undefined;
        }
      ).importScripts;
    }

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('fetch_failed');
      expect(result.error.message).toContain('importScripts');
    }
  });

  it('should return error when importScripts throws', async () => {
    (global.importScripts as jest.Mock).mockImplementation(() => {
      throw new Error('Script load failed');
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('fetch_failed');
      expect(result.error.message).toContain('Script load failed');
    }
  });

  it('should return error when Module is not available after importScripts', async () => {
    (global.importScripts as jest.Mock).mockImplementation(() => {
      // Simulate scenario where Emscripten glue code fails to set up Module
      // Delete the pre-configured Module object to simulate initialization failure
      delete global.Module;
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('instantiation_failed');
      expect(result.error.message).toContain('Module not found');
    }
  });

  it('should call _init_ai after runtime initialization', async () => {
    await loadWASM('/ai.wasm');

    expect(mockModule._init_ai).toHaveBeenCalledTimes(1);
  });

  it('should derive ai.js path from wasm path', async () => {
    await loadWASM('/ai.wasm');
    expect(global.importScripts).toHaveBeenNthCalledWith(
      1,
      'http://localhost/ai.js'
    );

    await loadWASM('/path/to/ai.wasm');
    expect(global.importScripts).toHaveBeenNthCalledWith(
      2,
      'http://localhost/path/to/ai.js'
    );

    await loadWASM('ai.wasm');
    expect(global.importScripts).toHaveBeenNthCalledWith(
      3,
      'http://localhostai.js'
    );
  });
});
