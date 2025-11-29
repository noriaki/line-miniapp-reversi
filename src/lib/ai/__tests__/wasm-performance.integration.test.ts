/**
 * @jest-environment node
 *
 * WASM Integration Tests - Performance and Timeout Handling
 *
 * Tests for performance requirements (3-second limit per level),
 * _stop() and _resume() control functions.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('Performance and Timeout Handling', () => {
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

  function encodeBoard(board: number[][]): number {
    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = board[row][col];
      }
    }
    return ptr;
  }

  const TARGET_TIME_MS = 3000; // 3 seconds per requirement

  test('should complete level 0 calculation within 3 seconds', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 0, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should complete level 1 calculation within 3 seconds', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 1, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should complete level 2 calculation within 3 seconds', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 2, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should complete level 3 calculation within 3 seconds', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 3, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should complete level 4 calculation within 3 seconds', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 4, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should complete level 5 calculation within 3 seconds', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 5, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should complete level 15 calculation within 3 seconds (production level)', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 15, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should calculate mid-game positions efficiently at level 3', () => {
    // Create mid-game scenario with more stones
    const midGameBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    midGameBoard[3][3] = 1;
    midGameBoard[3][4] = 0;
    midGameBoard[3][5] = 0;
    midGameBoard[4][3] = 0;
    midGameBoard[4][4] = 0;
    midGameBoard[4][5] = 0;
    midGameBoard[5][4] = 1;

    const ptr = encodeBoard(midGameBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 3, 1);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should calculate endgame positions efficiently at level 3', () => {
    // Create endgame scenario with most cells filled
    const endGameBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(0));
    endGameBoard[0][0] = -1;
    endGameBoard[0][1] = -1;
    endGameBoard[0][7] = 1;
    endGameBoard[7][7] = 1;

    const ptr = encodeBoard(endGameBoard);
    const startTime = Date.now();

    const result = Module._ai_js(ptr, 3, 0);

    const elapsedTime = Date.now() - startTime;
    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
    expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  });

  test('should expose callable _stop() function', () => {
    expect(Module._stop).toBeDefined();
    expect(typeof Module._stop).toBe('function');

    // Should not throw
    expect(() => {
      Module._stop();
    }).not.toThrow();
  });

  test('should expose callable _resume() function', () => {
    expect(Module._resume).toBeDefined();
    expect(typeof Module._resume).toBe('function');

    // Should not throw
    expect(() => {
      Module._resume();
    }).not.toThrow();
  });

  test('should support _stop() and _resume() sequence correctly', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    // Resume before test
    Module._resume();

    const ptr = encodeBoard(initialBoard);

    // Call stop (though it may not affect synchronous call in test environment)
    Module._stop();

    // Should still complete (stop mainly affects longer calculations)
    const result = Module._ai_js(ptr, 1, 0);

    // Resume for subsequent tests
    Module._resume();

    Module._free(ptr);

    expect(result).toBeGreaterThan(0);
  });
});
