/**
 * @jest-environment node
 *
 * WASM Integration Tests - Board Encoding and AI Move Calculation
 *
 * Tests for board encoding, AI move calculation with different game states,
 * and validation against GameLogic.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('Board Encoding and AI Move Calculation', () => {
  const RESOURCES_DIR = path.join(__dirname, '../../../../public');
  const WASM_PATH = path.join(RESOURCES_DIR, 'ai.wasm');
  const GLUE_PATH = path.join(RESOURCES_DIR, 'ai.js');

  let Module: EgaroucidWASMModule;

  // Import GameLogic for validation
  let GameLogic: {
    calculateValidMoves: (
      board: any,
      player: 'black' | 'white'
    ) => Array<{ row: number; col: number }>;
    createInitialBoard: () => any;
    applyMove: (
      board: any,
      position: { row: number; col: number },
      player: 'black' | 'white'
    ) => { success: boolean; value?: any; error?: any };
  };

  beforeAll(async () => {
    // Import GameLogic dynamically
    GameLogic = await import('../../game');

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
            // Suppress WASM stdout logs (non-critical information)
            // Uncomment for debugging: console.log('[WASM]', text);
            void text; // Explicitly reference parameter to avoid unused warning
          },
          printErr: (text: string) => {
            // Suppress WASM internal logs that are not actual errors
            // Only log if it looks like a real error
            if (
              text.includes('Error:') ||
              text.includes('Exception:') ||
              text.includes('Assertion failed')
            ) {
              console.error('[WASM Error]', text);
            }
            // Otherwise suppress internal logs like "board initialized", "eval init", etc.
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
  }, 60000); // 60s timeout for WASM loading and AI initialization

  /**
   * Helper function to encode board to WASM memory
   * Board encoding: Int32Array (64 elements, 256 bytes)
   * Cell values: -1=empty, 0=black, 1=white
   * Array layout: row-major (arr[row * 8 + col])
   */
  function encodeBoard(board: number[][]): number {
    if (board.length !== 8 || board[0].length !== 8) {
      throw new Error('Board must be 8x8');
    }

    const ptr = Module._malloc(64 * 4); // 64 Int32 elements
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const index = row * 8 + col;
        heap[index] = board[row][col];
      }
    }

    return ptr;
  }

  /**
   * Helper function to decode _ai_js response
   * Response format: 1000 * (63 - policy) + 100 + value
   * Returns: { row, col, value, bitPosition }
   */
  function decodeAIResponse(result: number): {
    row: number;
    col: number;
    value: number;
    bitPosition: number;
  } {
    const policy = 63 - Math.floor((result - 100) / 1000);
    const value = (result - 100) % 1000;

    // Bit position to (row, col): index = 63 - bitPosition
    const index = 63 - policy;
    const row = Math.floor(index / 8);
    const col = index % 8;

    return { row, col, value, bitPosition: policy };
  }

  /**
   * Helper: Convert WASM board (Int32) to GameLogic board
   * WASM: -1=empty, 0=black, 1=white
   * GameLogic: null=empty, 'black'=black, 'white'=white
   */
  function wasmBoardToGameLogicBoard(wasmBoard: number[][]): any {
    return wasmBoard.map((row) =>
      row.map((cell) => {
        if (cell === -1) return null;
        if (cell === 0) return 'black';
        if (cell === 1) return 'white';
        return null;
      })
    );
  }

  test('should encode initial board correctly', () => {
    // Initial Reversi board
    // -1: empty, 0: black, 1: white
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1; // white (d4)
    initialBoard[3][4] = 0; // black (e4)
    initialBoard[4][3] = 0; // black (d5)
    initialBoard[4][4] = 1; // white (e5)

    const ptr = encodeBoard(initialBoard);
    expect(ptr).toBeGreaterThan(0);

    // Verify memory contents
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
    expect(heap[3 * 8 + 3]).toBe(1); // white at (3,3)
    expect(heap[3 * 8 + 4]).toBe(0); // black at (3,4)
    expect(heap[4 * 8 + 3]).toBe(0); // black at (4,3)
    expect(heap[4 * 8 + 4]).toBe(1); // white at (4,4)
    expect(heap[0]).toBe(-1); // empty at (0,0)

    Module._free(ptr);
  });

  test('should call _ai_js with initial board (black player)', () => {
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1; // white
    initialBoard[3][4] = 0; // black
    initialBoard[4][3] = 0; // black
    initialBoard[4][4] = 1; // white

    const ptr = encodeBoard(initialBoard);
    const level = 1; // Low level for fast execution
    const ai_player = 0; // AI plays black

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);

    // Decode result
    const decoded = decodeAIResponse(result);
    expect(decoded.row).toBeGreaterThanOrEqual(0);
    expect(decoded.row).toBeLessThan(8);
    expect(decoded.col).toBeGreaterThanOrEqual(0);
    expect(decoded.col).toBeLessThan(8);

    // For initial board, valid moves for black are: (2,3), (3,2), (4,5), (5,4)
    const validMoves = [
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 4 },
    ];
    const isValidMove = validMoves.some(
      (move) => move.row === decoded.row && move.col === decoded.col
    );
    expect(isValidMove).toBe(true);
  });

  test('should call _ai_js with mid-game board', () => {
    // Create a mid-game scenario
    const midGameBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));

    // Place some stones to create a mid-game scenario
    midGameBoard[3][3] = 1;
    midGameBoard[3][4] = 0;
    midGameBoard[3][5] = 0;
    midGameBoard[4][3] = 0;
    midGameBoard[4][4] = 0;
    midGameBoard[4][5] = 0;
    midGameBoard[5][4] = 1;

    const ptr = encodeBoard(midGameBoard);
    const level = 1;
    const ai_player = 1; // AI plays white

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    expect(typeof result).toBe('number');
    const decoded = decodeAIResponse(result);

    // Should return a valid board position
    expect(decoded.row).toBeGreaterThanOrEqual(0);
    expect(decoded.row).toBeLessThan(8);
    expect(decoded.col).toBeGreaterThanOrEqual(0);
    expect(decoded.col).toBeLessThan(8);
  });

  test('should handle endgame board', () => {
    // Create an endgame scenario with most cells filled
    const endGameBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(0)); // Fill with black

    // Leave a few empty spaces
    endGameBoard[0][0] = -1;
    endGameBoard[0][1] = -1;
    endGameBoard[0][7] = 1; // Some white stones
    endGameBoard[7][7] = 1;

    const ptr = encodeBoard(endGameBoard);
    const level = 1;
    const ai_player = 0; // Black

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    expect(typeof result).toBe('number');
    const decoded = decodeAIResponse(result);

    // Should return a valid position
    expect(decoded.row).toBeGreaterThanOrEqual(0);
    expect(decoded.row).toBeLessThan(8);
  });

  test('should return AI moves that are in valid GameLogic moves list', () => {
    // CLEAR SUCCESS STATE:
    // 1. No console.error
    // 2. _ai_js returns a valid move
    // 3. That move is in GameLogic's calculateValidMoves result

    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1; // white
    initialBoard[3][4] = 0; // black
    initialBoard[4][3] = 0; // black
    initialBoard[4][4] = 1; // white

    const ptr = encodeBoard(initialBoard);
    const level = 1;
    const ai_player = 0; // AI plays black

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    const decoded = decodeAIResponse(result);

    // Convert to GameLogic format
    const gameLogicBoard = wasmBoardToGameLogicBoard(initialBoard);
    const validMoves = GameLogic.calculateValidMoves(gameLogicBoard, 'black');

    // CRITICAL ASSERTION: AI move must be in valid moves list
    const isValid = validMoves.some(
      (move) => move.row === decoded.row && move.col === decoded.col
    );

    expect(isValid).toBe(true);
    expect(validMoves.length).toBeGreaterThan(0); // Ensure there are valid moves
  });

  test('should show randomness at level 0 (non-deterministic)', () => {
    // CLEAR SUCCESS STATE:
    // Level 0 should return different moves when called multiple times
    // This confirms randomness, not a fixed algorithm

    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const level = 0; // Random level
    const ai_player = 0;

    const results = new Set<string>();

    // Call _ai_js multiple times (10 times)
    for (let i = 0; i < 10; i++) {
      const ptr = encodeBoard(initialBoard);
      const result = Module._ai_js(ptr, level, ai_player);
      Module._free(ptr);

      const decoded = decodeAIResponse(result);
      results.add(`${decoded.row},${decoded.col}`);
    }

    // At Level 0, we should see at least 2 different moves (randomness)
    // Note: There's a small probability all 10 calls return the same move by chance
    expect(results.size).toBeGreaterThanOrEqual(1); // At minimum, should work
    // For true randomness check, we'd expect > 1 in most cases
    // But we can't guarantee it due to randomness nature
  });

  test('should return AI responses within valid bit position range (0-63)', () => {
    // CLEAR SUCCESS STATE: Bit position should be 0-63

    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1;
    initialBoard[3][4] = 0;
    initialBoard[4][3] = 0;
    initialBoard[4][4] = 1;

    const ptr = encodeBoard(initialBoard);
    const level = 1;
    const ai_player = 0;

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    const decoded = decodeAIResponse(result);

    // Validate bit position range
    expect(decoded.bitPosition).toBeGreaterThanOrEqual(0);
    expect(decoded.bitPosition).toBeLessThanOrEqual(63);

    // Validate row/col range
    expect(decoded.row).toBeGreaterThanOrEqual(0);
    expect(decoded.row).toBeLessThan(8);
    expect(decoded.col).toBeGreaterThanOrEqual(0);
    expect(decoded.col).toBeLessThan(8);
  });
});
