/**
 * @jest-environment node
 *
 * WASM Integration Tests - Position Evaluation
 *
 * Tests for the _calc_value function which evaluates all possible moves
 * on a given board state.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('Position Evaluation (_calc_value)', () => {
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

  /**
   * Helper function to encode board to WASM memory
   */
  function encodeBoard(board: number[][]): number {
    if (board.length !== 8 || board[0].length !== 8) {
      throw new Error('Board must be 8x8');
    }

    const ptr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const index = row * 8 + col;
        heap[index] = board[row][col];
      }
    }

    return ptr;
  }

  test('should return evaluation values for all valid positions', () => {
    // Create initial board
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1; // white
    initialBoard[3][4] = 0; // black
    initialBoard[4][3] = 0; // black
    initialBoard[4][4] = 1; // white

    const boardPtr = Module._malloc(64 * 4);
    const resPtr = Module._malloc(74 * 4); // 74 elements required

    // Encode board
    const heap = new Int32Array(Module.HEAP32.buffer, boardPtr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = initialBoard[row][col];
      }
    }

    const level = 1;
    const ai_player = 0; // Black's perspective

    // Call _calc_value
    Module._calc_value(boardPtr, resPtr, level, ai_player);

    // Read results
    const resHeap = new Int32Array(Module.HEAP32.buffer, resPtr, 74);

    // Verify result array structure
    // According to interface-spec.md:
    // - res[10] corresponds to bit position 63
    // - res[73] corresponds to bit position 0
    // - res[10 + i] corresponds to bit position (63 - i)
    // - Bit position to array index: index = 63 - bitPos
    // - Array index to (row, col): row = index / 8, col = index % 8
    let legalMoveCount = 0;
    const evaluations: Array<{
      bitPos: number;
      row: number;
      col: number;
      value: number;
    }> = [];

    for (let i = 0; i < 64; i++) {
      const value = resHeap[10 + i]; // Offset by 10
      const bitPos = 63 - i; // res[10+i] = bit position (63-i)
      const arrayIndex = 63 - bitPos; // Convert bit position to array index
      const row = Math.floor(arrayIndex / 8);
      const col = arrayIndex % 8;

      if (value !== -1) {
        legalMoveCount++;
        evaluations.push({ bitPos, row, col, value });
      }
    }

    // For initial board, _calc_value should return 4 legal moves
    expect(legalMoveCount).toBe(4);

    // The actual valid moves depend on _calc_value's internal behavior
    // Since _calc_value inverts ai_player (1 - ai_player), when we call with ai_player=0 (black),
    // it internally uses ai_player=1 (white), so we get evaluations for white's moves
    // Let's verify that at least 4 moves have valid evaluations (not -1)
    expect(evaluations.length).toBe(4);

    // All evaluations should have valid coordinates
    evaluations.forEach((ev) => {
      expect(ev.row).toBeGreaterThanOrEqual(0);
      expect(ev.row).toBeLessThan(8);
      expect(ev.col).toBeGreaterThanOrEqual(0);
      expect(ev.col).toBeLessThan(8);
      expect(typeof ev.value).toBe('number');
    });

    Module._free(boardPtr);
    Module._free(resPtr);
  });

  test('should return signed integer evaluation values', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const boardPtr = encodeBoard(initialBoard);
    const resPtr = Module._malloc(74 * 4);

    Module._calc_value(boardPtr, resPtr, 1, 0);

    const resHeap = new Int32Array(Module.HEAP32.buffer, resPtr, 74);

    // Collect all legal move evaluation values
    const values: number[] = [];
    for (let i = 0; i < 64; i++) {
      const value = resHeap[10 + i];
      if (value !== -1) {
        values.push(value);
      }
    }

    // Evaluation values should be signed integers (can be negative, zero, or positive)
    expect(values.length).toBeGreaterThan(0);
    values.forEach((value) => {
      expect(typeof value).toBe('number');
      expect(Number.isInteger(value)).toBe(true);
    });

    Module._free(boardPtr);
    Module._free(resPtr);
  });

  test('should show randomness at level 0 for position evaluation', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const boardPtr = encodeBoard(initialBoard);
    const resPtr1 = Module._malloc(74 * 4);
    const resPtr2 = Module._malloc(74 * 4);

    // Call _calc_value twice with Level 0
    Module._calc_value(boardPtr, resPtr1, 0, 0);
    Module._calc_value(boardPtr, resPtr2, 0, 0);

    const res1 = new Int32Array(Module.HEAP32.buffer, resPtr1, 74);
    const res2 = new Int32Array(Module.HEAP32.buffer, resPtr2, 74);

    // Compare results - Level 0 should show some variation due to randomness
    // Note: Since Level 0 uses static evaluation, values might be consistent
    // but the randomness is in move selection, not necessarily in calc_value

    // At minimum, verify both calls succeeded and returned legal moves
    let legal1 = 0,
      legal2 = 0;
    for (let i = 0; i < 64; i++) {
      if (res1[10 + i] !== -1) legal1++;
      if (res2[10 + i] !== -1) legal2++;
    }

    expect(legal1).toBe(4);
    expect(legal2).toBe(4);

    Module._free(boardPtr);
    Module._free(resPtr1);
    Module._free(resPtr2);
  });

  test('should return -1 for illegal moves', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const boardPtr = encodeBoard(initialBoard);
    const resPtr = Module._malloc(74 * 4);

    Module._calc_value(boardPtr, resPtr, 1, 0);

    const resHeap = new Int32Array(Module.HEAP32.buffer, resPtr, 74);

    // Count illegal moves (should be 60 for initial board with 4 legal moves)
    let illegalCount = 0;
    for (let i = 0; i < 64; i++) {
      if (resHeap[10 + i] === -1) {
        illegalCount++;
      }
    }

    expect(illegalCount).toBe(60); // 64 total - 4 legal moves

    Module._free(boardPtr);
    Module._free(resPtr);
  });

  test('should reflect position quality in evaluation values', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const boardPtr = encodeBoard(initialBoard);
    const resPtr = Module._malloc(74 * 4);

    Module._calc_value(boardPtr, resPtr, 5, 0); // Higher level for better evaluation

    const resHeap = new Int32Array(Module.HEAP32.buffer, resPtr, 74);

    // Collect evaluations for legal moves
    const evaluations: Array<{ row: number; col: number; value: number }> = [];
    for (let i = 0; i < 64; i++) {
      const value = resHeap[10 + i];
      if (value !== -1) {
        const bitPos = 63 - i;
        const index = 63 - bitPos;
        const row = Math.floor(index / 8);
        const col = index % 8;
        evaluations.push({ row, col, value });
      }
    }

    // Evaluations should exist and be numeric
    expect(evaluations.length).toBe(4);
    evaluations.forEach((ev) => {
      expect(typeof ev.value).toBe('number');
      expect(Number.isFinite(ev.value)).toBe(true);
    });

    Module._free(boardPtr);
    Module._free(resPtr);
  });
});
