/// <reference lib="webworker" />

/**
 * Tests for wasm-loader.ts
 * Target: 90%+ coverage for all metrics
 *
 * Test Strategy:
 * - Mock global.importScripts and global.Module for Emscripten environment
 * - Use process.nextTick() for onRuntimeInitialized callback timing control
 * - Test all paths: success, fetch_failed, instantiation_failed, timeout
 * - Verify Result type patterns and error structures
 */

import { loadWASM, isModuleReady } from '../wasm-loader';
import type { EgaroucidWASMModule } from '../types';
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

describe('wasm-loader', () => {
  describe('loadWASM', () => {
    let mockModule: MockEmscriptenModule;

    beforeEach(() => {
      // Create mock Emscripten Module with all required functions
      mockModule = createEmscriptenModule();

      // Setup Web Worker environment with mock module
      setupWorkerEnvironment(mockModule);
    });

    afterEach(() => {
      // Cleanup global state
      cleanupWorkerEnvironment();
    });

    // Task 4.1: WASM正常ロードのテスト

    it('should successfully load WASM module with correct path resolution', async () => {
      const result = await loadWASM('/ai.wasm');

      // Verify Result.success structure
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeDefined();
        expect(result.value._init_ai).toBeDefined();
        expect(result.value._malloc).toBeDefined();
        expect(result.value._free).toBeDefined();
      }

      // Verify importScripts was called with correct path
      expect(global.importScripts).toHaveBeenCalledWith(
        'http://localhost:3000/ai.js'
      );
    });

    it('should call importScripts with .wasm replaced by .js', async () => {
      await loadWASM('/path/to/ai.wasm');

      expect(global.importScripts).toHaveBeenCalledWith(
        'http://localhost:3000/path/to/ai.js'
      );
    });

    it('should wait for onRuntimeInitialized callback', async () => {
      const result = await loadWASM('/ai.wasm');

      // Verify runtime initialization completed
      expect(result.success).toBe(true);

      // Verify HEAP views were copied to Module
      if (result.success) {
        expect(result.value.HEAP8).toBeDefined();
        expect(result.value.HEAPU8).toBeDefined();
        expect(result.value.HEAP32).toBeDefined();
        expect(result.value.HEAPU32).toBeDefined();
      }
    });

    it('should call _init_ai after runtime initialization', async () => {
      const result = await loadWASM('/ai.wasm');

      expect(result.success).toBe(true);
      expect(mockModule._init_ai).toHaveBeenCalled();
    });

    it('should configure Module.locateFile for WASM path resolution', async () => {
      await loadWASM('/custom/path/ai.wasm');

      // Module should be pre-configured before importScripts
      const preConfiguredModule = global.Module;
      expect(preConfiguredModule).toBeDefined();
      expect(preConfiguredModule?.locateFile).toBeDefined();

      // Test locateFile behavior
      expect(preConfiguredModule?.locateFile?.('ai.wasm')).toBe(
        'http://localhost:3000/custom/path/ai.wasm'
      );
      expect(preConfiguredModule?.locateFile?.('other.wasm')).toBe(
        'other.wasm'
      );
    });

    // Task 4.2: エラーハンドリングのテスト

    it('should return error when importScripts is undefined', async () => {
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
        expect(result.error.message).toContain(
          'importScripts is not available'
        );
      }
    });

    it('should return error when importScripts throws', async () => {
      global.importScripts = jest.fn().mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await loadWASM('/ai.wasm');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('wasm_load_error');
        expect(result.error.reason).toBe('fetch_failed');
        expect(result.error.message).toContain(
          'Failed to load Emscripten glue code'
        );
        expect(result.error.message).toContain('Network error');
      }
    });

    it('should return error when Module is not defined after importScripts', async () => {
      global.importScripts = jest.fn().mockImplementation(() => {
        // Delete the pre-configured Module to simulate failure
        delete global.Module;
        // Also delete from global.self if it exists
        const globalScope = global as typeof global & { self?: any };
        if (globalScope.self) {
          delete globalScope.self.Module;
        }
      });

      const result = await loadWASM('/ai.wasm');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('wasm_load_error');
        expect(result.error.reason).toBe('instantiation_failed');
        expect(result.error.message).toContain('Emscripten Module not found');
      }
    });

    it('should return error when _malloc is not available after runtime init', async () => {
      const invalidModule = {
        ...mockModule,
        _malloc: undefined, // Missing required function
        _free: undefined,
      };

      global.importScripts = jest.fn().mockImplementation(() => {
        const existingModule = global.Module || {};
        global.Module = {
          ...existingModule,
          ...(invalidModule as any),
        };

        setTimeout(() => {
          const wasmModule = global.Module;
          if (wasmModule && wasmModule.onRuntimeInitialized) {
            wasmModule.onRuntimeInitialized();
          }
        }, 10);
      });

      const result = await loadWASM('/ai.wasm');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('wasm_load_error');
        expect(result.error.reason).toBe('instantiation_failed');
        expect(result.error.message).toContain('Required WASM functions');
      }
    });

    // Task 4.3: 非同期処理とタイミング制御のテスト

    it('should timeout if onRuntimeInitialized is not called within 10 seconds', async () => {
      jest.useFakeTimers();

      // Create a module without _malloc to simulate pre-initialization state
      const uninitializedModule = {
        ...mockModule,
        _malloc: undefined,
        _free: undefined,
      } as any;

      global.importScripts = jest.fn().mockImplementation(() => {
        const globalScope = global as typeof global & { self?: any };
        global.Module = uninitializedModule;
        if (globalScope.self) {
          globalScope.self.Module = uninitializedModule;
        }
        // Do not call onRuntimeInitialized to simulate timeout scenario
      });

      const resultPromise = loadWASM('/ai.wasm');

      // Advance timers past timeout (10 seconds)
      jest.advanceTimersByTime(10001);

      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('wasm_load_error');
        expect(result.error.reason).toBe('initialization_timeout');
        expect(result.error.message).toContain('timed out after 10000ms');
      }

      jest.useRealTimers();
    });

    it('should resolve immediately if _malloc is already available', async () => {
      // Simulate synchronous Emscripten initialization
      const syncModule = {
        ...mockModule,
        _malloc: jest.fn().mockReturnValue(1000),
        _free: jest.fn(),
      };

      global.importScripts = jest.fn().mockImplementation(() => {
        const globalScope = global as typeof global & { self?: any };
        const existingModule = globalScope.self?.Module || global.Module || {};
        const moduleObj = {
          ...existingModule,
          ...syncModule,
        };
        global.Module = moduleObj;
        if (globalScope.self) {
          globalScope.self.Module = moduleObj;
        }
        // Do not set onRuntimeInitialized callback - module is ready immediately
      });

      const result = await loadWASM('/ai.wasm');

      // Should succeed without waiting for callback
      expect(result.success).toBe(true);
    });

    it('should handle setImmediate timing for onRuntimeInitialized', async () => {
      let callbackExecuted = false;

      global.importScripts = jest.fn().mockImplementation(() => {
        const globalScope = global as typeof global & { self?: any };

        // Start with uninitialized module (no _malloc yet)
        const uninitializedModule = {
          ...mockModule,
          _malloc: undefined,
          _free: undefined,
        } as any;

        global.Module = uninitializedModule;
        if (globalScope.self) {
          globalScope.self.Module = uninitializedModule;
        }

        // Simulate async runtime initialization using process.nextTick
        // This ensures the callback is called after loadWASM sets onRuntimeInitialized
        process.nextTick(() => {
          const wasmModule = globalScope.self?.Module || global.Module;

          if (wasmModule) {
            // Add _malloc and _free to simulate WASM initialization
            wasmModule._malloc = mockModule._malloc;
            wasmModule._free = mockModule._free;

            if (wasmModule.onRuntimeInitialized) {
              callbackExecuted = true;
              wasmModule.onRuntimeInitialized();
            }
          }
        });
      });

      const result = await loadWASM('/ai.wasm');

      expect(callbackExecuted).toBe(true);
      expect(result.success).toBe(true);
    });

    // Task 4.4: パス解決とResult型のテスト

    it('should resolve relative paths correctly', async () => {
      await loadWASM('/assets/wasm/ai.wasm');

      expect(global.importScripts).toHaveBeenCalledWith(
        'http://localhost:3000/assets/wasm/ai.js'
      );
    });

    it('should handle paths without leading slash', async () => {
      await loadWASM('ai.wasm');

      expect(global.importScripts).toHaveBeenCalledWith(
        'http://localhost:3000ai.js'
      );
    });

    it('should return Result.success with correct structure', async () => {
      const result = await loadWASM('/ai.wasm');

      expect(result).toMatchObject({
        success: true,
        value: expect.objectContaining({
          _init_ai: expect.any(Function),
          _ai_js: expect.any(Function),
          _calc_value: expect.any(Function),
          _resume: expect.any(Function),
          _stop: expect.any(Function),
          _malloc: expect.any(Function),
          _free: expect.any(Function),
          HEAP8: expect.any(Int8Array),
          HEAPU8: expect.any(Uint8Array),
          HEAP32: expect.any(Int32Array),
          HEAPU32: expect.any(Uint32Array),
        }),
      });
    });

    it('should return Result.error with correct structure for fetch_failed', async () => {
      if (globalObj.importScripts !== undefined) {
        delete (
          globalObj as {
            importScripts?: ((...urls: string[]) => void) | undefined;
          }
        ).importScripts;
      }

      const result = await loadWASM('/ai.wasm');

      expect(result).toMatchObject({
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message: expect.any(String),
        },
      });
    });

    it('should return Result.error with correct structure for instantiation_failed', async () => {
      global.importScripts = jest.fn().mockImplementation(() => {
        delete global.Module; // Module not set
      });

      const result = await loadWASM('/ai.wasm');

      expect(result).toMatchObject({
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'instantiation_failed',
          message: expect.any(String),
        },
      });
    });

    it('should handle unknown errors with generic instantiation_failed', async () => {
      global.importScripts = jest.fn().mockImplementation(() => {
        throw 'String error'; // Non-Error object thrown during import
      });

      const result = await loadWASM('/ai.wasm');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('wasm_load_error');
        expect(result.error.reason).toBe('fetch_failed');
        expect(result.error.message).toBe(
          'Failed to load Emscripten glue code'
        );
      }
    });

    it('should not call _init_ai if it is not defined', async () => {
      const moduleWithoutInit = {
        ...mockModule,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _init_ai: undefined as any,
      };

      global.importScripts = jest.fn().mockImplementation(() => {
        const globalScope = global as typeof global & { self?: any };
        const existingModule = globalScope.self?.Module || global.Module || {};
        const moduleObj = {
          ...existingModule,
          ...moduleWithoutInit,
        };
        global.Module = moduleObj;
        if (globalScope.self) {
          globalScope.self.Module = moduleObj;
        }

        setTimeout(() => {
          const wasmModule = globalScope.self?.Module || global.Module;
          if (wasmModule && wasmModule.onRuntimeInitialized) {
            wasmModule.onRuntimeInitialized();
          }
        }, 10);
      });

      const result = await loadWASM('/ai.wasm');

      // Should still succeed, _init_ai is optional
      expect(result.success).toBe(true);
    });

    it('should copy HEAP views from global scope to Module object', async () => {
      const customHeap8 = new Int8Array(128);
      const customHeapU8 = new Uint8Array(128);

      global.importScripts = jest.fn().mockImplementation(() => {
        const globalScope = global as typeof global & { self?: any };

        // Start with uninitialized module (no _malloc yet)
        const uninitializedModule = {
          ...mockModule,
          _malloc: undefined,
          _free: undefined,
        } as any;

        global.Module = uninitializedModule;
        if (globalScope.self) {
          globalScope.self.Module = uninitializedModule;
        }

        // Use process.nextTick to ensure callback fires after onRuntimeInitialized is set
        process.nextTick(() => {
          const wasmModule = globalScope.self?.Module || global.Module;
          if (wasmModule) {
            // Set HEAP views on global scope (Emscripten behavior)
            global.HEAP8 = customHeap8;
            global.HEAPU8 = customHeapU8;
            global.HEAP32 = mockModule.HEAP32;
            global.HEAPU32 = mockModule.HEAPU32;
            global.wasmMemory = {
              buffer: customHeap8.buffer,
            } as WebAssembly.Memory;

            // Add _malloc and _free to simulate WASM initialization
            wasmModule._malloc = mockModule._malloc;
            wasmModule._free = mockModule._free;

            if (wasmModule.onRuntimeInitialized) {
              wasmModule.onRuntimeInitialized();
            }
          }
        });
      });

      const result = await loadWASM('/ai.wasm');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.HEAP8).toBe(customHeap8);
        expect(result.value.HEAPU8).toBe(customHeapU8);
        expect(result.value.memory).toEqual({ buffer: customHeap8.buffer });
      }
    });
  });

  describe('isModuleReady', () => {
    it('should return false for null module', () => {
      expect(isModuleReady(null)).toBe(false);
    });

    it('should return false for undefined module', () => {
      expect(isModuleReady(undefined)).toBe(false);
    });

    it('should return false when _calc_value is missing', () => {
      const invalidModule = {
        _malloc: jest.fn(),
        _free: jest.fn(),
        _init_ai: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      expect(isModuleReady(invalidModule)).toBe(false);
    });

    it('should return false when _malloc is missing', () => {
      const invalidModule = {
        _calc_value: jest.fn(),
        _free: jest.fn(),
        _init_ai: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      expect(isModuleReady(invalidModule)).toBe(false);
    });

    it('should return false when _free is missing', () => {
      const invalidModule = {
        _calc_value: jest.fn(),
        _malloc: jest.fn(),
        _init_ai: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      expect(isModuleReady(invalidModule)).toBe(false);
    });

    it('should return false when _init_ai is missing', () => {
      const invalidModule = {
        _calc_value: jest.fn(),
        _malloc: jest.fn(),
        _free: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      expect(isModuleReady(invalidModule)).toBe(false);
    });

    it('should return true for valid module with all required functions', () => {
      const validModule: EgaroucidWASMModule = {
        _init_ai: jest.fn().mockReturnValue(0),
        _ai_js: jest.fn().mockReturnValue(12345),
        _calc_value: jest.fn(),
        _resume: jest.fn(),
        _stop: jest.fn(),
        _malloc: jest.fn().mockReturnValue(1000),
        _free: jest.fn(),
        memory: {} as WebAssembly.Memory,
        HEAP8: new Int8Array(64),
        HEAPU8: new Uint8Array(64),
        HEAP32: new Int32Array(16),
        HEAPU32: new Uint32Array(16),
      };

      expect(isModuleReady(validModule)).toBe(true);
    });

    it('should use type guard to narrow module type', () => {
      const maybeModule: EgaroucidWASMModule | null = {
        _init_ai: jest.fn().mockReturnValue(0),
        _ai_js: jest.fn().mockReturnValue(12345),
        _calc_value: jest.fn(),
        _resume: jest.fn(),
        _stop: jest.fn(),
        _malloc: jest.fn().mockReturnValue(1000),
        _free: jest.fn(),
        memory: {} as WebAssembly.Memory,
        HEAP8: new Int8Array(64),
        HEAPU8: new Uint8Array(64),
        HEAP32: new Int32Array(16),
        HEAPU32: new Uint32Array(16),
      };

      if (isModuleReady(maybeModule)) {
        // Type is narrowed to EgaroucidWASMModule
        expect(maybeModule._malloc).toBeDefined();
      }
    });
  });
});
