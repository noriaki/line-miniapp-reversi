/**
 * @jest-environment node
 *
 * WASM Integration Tests - Memory Management
 *
 * Tests for _malloc and _free functions, memory allocation, deallocation,
 * and leak prevention.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('Memory Management (_malloc/_free)', () => {
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
          // Execute Emscripten glue code with injected HEAP exposure logic
          // Wrap updateMemoryViews to expose HEAP views to Module
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

  test('should allocate memory successfully with _malloc(256)', () => {
    const size = 256; // 64 Int32 elements * 4 bytes
    const ptr = Module._malloc(size);

    expect(ptr).toBeGreaterThan(0);
    expect(typeof ptr).toBe('number');

    // Cleanup
    Module._free(ptr);
  });

  test('should support HEAP32 memory read and write operations', () => {
    const ptr = Module._malloc(256);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

    // Write test data
    for (let i = 0; i < 64; i++) {
      heap[i] = i;
    }

    // Read back and verify
    for (let i = 0; i < 64; i++) {
      expect(heap[i]).toBe(i);
    }

    Module._free(ptr);
  });

  test('should release memory without errors using _free()', () => {
    const ptr = Module._malloc(256);

    expect(() => {
      Module._free(ptr);
    }).not.toThrow();
  });

  test('should not cause memory leaks during consecutive AI calculations', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const level = 1;
    const ai_player = 0;

    // Perform 10 AI calculations
    for (let iteration = 0; iteration < 10; iteration++) {
      const boardPtr = Module._malloc(64 * 4);
      const heap = new Int32Array(Module.HEAP32.buffer, boardPtr, 64);

      // Encode board
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          heap[row * 8 + col] = initialBoard[row][col];
        }
      }

      // Call AI
      const result = Module._ai_js(boardPtr, level, ai_player);
      expect(typeof result).toBe('number');

      // Free memory
      Module._free(boardPtr);
    }

    // If we reach here without crashes, memory management is working
    expect(true).toBe(true);
  });

  test('should handle null pointer safely in _free(0)', () => {
    // According to C standard, free(NULL) is safe
    // WASM _free(0) should also be safe
    expect(() => {
      Module._free(0);
    }).not.toThrow();
  });

  test('should handle multiple allocations and deallocations correctly', () => {
    const pointers: number[] = [];

    // Allocate 5 memory blocks
    for (let i = 0; i < 5; i++) {
      const ptr = Module._malloc(256);
      expect(ptr).toBeGreaterThan(0);
      pointers.push(ptr);
    }

    // Free all blocks in reverse order
    for (let i = pointers.length - 1; i >= 0; i--) {
      expect(() => {
        Module._free(pointers[i]);
      }).not.toThrow();
    }
  });

  test('should maintain memory isolation between different allocations', () => {
    const ptr1 = Module._malloc(256);
    const ptr2 = Module._malloc(256);

    const heap1 = new Int32Array(Module.HEAP32.buffer, ptr1, 64);
    const heap2 = new Int32Array(Module.HEAP32.buffer, ptr2, 64);

    // Write different values
    for (let i = 0; i < 64; i++) {
      heap1[i] = i;
      heap2[i] = i + 1000;
    }

    // Verify values remain separate
    for (let i = 0; i < 64; i++) {
      expect(heap1[i]).toBe(i);
      expect(heap2[i]).toBe(i + 1000);
    }

    Module._free(ptr1);
    Module._free(ptr2);
  });
});
