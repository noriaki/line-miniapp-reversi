/**
 * Unit tests for WASM Loader - Emscripten Integration
 * Tests Emscripten Module loading approach
 */

import { loadWASM } from '../wasm-loader';

// Web Worker global function declaration for tests
declare function importScripts(...urls: string[]): void;

// Mock Emscripten Module
const mockEmscriptenModule = {
  _init_ai: jest.fn(),
  _malloc: jest.fn(),
  _free: jest.fn(),
  _calc_value: jest.fn(),
  _ai_js: jest.fn(),
  _resume: jest.fn(),
  _stop: jest.fn(),
  memory: {} as WebAssembly.Memory,
  HEAP8: new Int8Array(64),
  HEAPU8: new Uint8Array(64),
  HEAP32: new Int32Array(64),
  onRuntimeInitialized: undefined as (() => void) | undefined,
};

describe('loadWASM - Emscripten Integration', () => {
  let originalImportScripts: typeof importScripts | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    // Save original importScripts if it exists
    originalImportScripts =
      typeof importScripts !== 'undefined' ? importScripts : undefined;
  });

  afterEach(() => {
    // Restore importScripts
    if (originalImportScripts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).importScripts = originalImportScripts;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).importScripts;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).Module;
    // Clean up global HEAP variables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).HEAP8;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).HEAPU8;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).HEAP32;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).HEAPU32;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).wasmMemory;
  });

  it('should load WASM via Emscripten Module in Web Worker context', async () => {
    // Mock Web Worker environment
    const mockImportScripts = jest.fn().mockImplementation(() => {
      // Simulate Emscripten ai.js loading Module into global scope
      const emscriptenModule = { ...mockEmscriptenModule };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = emscriptenModule;

      // Trigger onRuntimeInitialized on next tick (before promise microtask)
      process.nextTick(() => {
        if (emscriptenModule.onRuntimeInitialized) {
          emscriptenModule.onRuntimeInitialized();
        }
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = mockImportScripts;

    const result = await loadWASM('/ai.wasm');

    // Should call importScripts with absolute ai.js URL
    expect(mockImportScripts).toHaveBeenCalledWith('http://localhost/ai.js');

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

    const mockImportScripts = jest.fn().mockImplementation(() => {
      // Create emscripten module with _malloc/_free present (Module loaded state)
      // but without explicit runtime initialization
      const emscriptenModule = {
        _init_ai: jest.fn(),
        _calc_value: jest.fn(),
        _resume: jest.fn(),
        _stop: jest.fn(),
        _malloc: jest.fn(), // Present from module load, not runtime init
        _free: jest.fn(), // Present from module load, not runtime init
        memory: {} as WebAssembly.Memory,
        HEAP8: new Int8Array(64),
        HEAPU8: new Uint8Array(64),
        HEAP32: new Int32Array(64),
        set onRuntimeInitialized(callback: () => void) {
          callbackWasSet = true;
          // Simulate async runtime initialization with nextTick
          process.nextTick(() => {
            callback();
          });
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = emscriptenModule;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = mockImportScripts;

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(true);
    expect(callbackWasSet).toBe(true);
  });

  it('should return error when importScripts is not available (not in Worker)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).importScripts;

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('fetch_failed');
      expect(result.error.message).toContain('importScripts');
    }
  });

  it('should return error when importScripts throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = jest.fn().mockImplementation(() => {
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
    // Ensure Module is not set
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).Module;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = jest.fn().mockImplementation(() => {
      // Simulate scenario where Emscripten glue code fails to set up Module
      // Delete the pre-configured Module object to simulate initialization failure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).Module;
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
    const initAiMock = jest.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = jest.fn().mockImplementation(() => {
      const emscriptenModule = {
        ...mockEmscriptenModule,
        _init_ai: initAiMock,
        set onRuntimeInitialized(callback: () => void) {
          process.nextTick(() => callback());
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = emscriptenModule;
    });

    await loadWASM('/ai.wasm');

    expect(initAiMock).toHaveBeenCalledTimes(1);
  });

  it('should derive ai.js path from wasm path', async () => {
    const mockImportScripts = jest.fn().mockImplementation(() => {
      const emscriptenModule = { ...mockEmscriptenModule };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = emscriptenModule;
      process.nextTick(() => {
        if (emscriptenModule.onRuntimeInitialized) {
          emscriptenModule.onRuntimeInitialized();
        }
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = mockImportScripts;

    await loadWASM('/ai.wasm');
    expect(mockImportScripts).toHaveBeenNthCalledWith(
      1,
      'http://localhost/ai.js'
    );

    await loadWASM('/path/to/ai.wasm');
    expect(mockImportScripts).toHaveBeenNthCalledWith(
      2,
      'http://localhost/path/to/ai.js'
    );

    await loadWASM('ai.wasm');
    expect(mockImportScripts).toHaveBeenNthCalledWith(
      3,
      'http://localhostai.js'
    );
  });
});
