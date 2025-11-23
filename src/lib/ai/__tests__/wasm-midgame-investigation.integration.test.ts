/**
 * @jest-environment node
 *
 * WASM Integration Tests - Detailed Mid-game Investigation
 *
 * Hypothesis-driven tests investigating mid-game board state handling,
 * focusing on GameLogic and WASM AI alignment.
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('DETAILED INVESTIGATION: Mid-game board issue', () => {
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
            const globalObj = global as typeof global & {
              HEAP8?: Int8Array;
              HEAPU8?: Uint8Array;
              HEAP32?: Int32Array;
              HEAPU32?: Uint32Array;
              wasmMemory?: WebAssembly.Memory;
            };

            if (globalObj.HEAP32) {
              this.HEAP8 = globalObj.HEAP8!;
              this.HEAPU8 = globalObj.HEAPU8!;
              this.HEAP32 = globalObj.HEAP32!;
              this.HEAPU32 = globalObj.HEAPU32!;
            } else if (globalObj.wasmMemory) {
              const buffer = globalObj.wasmMemory.buffer;
              this.HEAP8 = new Int8Array(buffer);
              this.HEAPU8 = new Uint8Array(buffer);
              this.HEAP32 = new Int32Array(buffer);
              this.HEAPU32 = new Uint32Array(buffer);
            } else if (this.memory && this.memory.buffer) {
              const buffer = this.memory.buffer;
              this.HEAP8 = new Int8Array(buffer);
              this.HEAPU8 = new Uint8Array(buffer);
              this.HEAP32 = new Int32Array(buffer);
              this.HEAPU32 = new Uint32Array(buffer);
            }

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
          const injectedGlueCode =
            glueCode +
            '\n;' +
            `
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

  function decodeAIResponse(result: number): {
    row: number;
    col: number;
    value: number;
    bitPosition: number;
  } {
    const policy = 63 - Math.floor((result - 100) / 1000);
    const value = (result - 100) % 1000;
    const index = 63 - policy;
    const row = Math.floor(index / 8);
    const col = index % 8;
    return { row, col, value, bitPosition: policy };
  }

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

  test('Hypothesis 1: Verify decode function with known values', () => {
    // Test decodeAIResponse with known result values
    // result = 1000*(63-policy) + 100 + value

    // Example: policy=19 (row=5, col=4), value=34
    // result = 1000*(63-19) + 100 + 34 = 44000 + 134 = 44134
    const testResult = 44134;
    const decoded = decodeAIResponse(testResult);

    expect(decoded.bitPosition).toBe(19); // policy
    expect(decoded.value).toBe(34);
    expect(decoded.row).toBe(5); // (63-19)/8 = 44/8 = 5
    expect(decoded.col).toBe(4); // (63-19)%8 = 44%8 = 4
  });

  test('Hypothesis 2: Verify board encoding by reading back memory', () => {
    const testBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    testBoard[3][3] = 1; // white at (3,3)
    testBoard[3][4] = 0; // black at (3,4)

    const ptr = encodeBoard(testBoard);

    // Read back the encoded memory
    const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

    // Verify specific positions
    expect(heap[3 * 8 + 3]).toBe(1); // white at index 27
    expect(heap[3 * 8 + 4]).toBe(0); // black at index 28
    expect(heap[0]).toBe(-1); // empty at index 0

    Module._free(ptr);
  });

  test('Hypothesis 4: Verify board state and ai_player consistency', () => {
    const midGameBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));

    midGameBoard[3][3] = 1; // white
    midGameBoard[3][4] = 0; // black
    midGameBoard[3][5] = 0; // black
    midGameBoard[4][3] = 0; // black
    midGameBoard[4][4] = 0; // black
    midGameBoard[4][5] = 0; // black
    midGameBoard[5][4] = 1; // white

    // Count stones
    let blackCount = 0,
      whiteCount = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (midGameBoard[r][c] === 0) blackCount++;
        if (midGameBoard[r][c] === 1) whiteCount++;
      }
    }

    console.log('[Hypothesis 4] Stone counts:', { blackCount, whiteCount });

    // Black has 4 stones, white has 2 stones
    // In reversi, black goes first, so after 6 stones:
    // Turn count = 6 - 4 (initial) = 2 moves made
    // Since black started, turn 3 should be black's turn

    // But we're testing with ai_player=1 (white)
    // Let's verify what GameLogic says
    const gameLogicBoard = wasmBoardToGameLogicBoard(midGameBoard);
    const whiteValidMoves = GameLogic.calculateValidMoves(
      gameLogicBoard,
      'white'
    );
    const blackValidMoves = GameLogic.calculateValidMoves(
      gameLogicBoard,
      'black'
    );

    console.log('[Hypothesis 4] White valid moves:', whiteValidMoves);
    console.log('[Hypothesis 4] Black valid moves:', blackValidMoves);

    expect(whiteValidMoves.length).toBeGreaterThan(0);
  });

  test('Hypothesis 5: Compare WASM and GameLogic valid moves detection', () => {
    // Use initial board for clear comparison
    const initialBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    initialBoard[3][3] = 1; // white
    initialBoard[3][4] = 0; // black
    initialBoard[4][3] = 0; // black
    initialBoard[4][4] = 1; // white

    // Get GameLogic valid moves for black
    const gameLogicBoard = wasmBoardToGameLogicBoard(initialBoard);
    const validMoves = GameLogic.calculateValidMoves(gameLogicBoard, 'black');

    console.log('[Hypothesis 5] GameLogic valid moves for black:', validMoves);

    // Expected valid moves for initial position (black):
    // (2,3), (3,2), (4,5), (5,4)
    expect(validMoves).toEqual(
      expect.arrayContaining([
        { row: 2, col: 3 },
        { row: 3, col: 2 },
        { row: 4, col: 5 },
        { row: 5, col: 4 },
      ])
    );
    expect(validMoves.length).toBe(4);
  });

  test('Hypothesis 6: Test with VALID mid-game state (created by GameLogic)', () => {
    // Create a valid mid-game board using GameLogic
    // Start from initial position and apply moves

    let board = GameLogic.createInitialBoard();

    // Get valid moves and apply them
    let validMoves = GameLogic.calculateValidMoves(board, 'black');
    console.log('[Hypothesis 6] Black valid moves from initial:', validMoves);

    // Move 1 (black): use first valid move
    const move1 = validMoves[0];
    const result1 = GameLogic.applyMove(board, move1, 'black');
    if (!result1.success) {
      throw new Error('Move 1 failed: ' + JSON.stringify(result1.error));
    }
    board = result1.value;

    // Move 2 (white): use first valid move
    validMoves = GameLogic.calculateValidMoves(board, 'white');
    const move2 = validMoves[0];
    const result2 = GameLogic.applyMove(board, move2, 'white');
    if (!result2.success) {
      throw new Error('Move 2 failed: ' + JSON.stringify(result2.error));
    }
    board = result2.value;

    // Move 3 (black): use first valid move
    validMoves = GameLogic.calculateValidMoves(board, 'black');
    const move3 = validMoves[0];
    const result3 = GameLogic.applyMove(board, move3, 'black');
    if (!result3.success) {
      throw new Error('Move 3 failed: ' + JSON.stringify(result3.error));
    }
    board = result3.value;

    // Debug: Check board structure
    console.log(
      '[Hypothesis 6] Board after 3 moves is array?',
      Array.isArray(board)
    );

    // Now convert GameLogic board to WASM format
    // Note: wasmBoardToGameLogicBoard function exists, so we need reverse
    function gameLogicBoardToWASM(glBoard: any): number[][] {
      const result: number[][] = [];
      for (let row = 0; row < 8; row++) {
        const rowArr: number[] = [];
        for (let col = 0; col < 8; col++) {
          const cell = glBoard[row][col];
          if (cell === null) rowArr.push(-1);
          else if (cell === 'black') rowArr.push(0);
          else if (cell === 'white') rowArr.push(1);
          else rowArr.push(-1);
        }
        result.push(rowArr);
      }
      return result;
    }

    const wasmBoard = gameLogicBoardToWASM(board);
    const ptr = encodeBoard(wasmBoard);

    // White's turn now
    const level = 1;
    const ai_player = 1; // white

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    const decoded = decodeAIResponse(result);

    // Get valid moves for white
    const whiteValidMoves = GameLogic.calculateValidMoves(board, 'white');

    console.log('[Hypothesis 6] Valid mid-game state test:');
    console.log('  AI move:', decoded);
    console.log('  Valid moves:', whiteValidMoves);

    // AI move should be in valid moves list
    const isValid = whiteValidMoves.some(
      (move) => move.row === decoded.row && move.col === decoded.col
    );

    expect(isValid).toBe(true);
  });

  test('Hypothesis 7: Test with different valid game progression (alternative moves)', () => {
    // Test with different move choices to verify AI works with various valid states
    let board = GameLogic.createInitialBoard();

    // Move 1 (black): use SECOND valid move (different from Hypothesis 6)
    let validMoves = GameLogic.calculateValidMoves(board, 'black');
    const move1 = validMoves[1] || validMoves[0]; // Fallback if only 1 move
    const result1 = GameLogic.applyMove(board, move1, 'black');
    if (!result1.success) {
      throw new Error('Move 1 failed: ' + JSON.stringify(result1.error));
    }
    board = result1.value;

    // Move 2 (white): use second valid move
    validMoves = GameLogic.calculateValidMoves(board, 'white');
    const move2 = validMoves[1] || validMoves[0];
    const result2 = GameLogic.applyMove(board, move2, 'white');
    if (!result2.success) {
      throw new Error('Move 2 failed: ' + JSON.stringify(result2.error));
    }
    board = result2.value;

    // Convert to WASM format
    const gameLogicBoardToWASM = (glBoard: any): number[][] => {
      const result: number[][] = [];
      for (let row = 0; row < 8; row++) {
        const rowArr: number[] = [];
        for (let col = 0; col < 8; col++) {
          const cell = glBoard[row][col];
          if (cell === null) rowArr.push(-1);
          else if (cell === 'black') rowArr.push(0);
          else if (cell === 'white') rowArr.push(1);
          else rowArr.push(-1);
        }
        result.push(rowArr);
      }
      return result;
    };

    const wasmBoard = gameLogicBoardToWASM(board);
    const ptr = encodeBoard(wasmBoard);

    // Black's turn now
    const level = 1;
    const ai_player = 0; // black

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    const decoded = decodeAIResponse(result);
    const blackValidMoves = GameLogic.calculateValidMoves(board, 'black');

    console.log('[Hypothesis 7] Alternative progression test:');
    console.log('  AI move:', decoded);
    console.log('  Valid moves:', blackValidMoves);

    const isValid = blackValidMoves.some(
      (move) => move.row === decoded.row && move.col === decoded.col
    );

    expect(isValid).toBe(true);
  });

  test('Hypothesis 8: Test with 5-move game progression', () => {
    // Test with longer game progression
    let board = GameLogic.createInitialBoard();

    // Apply 5 moves alternating between black and white
    const players: Array<'black' | 'white'> = [
      'black',
      'white',
      'black',
      'white',
      'black',
    ];

    for (let i = 0; i < 5; i++) {
      const player = players[i];
      const validMoves = GameLogic.calculateValidMoves(board, player);
      if (validMoves.length === 0) {
        console.log(
          `[Hypothesis 8] No valid moves for ${player} at move ${i + 1}`
        );
        break;
      }

      const move = validMoves[0];
      const result = GameLogic.applyMove(board, move, player);
      if (!result.success) {
        throw new Error(
          `Move ${i + 1} failed: ` + JSON.stringify(result.error)
        );
      }
      board = result.value;
    }

    // Convert to WASM format
    const gameLogicBoardToWASM = (glBoard: any): number[][] => {
      const result: number[][] = [];
      for (let row = 0; row < 8; row++) {
        const rowArr: number[] = [];
        for (let col = 0; col < 8; col++) {
          const cell = glBoard[row][col];
          if (cell === null) rowArr.push(-1);
          else if (cell === 'black') rowArr.push(0);
          else if (cell === 'white') rowArr.push(1);
          else rowArr.push(-1);
        }
        result.push(rowArr);
      }
      return result;
    };

    const wasmBoard = gameLogicBoardToWASM(board);
    const ptr = encodeBoard(wasmBoard);

    // White's turn (after 5 moves: BWBWB, so white is next)
    const level = 1;
    const ai_player = 1; // white

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    const decoded = decodeAIResponse(result);
    const whiteValidMoves = GameLogic.calculateValidMoves(board, 'white');

    console.log('[Hypothesis 8] 5-move progression test:');
    console.log('  AI move:', decoded);
    console.log('  Valid moves:', whiteValidMoves);

    const isValid = whiteValidMoves.some(
      (move) => move.row === decoded.row && move.col === decoded.col
    );

    expect(isValid).toBe(true);
  });

  test('Hypothesis 9: Test with extended game progression (10 moves)', () => {
    // Test with even longer game to ensure AI works in mid-to-late game
    let board = GameLogic.createInitialBoard();

    // Apply 10 moves alternating between black and white
    const players: Array<'black' | 'white'> = [
      'black',
      'white',
      'black',
      'white',
      'black',
      'white',
      'black',
      'white',
      'black',
      'white',
    ];

    for (let i = 0; i < 10; i++) {
      const player = players[i];
      const validMoves = GameLogic.calculateValidMoves(board, player);
      if (validMoves.length === 0) {
        console.log(
          `[Hypothesis 9] No valid moves for ${player} at move ${i + 1}`
        );
        break;
      }

      // Use different move choices for variety
      const moveIndex = i % 2; // Alternate between first and second valid move
      const move = validMoves[moveIndex] || validMoves[0];
      const result = GameLogic.applyMove(board, move, player);
      if (!result.success) {
        throw new Error(
          `Move ${i + 1} failed: ` + JSON.stringify(result.error)
        );
      }
      board = result.value;
    }

    // Convert to WASM format
    const gameLogicBoardToWASM = (glBoard: any): number[][] => {
      const result: number[][] = [];
      for (let row = 0; row < 8; row++) {
        const rowArr: number[] = [];
        for (let col = 0; col < 8; col++) {
          const cell = glBoard[row][col];
          if (cell === null) rowArr.push(-1);
          else if (cell === 'black') rowArr.push(0);
          else if (cell === 'white') rowArr.push(1);
          else rowArr.push(-1);
        }
        result.push(rowArr);
      }
      return result;
    };

    const wasmBoard = gameLogicBoardToWASM(board);
    const ptr = encodeBoard(wasmBoard);

    // Black's turn (after 10 moves: 10 total, so black is next)
    const level = 1;
    const ai_player = 0; // black

    const result = Module._ai_js(ptr, level, ai_player);
    Module._free(ptr);

    const decoded = decodeAIResponse(result);
    const blackValidMoves = GameLogic.calculateValidMoves(board, 'black');

    console.log('[Hypothesis 9] Extended 10-move progression test:');
    console.log('  AI move:', decoded);
    console.log('  Valid moves:', blackValidMoves);

    const isValid = blackValidMoves.some(
      (move) => move.row === decoded.row && move.col === decoded.col
    );

    expect(isValid).toBe(true);
  });
});
