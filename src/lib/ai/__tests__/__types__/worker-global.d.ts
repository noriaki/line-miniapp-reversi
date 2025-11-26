/**
 * Web Worker環境のグローバル型定義（テスト専用）
 *
 * このファイルはテストコードでのWeb Worker環境のモックに型安全性を提供します。
 */

import type { EgaroucidWASMModule } from '../../types';

/**
 * Emscripten Module with runtime initialization callback
 */
export interface EmscriptenModule extends EgaroucidWASMModule {
  onRuntimeInitialized?: () => void;
  locateFile?: (path: string) => string;
  wasmBinary?: ArrayBuffer;
  thisProgram?: string;
  onAbort?: (reason: unknown) => void;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
  noInitialRun?: boolean;
  noExitRuntime?: boolean;
}

declare global {
  /**
   * Web Worker constructor (available in browser/jsdom environment)
   */
  var Worker: typeof Worker | undefined;

  /**
   * Web Worker's importScripts function
   */
  var importScripts: ((...urls: string[]) => void) | undefined;

  /**
   * Emscripten Module object
   */
  var Module: EmscriptenModule | undefined;

  /**
   * HEAP views (created by Emscripten in Web Worker context)
   */
  var HEAP8: Int8Array | undefined;
  var HEAPU8: Uint8Array | undefined;
  var HEAP32: Int32Array | undefined;
  var HEAPU32: Uint32Array | undefined;

  /**
   * WebAssembly Memory
   */
  var wasmMemory: WebAssembly.Memory | undefined;

  /**
   * Web Worker self object
   */
  var self:
    | {
        location: {
          origin: string;
          href: string;
        };
      }
    | undefined;
}

export {};
