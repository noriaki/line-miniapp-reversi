/**
 * @jest-environment node
 *
 * WASM Integration Tests - Module Loading
 *
 * Tests for WASM module initialization and exported function verification.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('WASM Module Loading', () => {
  const RESOURCES_DIR = path.join(__dirname, '../../../../public');
  const WASM_PATH = path.join(RESOURCES_DIR, 'ai.wasm');
  const GLUE_PATH = path.join(RESOURCES_DIR, 'ai.js');

  let Module: EgaroucidWASMModule;

  beforeAll(async () => {
    // Verify resource files exist
    expect(fs.existsSync(WASM_PATH)).toBe(true);
    expect(fs.existsSync(GLUE_PATH)).toBe(true);

    // Load WASM binary
    const wasmBinary = fs.readFileSync(WASM_PATH);

    // Load Emscripten glue code
    // Note: Emscripten Module is a global object created by ai.js
    const glueCode = fs.readFileSync(GLUE_PATH, 'utf-8');

    // Create global context for Emscripten with Node.js environment
    const modulePromise = new Promise<EgaroucidWASMModule>(
      (resolve, reject) => {
        const globalObj = global as typeof global & {
          process?: NodeJS.Process;
          require?: NodeRequire;
          Module?: unknown;
        };

        // Provide Node.js global objects that Emscripten expects
        if (typeof globalObj.process === 'undefined') {
          globalObj.process = process;
        }
        if (typeof globalObj.require === 'undefined') {
          globalObj.require = require;
        }

        const moduleConfig: Partial<EmscriptenModule> = {
          wasmBinary: wasmBinary.buffer.slice(
            wasmBinary.byteOffset,
            wasmBinary.byteOffset + wasmBinary.byteLength
          ),
          // Emscripten uses scriptDirectory, let's make sure it's set correctly
          // by defining thisProgram to be in the resources directory
          thisProgram: path.join(RESOURCES_DIR, 'ai.js'),
          locateFile: (filename: string) => {
            // Always resolve to resources directory
            return path.join(RESOURCES_DIR, filename);
          },
          onRuntimeInitialized: function (this: EgaroucidWASMModule) {
            // Copy HEAP views from global scope to Module (Emscripten 4.0.17 pattern)
            const globalObj = global as typeof global & {
              HEAP8?: Int8Array;
              HEAPU8?: Uint8Array;
              HEAP32?: Int32Array;
              HEAPU32?: Uint32Array;
              wasmMemory?: WebAssembly.Memory;
            };

            // Strategy 1: Copy from global scope
            if (globalObj.HEAP32) {
              this.HEAP8 = globalObj.HEAP8!;
              this.HEAPU8 = globalObj.HEAPU8!;
              this.HEAP32 = globalObj.HEAP32!;
              this.HEAPU32 = globalObj.HEAPU32!;
            }
            // Strategy 2: Create from wasmMemory.buffer
            else if (globalObj.wasmMemory) {
              const buffer = globalObj.wasmMemory.buffer;
              this.HEAP8 = new Int8Array(buffer);
              this.HEAPU8 = new Uint8Array(buffer);
              this.HEAP32 = new Int32Array(buffer);
              this.HEAPU32 = new Uint32Array(buffer);
            }
            // Strategy 3: Create from Module.memory.buffer
            else if (this.memory && this.memory.buffer) {
              const buffer = this.memory.buffer;
              this.HEAP8 = new Int8Array(buffer);
              this.HEAPU8 = new Uint8Array(buffer);
              this.HEAP32 = new Int32Array(buffer);
              this.HEAPU32 = new Uint32Array(buffer);
            }

            // Verify HEAP32 exists and resolve or reject
            if (this.HEAP32) {
              resolve(this);
            } else {
              reject(new Error('Failed to initialize HEAP views'));
            }
          },
          onAbort: (reason: unknown) => {
            reject(new Error(`WASM initialization aborted: ${reason}`));
          },
          print: (text: string) => {
            // Suppress WASM stdout logs
            void text; // Explicitly reference parameter to avoid unused warning
          },
          printErr: (text: string) => {
            // Suppress WASM internal logs, only show real errors
            if (
              text.includes('Error:') ||
              text.includes('Exception:') ||
              text.includes('Assertion failed')
            ) {
              console.error('[WASM Error]', text);
            }
          },
          noInitialRun: false,
          noExitRuntime: true,
        };

        globalObj.Module = moduleConfig as EmscriptenModule;

        try {
          // Execute Emscripten glue code in a context where __dirname is defined
          // Wrap updateMemoryViews to expose HEAP views to Module
          // In the minified code: function updateMemoryViews(){var b=wasmMemory.buffer;HEAP8=new Int8Array(b);...}
          const injectedGlueCode =
            glueCode +
            '\n;' +
            `
// Wrap updateMemoryViews to expose HEAP and memory to Module
(function() {
  var original = updateMemoryViews;
  updateMemoryViews = function() {
    original();
    Module.HEAP8 = HEAP8;
    Module.HEAPU8 = HEAPU8;
    Module.HEAP32 = HEAP32;
    Module.HEAPU32 = HEAPU32;
    Module.memory = wasmMemory;
  };
})();
`;
          // Create a function that provides __dirname and __filename
          const executeGlue = new Function(
            '__dirname',
            '__filename',
            'Module',
            'process',
            'require',
            injectedGlueCode
          );
          executeGlue(RESOURCES_DIR, GLUE_PATH, moduleConfig, process, require);
        } catch (error) {
          reject(error);
        }
      }
    );

    Module = await modulePromise;
  }, 30000); // 30s timeout for WASM loading

  test('should load WASM module successfully', () => {
    expect(Module).toBeDefined();
    // Note: Emscripten may use 'wasmMemory' instead of 'memory'
    // as long as HEAP views are available, the module is loaded
    expect(Module.HEAP8 || Module.memory).toBeDefined();
  });

  test('should export _init_ai function', () => {
    expect(Module._init_ai).toBeDefined();
    expect(typeof Module._init_ai).toBe('function');
  });

  test('should export _ai_js function', () => {
    expect(Module._ai_js).toBeDefined();
    expect(typeof Module._ai_js).toBe('function');
  });

  test('should export _calc_value function', () => {
    expect(Module._calc_value).toBeDefined();
    expect(typeof Module._calc_value).toBe('function');
  });

  test('should export _stop function', () => {
    expect(Module._stop).toBeDefined();
    expect(typeof Module._stop).toBe('function');
  });

  test('should export _resume function', () => {
    expect(Module._resume).toBeDefined();
    expect(typeof Module._resume).toBe('function');
  });

  test('should export _malloc function', () => {
    expect(Module._malloc).toBeDefined();
    expect(typeof Module._malloc).toBe('function');
  });

  test('should export _free function', () => {
    expect(Module._free).toBeDefined();
    expect(typeof Module._free).toBe('function');
  });

  test('should provide memory heap views', () => {
    expect(Module.HEAP8).toBeDefined();
    expect(Module.HEAP8).toBeInstanceOf(Int8Array);

    expect(Module.HEAPU8).toBeDefined();
    expect(Module.HEAPU8).toBeInstanceOf(Uint8Array);

    expect(Module.HEAP32).toBeDefined();
    expect(Module.HEAP32).toBeInstanceOf(Int32Array);

    expect(Module.HEAPU32).toBeDefined();
    expect(Module.HEAPU32).toBeInstanceOf(Uint32Array);
  });

  test('should allocate and free memory correctly', () => {
    const size = 256;
    const ptr = Module._malloc(size);

    expect(ptr).toBeGreaterThan(0);
    expect(typeof ptr).toBe('number');

    // Should not throw
    expect(() => {
      Module._free(ptr);
    }).not.toThrow();
  });
});
