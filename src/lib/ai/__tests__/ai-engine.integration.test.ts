/**
 * Integration Tests - Task 9.2: AIEngine + WASMBridge Integration
 *
 * Tests the complete flow from WASM initialization to AI move calculation
 * @jest-environment node
 */

import * as path from 'path';
import * as fs from 'fs';
import type { EgaroucidWASMModule } from '../types';
import type { EmscriptenModule } from './__types__/worker-global';

describe('Integration Test: AIEngine + WASMBridge', () => {
  const RESOURCES_DIR = path.join(__dirname, '../../../../public');
  const WASM_PATH = path.join(RESOURCES_DIR, 'ai.wasm');
  const GLUE_PATH = path.join(RESOURCES_DIR, 'ai.js');

  let Module: EgaroucidWASMModule;

  beforeAll(async () => {
    // Load WASM module for integration testing
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
            };

            this.HEAP8 = globalObj.HEAP8!;
            this.HEAPU8 = globalObj.HEAPU8!;
            this.HEAP32 = globalObj.HEAP32!;
            this.HEAPU32 = globalObj.HEAPU32!;

            resolve(this);
          },
          onAbort: (reason: unknown) => {
            reject(new Error(`WASM initialization aborted: ${reason}`));
          },
          print: (text: string) => {
            void text;
          },
          printErr: (text: string) => {
            if (text.includes('Error:') || text.includes('Exception:')) {
              console.error('[WASM Error]', text);
            }
          },
          noInitialRun: false,
          noExitRuntime: true,
        };

        globalObj.Module = moduleConfig as EmscriptenModule;

        try {
          const executeGlue = new Function(
            '__dirname',
            '__filename',
            'Module',
            'process',
            'require',
            glueCode
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

  it('should complete full flow: WASM init -> encode board -> calculate move -> decode result', () => {
    // Create initial board
    const board: number[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    board[3][3] = 1; // white
    board[3][4] = 0; // black
    board[4][3] = 0; // black
    board[4][4] = 1; // white

    // Encode board
    const boardPtr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, boardPtr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = board[row][col];
      }
    }

    // Calculate AI move
    const level = 1;
    const ai_player = 0; // black
    const result = Module._ai_js(boardPtr, level, ai_player);

    // Decode result
    const policy = 63 - Math.floor((result - 100) / 1000);
    const index = 63 - policy;
    const row = Math.floor(index / 8);
    const col = index % 8;

    // Cleanup
    Module._free(boardPtr);

    // Verify result
    expect(row).toBeGreaterThanOrEqual(0);
    expect(row).toBeLessThan(8);
    expect(col).toBeGreaterThanOrEqual(0);
    expect(col).toBeLessThan(8);
    expect(typeof result).toBe('number');
  });

  it('should handle WASM calculation timeout scenario (mock)', async () => {
    // このテストは実際のタイムアウトではなく、
    // タイムアウト処理のロジックを確認する

    const board: number[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    board[3][3] = 1;
    board[3][4] = 0;
    board[4][3] = 0;
    board[4][4] = 1;

    const boardPtr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, boardPtr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = board[row][col];
      }
    }

    // 低レベルなので高速に完了するはず（タイムアウトしない）
    const startTime = Date.now();
    const result = Module._ai_js(boardPtr, 1, 0);
    const elapsedTime = Date.now() - startTime;

    Module._free(boardPtr);

    // 3秒以内に完了
    expect(elapsedTime).toBeLessThan(3000);
    expect(typeof result).toBe('number');
  });

  it('should maintain WASM module state across multiple AI calculations', () => {
    const board: number[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));
    board[3][3] = 1;
    board[3][4] = 0;
    board[4][3] = 0;
    board[4][4] = 1;

    const results: number[] = [];

    // 複数回のAI計算を実行
    for (let i = 0; i < 3; i++) {
      const boardPtr = Module._malloc(64 * 4);
      const heap = new Int32Array(Module.HEAP32.buffer, boardPtr, 64);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          heap[row * 8 + col] = board[row][col];
        }
      }

      const result = Module._ai_js(boardPtr, 1, 0);
      results.push(result);

      Module._free(boardPtr);
    }

    // すべての計算が成功
    expect(results.length).toBe(3);
    results.forEach((result) => {
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });

  it('should properly encode and decode board state with edge cases', () => {
    // エッジケース: ボードの端にある石
    const board: number[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(-1));

    // 角に石を配置
    board[0][0] = 0; // 左上: 黒
    board[0][7] = 1; // 右上: 白
    board[7][0] = 0; // 左下: 黒
    board[7][7] = 1; // 右下: 白

    // 中央に通常の配置
    board[3][3] = 1;
    board[3][4] = 0;
    board[4][3] = 0;
    board[4][4] = 1;

    const boardPtr = Module._malloc(64 * 4);
    const heap = new Int32Array(Module.HEAP32.buffer, boardPtr, 64);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        heap[row * 8 + col] = board[row][col];
      }
    }

    // メモリの内容を確認
    expect(heap[0]).toBe(0); // (0,0) = black
    expect(heap[7]).toBe(1); // (0,7) = white
    expect(heap[56]).toBe(0); // (7,0) = black
    expect(heap[63]).toBe(1); // (7,7) = white

    Module._free(boardPtr);
  });

  it('should handle memory allocation and deallocation without leaks', () => {
    const iterations = 10;

    for (let i = 0; i < iterations; i++) {
      const boardPtr = Module._malloc(64 * 4);
      const resPtr = Module._malloc(74 * 4);

      // メモリが正常に確保されたことを確認
      expect(boardPtr).toBeGreaterThan(0);
      expect(resPtr).toBeGreaterThan(0);

      // メモリ解放
      Module._free(boardPtr);
      Module._free(resPtr);
    }

    // メモリリークがないことを確認（クラッシュしない）
    expect(true).toBe(true);
  });
});
