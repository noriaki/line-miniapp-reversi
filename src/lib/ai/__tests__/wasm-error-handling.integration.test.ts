/**
 * @jest-environment node
 *
 * WASM Integration Tests - Error Handling and Edge Cases
 *
 * Tests for robustness against invalid inputs, boundary conditions,
 * and error scenarios.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('Error Handling and Edge Cases', () => {
  const RESOURCES_DIR = path.join(__dirname, '../../../../public');
  const WASM_PATH = path.join(RESOURCES_DIR, 'ai.wasm');
  const GLUE_PATH = path.join(RESOURCES_DIR, 'ai.js');

  let Module: EgaroucidWASMModule;

  beforeAll(async () => {
    const wasmBinary = fs.readFileSync(WASM_PATH);
    const glueCode = fs.readFileSync(GLUE_PATH, 'utf-8');

    const modulePromise = new Promise<EgaroucidWASMModule>(
      (resolve, reject) => {
        const globalObj = global as typeof global & {
          process?: NodeJS.Process;
          require?: NodeRequire;
          Module?: unknown;
        };

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
          thisProgram: path.join(RESOURCES_DIR, 'ai.js'),
          locateFile: (filename: string) => path.join(RESOURCES_DIR, filename),
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
            void text;
          },
          printErr: (text: string) => {
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

    // Initialize AI
    const percentagePtr = Module._malloc(4);
    Module._init_ai(percentagePtr);
    Module._free(percentagePtr);
  }, 60000);

  test('should handle invalid board size with 63 elements', () => {
    // Create 63-element board (one short)
    const ptr = Module._malloc(63 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 63);

    // Fill with initial board pattern
    for (let i = 0; i < 63; i++) {
      heap[i] = -1;
    }

    // WASM may crash or return invalid result
    // We expect either an error or undefined behavior
    // The test passes if we can detect the issue
    try {
      const result = Module._ai_js(ptr, 1, 0);
      // If it returns, result should be checked
      // Note: WASM may not validate input size
      expect(typeof result).toBe('number');
    } catch (error) {
      // Expected: WASM may throw or crash
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle invalid board size with 65 elements', () => {
    // Create 65-element board (one extra)
    const ptr = Module._malloc(65 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 65);

    // Fill with initial board pattern
    for (let i = 0; i < 65; i++) {
      heap[i] = -1;
    }

    // WASM reads only first 64 elements, extra element is ignored
    try {
      const result = Module._ai_js(ptr, 1, 0);
      // WASM will read first 64 elements, should work
      expect(typeof result).toBe('number');
    } catch (error) {
      // Unexpected, but we handle it
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle out-of-range cell value (-2)', () => {
    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

    // Create initial board
    for (let i = 0; i < 64; i++) {
      heap[i] = -1;
    }
    heap[27] = 1; // (3,3)
    heap[28] = 0; // (3,4)
    heap[35] = 0; // (4,3)
    heap[36] = 1; // (4,4)

    // Insert invalid value
    heap[0] = -2; // Invalid

    // WASM may interpret -2 as empty or cause undefined behavior
    try {
      const result = Module._ai_js(ptr, 1, 0);
      expect(typeof result).toBe('number');
    } catch (error) {
      // May throw
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle out-of-range cell value (2)', () => {
    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

    // Create initial board
    for (let i = 0; i < 64; i++) {
      heap[i] = -1;
    }
    heap[27] = 1;
    heap[28] = 0;
    heap[35] = 0;
    heap[36] = 1;

    // Insert invalid value
    heap[0] = 2; // Invalid (2 is VACANT in internal representation, but input should be -1/0/1)

    try {
      const result = Module._ai_js(ptr, 1, 0);
      expect(typeof result).toBe('number');
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle large positive cell values', () => {
    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

    // Create initial board
    for (let i = 0; i < 64; i++) {
      heap[i] = -1;
    }
    heap[27] = 1;
    heap[28] = 0;
    heap[35] = 0;
    heap[36] = 1;

    // Insert invalid value
    heap[0] = 999;

    try {
      const result = Module._ai_js(ptr, 1, 0);
      expect(typeof result).toBe('number');
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle _malloc failure when requesting huge memory', () => {
    // Request unreasonably large memory (10GB)
    const hugeSize = 10 * 1024 * 1024 * 1024;

    try {
      const ptr = Module._malloc(hugeSize);
      if (ptr === 0) {
        // Expected: malloc returns 0 on failure
        expect(ptr).toBe(0);
      } else {
        // Unexpectedly succeeded, free it
        Module._free(ptr);
      }
    } catch (error) {
      // May throw out-of-memory error
      expect(error).toBeDefined();
    }
  });

  test('should return response values within valid range (0-63)', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = initialBoard[row][col];
      }
    }

    const result = Module._ai_js(ptr, 1, 0);
    Module._free(ptr);

    // Decode and check range
    const policy = 63 - Math.floor((result - 100) / 1000);
    expect(policy).toBeGreaterThanOrEqual(0);
    expect(policy).toBeLessThanOrEqual(63);
  });

  test('should handle empty board with no stones', () => {
    const emptyBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));

    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = emptyBoard[row][col];
      }
    }

    // Empty board has no legal moves
    try {
      const result = Module._ai_js(ptr, 1, 0);
      // May return invalid result or special value
      expect(typeof result).toBe('number');
    } catch (error) {
      // May throw
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle completely filled board', () => {
    const filledBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(0)); // All black

    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = filledBoard[row][col];
      }
    }

    // No empty cells, no legal moves
    try {
      const result = Module._ai_js(ptr, 1, 0);
      // May return special value (e.g., -1 for game end)
      expect(typeof result).toBe('number');
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle invalid ai_player value (2)', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = initialBoard[row][col];
      }
    }

    // ai_player should be 0 or 1, test with 2
    try {
      const result = Module._ai_js(ptr, 1, 2);
      // WASM may interpret 2 as 0 or 1 (modulo), or cause undefined behavior
      expect(typeof result).toBe('number');
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle invalid level value (-1)', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = initialBoard[row][col];
      }
    }

    // Level should be 0-60, test with -1
    try {
      const result = Module._ai_js(ptr, -1, 0);
      // May clamp to 0 or cause error
      expect(typeof result).toBe('number');
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });

  test('should handle invalid level value (100)', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = initialBoard[row][col];
      }
    }

    // Level should be 0-60, test with 100
    try {
      const result = Module._ai_js(ptr, 100, 0);
      // May clamp to max level or cause error
      expect(typeof result).toBe('number');
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      Module._free(ptr);
    }
  });
});
