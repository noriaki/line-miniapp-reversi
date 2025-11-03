/**
 * Emscripten module test fixtures
 * テストで使用するEmscriptenモジュールのモックオブジェクト
 */
import type { EgaroucidWASMModule } from '../../types';

export interface MockEmscriptenModule extends EgaroucidWASMModule {
  onRuntimeInitialized?: () => void;
}

export interface EmscriptenModuleOptions {
  heapSize?: number;
}

/**
 * Create a mock Emscripten module for testing
 *
 * @param options - Configuration options
 * @param options.heapSize - Size of HEAP arrays (default: 64 bytes)
 * @returns Mock Emscripten module with all required functions and HEAP views
 *
 * @example
 * ```typescript
 * const mockModule = createEmscriptenModule({ heapSize: 128 });
 * ```
 */
export function createEmscriptenModule(
  options: EmscriptenModuleOptions = {}
): MockEmscriptenModule {
  const heapSize = options.heapSize ?? 64;

  return {
    _init_ai: jest.fn(),
    _ai_js: jest.fn(),
    _calc_value: jest.fn(),
    _resume: jest.fn(),
    _stop: jest.fn(),
    _malloc: jest.fn(),
    _free: jest.fn(),
    memory: {} as WebAssembly.Memory,
    HEAP8: new Int8Array(heapSize),
    HEAPU8: new Uint8Array(heapSize),
    HEAP32: new Int32Array(heapSize / 4),
    HEAPU32: new Uint32Array(heapSize / 4),
    onRuntimeInitialized: undefined,
  };
}
