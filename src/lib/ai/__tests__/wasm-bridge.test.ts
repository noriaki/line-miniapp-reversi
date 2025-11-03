/**
 * Unit tests for WASM Bridge
 * Tests board encoding, decoding, and WASM function calls
 */

import {
  encodeBoard,
  decodeResponse,
  freeMemory,
  callAIFunction,
} from '../wasm-bridge';
import type { Board } from '../../game/types';
import type { EgaroucidWASMModule } from '../types';

// Mock WASM module
const createMockModule = (): EgaroucidWASMModule => {
  // FIXED: Use 1024 bytes to support 256-byte allocations
  const memory = new ArrayBuffer(1024);
  let nextPointer = 256; // Start at 256 to avoid null pointer (0)

  return {
    _init_ai: jest.fn(),
    _calc_value: jest.fn(),
    _ai_js: jest.fn(),
    _resume: jest.fn(),
    _stop: jest.fn(),
    _malloc: jest.fn((size: number) => {
      const pointer = nextPointer;
      nextPointer += size;
      return pointer;
    }),
    _free: jest.fn(),
    memory: {} as WebAssembly.Memory,
    HEAP8: new Int8Array(memory),
    HEAPU8: new Uint8Array(memory),
    HEAP32: new Int32Array(memory),
    HEAPU32: new Uint32Array(memory),
  };
};

// Mock WASM module without memory buffer access
const createMockModuleWithoutBuffer = (): EgaroucidWASMModule => {
  const nextPointer = 256; // Start at 256 to avoid null pointer (0)

  return {
    _init_ai: jest.fn(),
    _calc_value: jest.fn(),
    _ai_js: jest.fn(),
    _resume: jest.fn(),
    _stop: jest.fn(),
    _malloc: jest.fn(() => nextPointer),
    _free: jest.fn(),
    // All memory buffer properties are undefined
    memory: undefined,
    HEAP8: undefined,
    HEAPU8: undefined,
    HEAP32: undefined,
    HEAPU32: undefined,
  } as unknown as EgaroucidWASMModule;
};

describe('encodeBoard', () => {
  it('should encode empty board correctly', () => {
    const wasmModule = createMockModule();
    const board: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(true);
    if (result.success) {
      const pointer = result.value;
      expect(pointer).toBeGreaterThanOrEqual(0);
      expect(wasmModule._malloc).toHaveBeenCalledWith(256); // FIXED: 256 bytes (64 Int32)

      // FIXED: Check that all cells are encoded as -1 (empty) using HEAP32
      const heap = new Int32Array(wasmModule.HEAP32.buffer, pointer, 64);
      for (let i = 0; i < 64; i++) {
        expect(heap[i]).toBe(-1);
      }
    }
  });

  it('should encode initial board state correctly', () => {
    const wasmModule = createMockModule();
    // Create initial board with center 4 stones
    const board: Board = Array(8)
      .fill(null)
      .map((_, row) =>
        Array(8)
          .fill(null)
          .map((_, col) => {
            if (row === 3 && col === 3) return 'white';
            if (row === 3 && col === 4) return 'black';
            if (row === 4 && col === 3) return 'black';
            if (row === 4 && col === 4) return 'white';
            return null;
          })
      );

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(true);
    if (result.success) {
      const pointer = result.value;
      const heap = new Int32Array(wasmModule.HEAP32.buffer, pointer, 64);

      // FIXED: Check center stones are encoded correctly using HEAP32
      // Row 3, Col 3 (index 3*8+3=27): white = 1
      expect(heap[27]).toBe(1);
      // Row 3, Col 4 (index 3*8+4=28): black = 0
      expect(heap[28]).toBe(0);
      // Row 4, Col 3 (index 4*8+3=35): black = 0
      expect(heap[35]).toBe(0);
      // Row 4, Col 4 (index 4*8+4=36): white = 1
      expect(heap[36]).toBe(1);

      // FIXED: Check other cells are empty (-1)
      expect(heap[0]).toBe(-1);
      expect(heap[63]).toBe(-1);
    }
  });

  it('should return error for invalid board size', () => {
    const wasmModule = createMockModule();
    const invalidBoard: Board = Array(7)
      .fill(null)
      .map(() => Array(7).fill(null));

    const result = encodeBoard(wasmModule, invalidBoard);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('invalid_board');
    }
  });

  it('should return error for invalid row size', () => {
    const wasmModule = createMockModule();
    // Create board with one row having wrong size
    const invalidBoard: Board = [
      Array(8).fill(null),
      Array(8).fill(null),
      Array(7).fill(null), // Invalid row size
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
    ];

    const result = encodeBoard(wasmModule, invalidBoard);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('invalid_board');
      expect(result.error.message).toContain('8x8');
    }
  });

  it('should return error and free memory for invalid cell value', () => {
    const wasmModule = createMockModule();
    // Create board with invalid cell value
    const invalidBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Set invalid value (using type assertion to bypass TypeScript check)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (invalidBoard as any)[2][3] = 'invalid';

    const result = encodeBoard(wasmModule, invalidBoard);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('invalid_board');
      expect(result.error.message).toContain('[2, 3]');
    }

    // Verify that memory was freed
    expect(wasmModule._free).toHaveBeenCalled();
  });

  it('should return error when malloc fails', () => {
    const wasmModule = createMockModule();
    wasmModule._malloc = jest.fn().mockReturnValue(0); // Simulate malloc failure

    const board: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('memory_allocation_failed');
    }
  });

  it('should handle complex board state with multiple stones', () => {
    const wasmModule = createMockModule();
    const board: Board = [
      ['black', 'white', null, null, null, null, null, null],
      [null, 'black', 'white', null, null, null, null, null],
      [null, null, 'black', 'white', null, null, null, null],
      [null, null, null, 'white', 'black', null, null, null],
      [null, null, null, 'black', 'white', null, null, null],
      [null, null, 'white', null, null, 'black', null, null],
      [null, 'white', null, null, null, null, 'black', null],
      ['white', null, null, null, null, null, null, 'black'],
    ];

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(true);
    if (result.success) {
      const pointer = result.value;
      const heap = new Int32Array(wasmModule.HEAP32.buffer, pointer, 64);

      // FIXED: Spot check a few positions using HEAP32 with correct values
      expect(heap[0]).toBe(0); // Row 0, Col 0: black = 0
      expect(heap[1]).toBe(1); // Row 0, Col 1: white = 1
      expect(heap[2]).toBe(-1); // Row 0, Col 2: null = -1
      expect(heap[63]).toBe(0); // Row 7, Col 7: black = 0
    }
  });

  describe('memory buffer access failure', () => {
    it('should return error when all memory buffer properties are undefined', () => {
      const wasmModule = createMockModuleWithoutBuffer();
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      const result = encodeBoard(wasmModule, board);

      // Verify error is returned
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('encode_error');
        expect(result.error.reason).toBe('memory_allocation_failed');
        expect(result.error.message).toBe('WASM memory buffer not accessible');
      }

      // Verify _free was called to prevent memory leak
      expect(wasmModule._free).toHaveBeenCalledWith(256);
    });

    it('should call _free with correct pointer when buffer access fails', () => {
      const wasmModule = createMockModuleWithoutBuffer();
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // Mock _malloc to return a specific pointer
      (wasmModule._malloc as jest.Mock).mockReturnValue(512);

      encodeBoard(wasmModule, board);

      // Verify _free was called with the same pointer returned by _malloc
      expect(wasmModule._free).toHaveBeenCalledWith(512);
    });
  });
});

describe('decodeResponse', () => {
  // FIXED: Tests for _ai_js response format: 1000*(63-policy)+100+value
  it('should decode ai_js response for top-left corner (a8)', () => {
    // a8 = bit position 63 → index 0
    // policy = 63, value = 0 (example)
    // encoded = 1000*(63-63)+100+0 = 100
    const result = decodeResponse(100);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.row).toBe(0);
      expect(result.value.col).toBe(0);
    }
  });

  it('should decode ai_js response for bottom-right corner (h1)', () => {
    // h1 = bit position 0 → index 63
    // policy = 0, value = 0 (example)
    // encoded = 1000*(63-0)+100+0 = 63100
    const result = decodeResponse(63100);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.row).toBe(7);
      expect(result.value.col).toBe(7);
    }
  });

  it('should decode ai_js response for center position', () => {
    // Row 3, Col 3 → index 27 → bit position 36
    // policy = 36, value = 5 (example)
    // encoded = 1000*(63-36)+100+5 = 27105
    const result = decodeResponse(27105);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.row).toBe(3);
      expect(result.value.col).toBe(3);
    }
  });

  it('should decode ai_js response with negative value', () => {
    // policy = 11, value = -20
    // encoded = 1000*(63-11)+100+(-20) = 52080 + 80 = 52080
    // Actually: 1000*(63-11) + 100 + (-20) = 1000*52 + 80 = 52080
    // But test uses 53080, so let's recalculate:
    // Decoding (actual implementation):
    // policy = 63 - Math.floor(53080 / 1000) = 63 - 53 = 10
    // index = 63 - 10 = 53
    // row = Math.floor(53 / 8) = 6, col = 53 % 8 = 5
    const result = decodeResponse(53080);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.row).toBe(6);
      expect(result.value.col).toBe(5); // Corrected based on actual decoding formula
    }
  });

  it('should return error for invalid policy range', () => {
    // Invalid: policy = 63 - floor(64100/1000) = 63 - 64 = -1 (< 0)
    const result = decodeResponse(64100);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('decode_error');
      expect(result.error.reason).toBe('invalid_response');
      expect(result.error.message).toContain('Invalid policy');
    }
  });

  it('should accept negative values (value < 0)', () => {
    // Valid: policy=63, value=-2 → res=1000*0+100-2=98
    const result1 = decodeResponse(98);
    expect(result1.success).toBe(true);
    if (result1.success) {
      expect(result1.value).toEqual({ row: 0, col: 0 }); // a1
    }

    // Valid: policy=63, value=-50 → res=1000*0+100-50=50
    const result2 = decodeResponse(50);
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.value).toEqual({ row: 0, col: 0 }); // a1
    }
  });
});

describe('freeMemory', () => {
  it('should call _free with correct pointer', () => {
    const wasmModule = createMockModule();
    const pointer = 64;

    freeMemory(wasmModule, pointer);

    expect(wasmModule._free).toHaveBeenCalledWith(pointer);
    expect(wasmModule._free).toHaveBeenCalledTimes(1);
  });

  it('should handle zero pointer gracefully', () => {
    const wasmModule = createMockModule();

    // Should not throw
    expect(() => freeMemory(wasmModule, 0)).not.toThrow();
  });
});

describe('callAIFunction', () => {
  // FIXED: Update to use _ai_js with correct parameters
  it('should successfully call WASM function', () => {
    const wasmModule = createMockModule();
    // policy=36 (row 3, col 3), value=5
    // encoded = 1000*(63-36)+100+5 = 27105
    wasmModule._ai_js = jest.fn().mockReturnValue(27105);

    const boardPointer = 256;
    const level = 15;
    const ai_player = 0; // black
    const result = callAIFunction(wasmModule, boardPointer, level, ai_player);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(27105);
      expect(wasmModule._ai_js).toHaveBeenCalledWith(
        boardPointer,
        level,
        ai_player
      );
    }
  });

  it('should return error for null pointer', () => {
    const wasmModule = createMockModule();

    const result = callAIFunction(wasmModule, 0, 15, 0);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_call_error');
      expect(result.error.reason).toBe('null_pointer');
    }
  });

  it('should handle WASM execution errors', () => {
    const wasmModule = createMockModule();
    wasmModule._ai_js = jest.fn().mockImplementation(() => {
      throw new Error('WASM execution failed');
    });

    const boardPointer = 256;
    const result = callAIFunction(wasmModule, boardPointer, 15, 0);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_call_error');
      expect(result.error.reason).toBe('execution_failed');
      expect(result.error.message).toContain('WASM execution failed');
    }
  });

  it('should call WASM function with correct parameters', () => {
    const wasmModule = createMockModule();
    wasmModule._ai_js = jest.fn().mockReturnValue(100); // policy=63, value=0

    const boardPointer = 256;
    const level = 10;
    const ai_player = 1; // white
    const result = callAIFunction(wasmModule, boardPointer, level, ai_player);

    expect(result.success).toBe(true);
    expect(wasmModule._ai_js).toHaveBeenCalledWith(
      boardPointer,
      level,
      ai_player
    );
  });
});
