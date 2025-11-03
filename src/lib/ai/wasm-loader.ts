/// <reference lib="webworker" />

/**
 * WASM Loader
 * Handles loading and initialization of the Egaroucid WebAssembly module via Emscripten
 */

import type { EgaroucidWASMModule, WASMLoadError, Result } from './types';

// Web Worker global function declaration
declare function importScripts(...urls: string[]): void;

// Emscripten Module interface
interface EmscriptenModule extends EgaroucidWASMModule {
  onRuntimeInitialized?: () => void;
}

// Timeout for WASM initialization (10 seconds)
const INIT_TIMEOUT_MS = 10000;

/**
 * Load WASM module from the specified path using Emscripten glue code
 * @param wasmPath - Path to the WASM file (e.g., '/ai.wasm')
 * @returns Result with loaded WASM module or error
 */
export async function loadWASM(
  wasmPath: string
): Promise<Result<EgaroucidWASMModule, WASMLoadError>> {
  try {
    // Check if we're in a Web Worker context
    if (typeof importScripts === 'undefined') {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message:
            'importScripts is not available. WASM loader must run in a Web Worker context.',
        },
      };
    }

    // Derive ai.js path from ai.wasm path
    // Examples: '/ai.wasm' -> '/ai.js', '/path/to/ai.wasm' -> '/path/to/ai.js'
    const jsPath = wasmPath.replace(/\.wasm$/, '.js');

    // Convert to absolute URL for importScripts
    // importScripts requires absolute URLs in Web Worker context
    // Use origin instead of self.location.href to handle blob: URLs correctly
    const origin = self.location.origin;
    const absoluteJsUrl = origin + jsPath;
    const absoluteWasmUrl = origin + wasmPath;

    // Pre-configure Emscripten Module to override locateFile
    // This ensures that ai.wasm is always loaded from the correct path,
    // regardless of where ai.js is served from
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).Module = {
      locateFile: (path: string) => {
        // For ai.wasm, always use the absolute wasmPath
        if (path === 'ai.wasm') {
          return absoluteWasmUrl;
        }
        // For other files, return as-is
        return path;
      },
    };

    try {
      // Load Emscripten glue code (ai.js)
      // This will merge with the pre-configured Module object
      importScripts(absoluteJsUrl);
    } catch (importError) {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message:
            importError instanceof Error
              ? `Failed to load Emscripten glue code: ${importError.message}`
              : 'Failed to load Emscripten glue code',
        },
      };
    }

    // Check if Module object exists after loading ai.js
    // Note: _malloc, _free, etc. are not available yet - they will be set after WASM initialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Module = (self as any).Module as EmscriptenModule | undefined;

    if (!Module) {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'instantiation_failed',
          message:
            'Emscripten Module not found after loading ai.js. Check if ai.js is a valid Emscripten output.',
        },
      };
    }

    // Wait for Emscripten runtime initialization
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WASM runtime initialization timeout'));
      }, INIT_TIMEOUT_MS);

      // Set the callback
      Module.onRuntimeInitialized = () => {
        // In Web Worker context, Emscripten creates HEAP views as global variables
        // We need to copy them to the Module object for our code to access them
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalScope = self as any;
        Module.HEAP8 = globalScope.HEAP8;
        Module.HEAPU8 = globalScope.HEAPU8;
        Module.HEAP32 = globalScope.HEAP32;
        Module.HEAPU32 = globalScope.HEAPU32;
        Module.memory = globalScope.wasmMemory || {
          buffer: Module.HEAP8?.buffer,
        };

        clearTimeout(timeout);
        resolve();
      };

      // In case runtime is already initialized before we set the callback
      // This handles the edge case where Emscripten initializes synchronously
      if (typeof Module._malloc === 'function') {
        clearTimeout(timeout);
        resolve();
      }
    });

    // After runtime initialization, verify that required functions are available
    if (
      typeof Module._malloc !== 'function' ||
      typeof Module._free !== 'function'
    ) {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'instantiation_failed',
          message:
            'Required WASM functions (_malloc, _free) not found after runtime initialization.',
        },
      };
    }

    // Initialize AI
    if (typeof Module._init_ai === 'function') {
      Module._init_ai();
    }

    return {
      success: true,
      value: Module as EgaroucidWASMModule,
    };
  } catch (error) {
    // Handle timeout or unexpected errors
    if (
      error instanceof Error &&
      error.message.includes('initialization timeout')
    ) {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'initialization_timeout',
          message: `WASM runtime initialization timed out after ${INIT_TIMEOUT_MS}ms`,
        },
      };
    }

    return {
      success: false,
      error: {
        type: 'wasm_load_error',
        reason: 'instantiation_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check if WASM module is ready to use
 * @param module - WASM module to check
 * @returns True if module has all required functions
 */
export function isModuleReady(
  module: EgaroucidWASMModule | null | undefined
): module is EgaroucidWASMModule {
  if (!module) {
    return false;
  }

  // Check for required functions
  return (
    typeof module._calc_value === 'function' &&
    typeof module._malloc === 'function' &&
    typeof module._free === 'function' &&
    typeof module._init_ai === 'function'
  );
}
