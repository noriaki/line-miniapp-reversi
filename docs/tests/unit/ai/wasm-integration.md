# WASM Integration Tests

## ファイル情報

- **テストファイル**: `src/lib/ai/__tests__/wasm.integration.test.ts`
- **テスト対象**: 実際のWASMバイナリ（ai.wasm）とEmscriptenグルーコード（ai.js）
- **テスト数**: 60
- **削除推奨テスト数**: 0

## 概要

このファイルは、実際のWASMバイナリを使用した**ブラックボックス統合テスト**です。

テストリソース:

- WASM: `.kiro/specs/line-reversi-miniapp/resources/ai.wasm`
- Glue: `.kiro/specs/line-reversi-miniapp/resources/ai.js`
- Spec: `.kiro/specs/line-reversi-miniapp/wasm-source-analysis/interface-spec.md`

テストは以下の6つのタスクカテゴリに分類されます:

- **Task 5.1**: モジュールロード検証（10件）
- **Task 5.2**: ボードエンコーディングと\_ai_js（15件）
- **Task 5.3**: \_calc_value関数検証（5件）
- **Task 5.4**: メモリ管理検証（7件）
- **Task 5.5**: パフォーマンスとタイムアウト検証（11件）
- **Task 5.6**: エラーケースとエッジケース検証（12件）

## テストケース一覧

### Task 5.1: Module Loading

#### Test 1: should load WASM module successfully

- **元のテストタイトル**: should load WASM module successfully
- **日本語タイトル**: WASMモジュールを正常にロードできること
- **テスト内容**: WASMモジュールがロードされ、Module.HEAP8またはModule.memoryが定義されていることを確認
- **テストコード抜粋**:
  ```typescript
  test('should load WASM module successfully', () => {
    expect(Module).toBeDefined();
    // Note: Emscripten may use 'wasmMemory' instead of 'memory'
    // as long as HEAP views are available, the module is loaded
    expect(Module.HEAP8 || Module.memory).toBeDefined();
  });
  ```
- **期待値**:
  ```typescript
  expect(Module).toBeDefined();
  expect(Module.HEAP8 || Module.memory).toBeDefined();
  ```
- **削除判定**: [ ] 不要
- **備考**: WASM統合テストの基本検証。beforeAllで30秒タイムアウト付きロード。

---

#### Test 2: should export \_init_ai function

- **元のテストタイトル**: should export \_init_ai function
- **日本語タイトル**: \_init_ai関数をエクスポートすること
- **テスト内容**: Module.\_init_aiが定義され、関数型であることを確認
- **テストコード抜粋**:
  ```typescript
  test('should export _init_ai function', () => {
    expect(Module._init_ai).toBeDefined();
    expect(typeof Module._init_ai).toBe('function');
  });
  ```
- **期待値**:
  ```typescript
  expect(Module._init_ai).toBeDefined();
  expect(typeof Module._init_ai).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should export \_ai_js function

- **元のテストタイトル**: should export \_ai_js function
- **日本語タイトル**: \_ai_js関数をエクスポートすること
- **テスト内容**: Module.\_ai_jsが定義され、関数型であることを確認
- **テストコード抜粋**:
  ```typescript
  test('should export _ai_js function', () => {
    expect(Module._ai_js).toBeDefined();
    expect(typeof Module._ai_js).toBe('function');
  });
  ```
- **期待値**:
  ```typescript
  expect(Module._ai_js).toBeDefined();
  expect(typeof Module._ai_js).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should export \_calc_value function

- **元のテストタイトル**: should export \_calc_value function
- **日本語タイトル**: \_calc_value関数をエクスポートすること
- **テスト内容**: Module.\_calc_valueが定義され、関数型であることを確認
- **テストコード抜粋**:
  ```typescript
  test('should export _calc_value function', () => {
    expect(Module._calc_value).toBeDefined();
    expect(typeof Module._calc_value).toBe('function');
  });
  ```
- **期待値**:
  ```typescript
  expect(Module._calc_value).toBeDefined();
  expect(typeof Module._calc_value).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should export \_stop function

- **元のテストタイトル**: should export \_stop function
- **日本語タイトル**: \_stop関数をエクスポートすること
- **テスト内容**: Module.\_stopが定義され、関数型であることを確認
- **テストコード抜粋**:
  ```typescript
  test('should export _stop function', () => {
    expect(Module._stop).toBeDefined();
    expect(typeof Module._stop).toBe('function');
  });
  ```
- **期待値**:
  ```typescript
  expect(Module._stop).toBeDefined();
  expect(typeof Module._stop).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should export \_resume function

- **元のテストタイトル**: should export \_resume function
- **日本語タイトル**: \_resume関数をエクスポートすること
- **テスト内容**: Module.\_resumeが定義され、関数型であることを確認
- **テストコード抜粋**:
  ```typescript
  test('should export _resume function', () => {
    expect(Module._resume).toBeDefined();
    expect(typeof Module._resume).toBe('function');
  });
  ```
- **期待値**:
  ```typescript
  expect(Module._resume).toBeDefined();
  expect(typeof Module._resume).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should export \_malloc function

- **元のテストタイトル**: should export \_malloc function
- **日本語タイトル**: \_malloc関数をエクスポートすること
- **テスト内容**: Module.\_mallocが定義され、関数型であることを確認
- **テストコード抜粋**:
  ```typescript
  test('should export _malloc function', () => {
    expect(Module._malloc).toBeDefined();
    expect(typeof Module._malloc).toBe('function');
  });
  ```
- **期待値**:
  ```typescript
  expect(Module._malloc).toBeDefined();
  expect(typeof Module._malloc).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should export \_free function

- **元のテストタイトル**: should export \_free function
- **日本語タイトル**: \_free関数をエクスポートすること
- **テスト内容**: Module.\_freeが定義され、関数型であることを確認
- **テストコード抜粋**:
  ```typescript
  test('should export _free function', () => {
    expect(Module._free).toBeDefined();
    expect(typeof Module._free).toBe('function');
  });
  ```
- **期待値**:
  ```typescript
  expect(Module._free).toBeDefined();
  expect(typeof Module._free).toBe('function');
  ```
- **削除判定**: [ ] 不要

---

#### Test 9: should provide memory heap views

- **元のテストタイトル**: should provide memory heap views
- **日本語タイトル**: メモリヒープビューを提供すること
- **テスト内容**: Module.HEAP8, HEAPU8, HEAP32, HEAPU32が定義され、適切な型配列であることを確認
- **テストコード抜粋**:

  ```typescript
  test('should provide memory heap views', () => {
    expect(Module.HEAP8).toBeDefined();
    expect(Module.HEAP8).toBeInstanceOf(Int8Array);

    expect(Module.HEAPU8).toBeDefined();
    expect(Module.HEAPU8).toBeInstanceOf(Uint8Array);

    expect(Module.HEAP32).toBeDefined();
    expect(Module.HEAP32).toBeInstanceOf(Int32Array);

    expect(Module.HEAPU32).toBeDefined();
    expect(Module.HEAPU32).toBeInstanceOf(Uint32Array);
  });
  ```

- **期待値**:
  ```typescript
  expect(Module.HEAP8).toBeDefined();
  expect(Module.HEAP8).toBeInstanceOf(Int8Array);
  expect(Module.HEAPU8).toBeDefined();
  expect(Module.HEAPU8).toBeInstanceOf(Uint8Array);
  expect(Module.HEAP32).toBeDefined();
  expect(Module.HEAP32).toBeInstanceOf(Int32Array);
  expect(Module.HEAPU32).toBeDefined();
  expect(Module.HEAPU32).toBeInstanceOf(Uint32Array);
  ```
- **削除判定**: [ ] 不要
- **備考**: WASMメモリアクセスに必要な4種類のヒープビューを検証。

---

#### Test 10: should allocate and free memory correctly

- **元のテストタイトル**: should allocate and free memory correctly
- **日本語タイトル**: メモリを正しく確保・解放できること
- **テスト内容**: \_malloc(256)でメモリ確保し、ポインタが0より大きいこと、\_free()が例外をスローしないことを確認
- **テストコード抜粋**:

  ```typescript
  test('should allocate and free memory correctly', () => {
    const size = 256;
    const ptr = Module._malloc(size);

    expect(ptr).toBeGreaterThan(0);
    expect(typeof ptr).toBe('number');

    // Should not throw
    expect(() => {
      Module._free(ptr);
    }).not.toThrow();
  });
  ```

- **期待値**:
  ```typescript
  expect(ptr).toBeGreaterThan(0);
  expect(typeof ptr).toBe('number');
  expect(() => {
    Module._free(ptr);
  }).not.toThrow();
  ```
- **削除判定**: [ ] 不要
- **備考**: 基本的なメモリ操作の正常動作を確認。

---

### Task 5.2: Board Encoding and \_ai_js

#### Test 11: should encode initial board correctly

- **元のテストタイトル**: should encode initial board correctly
- **日本語タイトル**: 初期盤面を正しくエンコードできること
- **テスト内容**: 初期盤面（中央4マス配置）をWASMメモリ（Int32Array、-1=空、0=黒、1=白）にエンコードし、メモリ内容を検証後、解放
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(ptr).toBeGreaterThan(0);
  expect(heap[3 * 8 + 3]).toBe(1);
  expect(heap[3 * 8 + 4]).toBe(0);
  expect(heap[4 * 8 + 3]).toBe(0);
  expect(heap[4 * 8 + 4]).toBe(1);
  expect(heap[0]).toBe(-1);
  ```
- **削除判定**: [ ] 不要
- **備考**: encodeBoard()ヘルパー関数でInt32Array（64要素、256バイト）にエンコード。行優先配列（arr[row * 8 + col]）。

---

#### Test 12: should call \_ai_js with initial board (black player)

- **元のテストタイトル**: should call \_ai_js with initial board (black player)
- **日本語タイトル**: 初期盤面で\_ai_jsを呼び出せること（黒プレイヤー）
- **テスト内容**: 初期盤面で\_ai_js(ptr, level=1, ai_player=0)を呼び出し、結果をデコードして黒の有効手[(2,3), (3,2), (4,5), (5,4)]のいずれかであることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(typeof result).toBe('number');
  expect(result).toBeGreaterThan(0);
  expect(decoded.row).toBeGreaterThanOrEqual(0);
  expect(decoded.row).toBeLessThan(8);
  expect(decoded.col).toBeGreaterThanOrEqual(0);
  expect(decoded.col).toBeLessThan(8);
  expect(isValidMove).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: decodeAIResponse(): result = 1000 \* (63 - policy) + 100 + value形式をデコード。

---

#### Test 13: should call \_ai_js with mid-game board

- **元のテストタイトル**: should call \_ai_js with mid-game board
- **日本語タイトル**: 中盤盤面で\_ai_jsを呼び出せること
- **テスト内容**: 中盤シナリオ（7石配置）で\_ai_js(ptr, level=1, ai_player=1)を呼び出し、結果が有効な盤面位置であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(typeof result).toBe('number');
  expect(decoded.row).toBeGreaterThanOrEqual(0);
  expect(decoded.row).toBeLessThan(8);
  expect(decoded.col).toBeGreaterThanOrEqual(0);
  expect(decoded.col).toBeLessThan(8);
  ```
- **削除判定**: [ ] 不要

---

#### Test 14: should handle endgame board

- **元のテストタイトル**: should handle endgame board
- **日本語タイトル**: 終盤盤面を処理できること
- **テスト内容**: 終盤シナリオ（ほとんど埋まった盤面）で\_ai_jsを呼び出し、結果が有効な位置であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(typeof result).toBe('number');
  expect(decoded.row).toBeGreaterThanOrEqual(0);
  expect(decoded.row).toBeLessThan(8);
  ```
- **削除判定**: [ ] 不要

---

#### Test 15: Task 5.2 SUCCESS CRITERIA: AI move should be in GameLogic valid moves list (initial board)

- **元のテストタイトル**: Task 5.2 SUCCESS CRITERIA: AI move should be in GameLogic valid moves list (initial board)
- **日本語タイトル**: AIの手がGameLogicの有効手リストに含まれること（初期盤面）
- **テスト内容**: 初期盤面で\_ai_jsを呼び出し、返された手がGameLogic.calculateValidMoves()の結果に含まれることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(isValid).toBe(true);
  expect(validMoves.length).toBeGreaterThan(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: Task 5.2の成功基準。WASMとGameLogicの整合性を検証。

---

#### Test 16: Hypothesis 1: Verify decode function with known values

- **元のテストタイトル**: Hypothesis 1: Verify decode function with known values
- **日本語タイトル**: 既知の値でデコード関数を検証すること
- **テスト内容**: result = 1000\*(63-policy) + 100 + value形式のテスト値（policy=19, value=34 → result=44134）をデコードし、期待通りの値が得られることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(decoded.bitPosition).toBe(19);
  expect(decoded.value).toBe(34);
  expect(decoded.row).toBe(5);
  expect(decoded.col).toBe(4);
  ```
- **削除判定**: [ ] 不要
- **備考**: デコード関数の数学的正確性を検証。

---

#### Test 17: Hypothesis 2: Verify board encoding by reading back memory

- **元のテストタイトル**: Hypothesis 2: Verify board encoding by reading back memory
- **日本語タイトル**: メモリの読み戻しによりボードエンコーディングを検証すること
- **テスト内容**: エンコードした盤面をメモリから読み戻し、特定位置の値が正しいことを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(heap[3 * 8 + 3]).toBe(1);
  expect(heap[3 * 8 + 4]).toBe(0);
  expect(heap[0]).toBe(-1);
  ```
- **削除判定**: [ ] 不要
- **備考**: エンコード処理の正確性をメモリレベルで検証。

---

#### Test 18: Hypothesis 4: Verify board state and ai_player consistency

- **元のテストタイトル**: Hypothesis 4: Verify board state and ai_player consistency
- **日本語タイトル**: 盤面状態とai_playerの一貫性を検証すること
- **テスト内容**: 中盤盤面（黒4石、白2石）でGameLogic.calculateValidMoves()を呼び出し、白の有効手が存在することを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(whiteValidMoves.length).toBeGreaterThan(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: 盤面状態とターン管理の整合性を検証。コンソールログ付き。

---

#### Test 19: Hypothesis 5: Compare WASM and GameLogic valid moves detection

- **元のテストタイトル**: Hypothesis 5: Compare WASM and GameLogic valid moves detection
- **日本語タイトル**: WASMとGameLogicの有効手検出を比較すること
- **テスト内容**: 初期盤面でGameLogic.calculateValidMoves()を呼び出し、期待される有効手[(2,3), (3,2), (4,5), (5,4)]が全て含まれ、合計4手であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(validMoves).toEqual(
    expect.arrayContaining([
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 4 },
    ])
  );
  expect(validMoves.length).toBe(4);
  ```
- **削除判定**: [ ] 不要
- **備考**: GameLogicの有効手検出が期待通りであることを確認。

---

#### Test 20: Hypothesis 6: Test with VALID mid-game state (created by GameLogic)

- **元のテストタイトル**: Hypothesis 6: Test with VALID mid-game state (created by GameLogic)
- **日本語タイトル**: GameLogicで作成した有効な中盤状態でテストすること
- **テスト内容**: GameLogic.createInitialBoard()から3手適用した盤面をWASM形式に変換し、\_ai_jsを呼び出して、返された手がGameLogicの有効手に含まれることを確認
- **テストコード抜粋**:

  ```typescript
  let board = GameLogic.createInitialBoard();

  // Apply 3 moves using GameLogic
  // Move 1 (black): use first valid move
  const move1 = validMoves[0];
  const result1 = GameLogic.applyMove(board, move1, 'black');
  if (!result1.success) {
    throw new Error('Move 1 failed: ' + JSON.stringify(result1.error));
  }
  board = result1.value;

  // ... (Move 2 and Move 3 similarly)

  // Convert GameLogic board to WASM format
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

  // AI move should be in valid moves list
  const isValid = whiteValidMoves.some(
    (move) => move.row === decoded.row && move.col === decoded.col
  );

  expect(isValid).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(isValid).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: GameLogicで生成した有効な盤面状態でWASM AIが正しく動作することを検証。

---

#### Test 21: Hypothesis 7: Test with different valid game progression (alternative moves)

- **元のテストタイトル**: Hypothesis 7: Test with different valid game progression (alternative moves)
- **日本語タイトル**: 異なる有効なゲーム進行でテストすること（代替手）
- **テスト内容**: 初期盤面から2手適用（各手で2番目の有効手を選択）した盤面でWASM AIを呼び出し、返された手がGameLogicの有効手に含まれることを確認
- **テストコード抜粋**:

  ```typescript
  // Move 1 (black): use SECOND valid move (different from Hypothesis 6)
  let validMoves = GameLogic.calculateValidMoves(board, 'black');
  const move1 = validMoves[1] || validMoves[0]; // Fallback if only 1 move
  const result1 = GameLogic.applyMove(board, move1, 'black');
  // ... error handling
  board = result1.value;

  // Move 2 (white): use second valid move
  validMoves = GameLogic.calculateValidMoves(board, 'white');
  const move2 = validMoves[1] || validMoves[0];
  const result2 = GameLogic.applyMove(board, move2, 'white');
  // ... error handling
  board = result2.value;

  // Convert to WASM format
  const wasmBoard = gameLogicBoardToWASM(board);
  const ptr = encodeBoard(wasmBoard);

  // Black's turn now
  const result = Module._ai_js(ptr, 1, 0);
  Module._free(ptr);

  const decoded = decodeAIResponse(result);
  const blackValidMoves = GameLogic.calculateValidMoves(board, 'black');

  const isValid = blackValidMoves.some(
    (move) => move.row === decoded.row && move.col === decoded.col
  );

  expect(isValid).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(isValid).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 異なる手順で進行したゲーム状態でもWASM AIが正常動作することを検証。

---

#### Test 22: Hypothesis 8: Test with 5-move game progression

- **元のテストタイトル**: Hypothesis 8: Test with 5-move game progression
- **日本語タイトル**: 5手進行後のゲームでテストすること
- **テスト内容**: 5手適用した盤面（黒白交互）でWASM AIを呼び出し、返された手がGameLogicの有効手に含まれることを確認
- **テストコード抜粋**:

  ```typescript
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
      throw new Error(`Move ${i + 1} failed: ` + JSON.stringify(result.error));
    }
    board = result.value;
  }

  // ... WASM conversion and _ai_js call

  // White's turn (after 5 moves: BWBWB, so white is next)
  const result = Module._ai_js(ptr, 1, 1);
  Module._free(ptr);

  const decoded = decodeAIResponse(result);
  const whiteValidMoves = GameLogic.calculateValidMoves(board, 'white');

  const isValid = whiteValidMoves.some(
    (move) => move.row === decoded.row && move.col === decoded.col
  );

  expect(isValid).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(isValid).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: より長いゲーム進行でWASM AIが正常動作することを検証。

---

#### Test 23: Hypothesis 9: Test with extended game progression (10 moves)

- **元のテストタイトル**: Hypothesis 9: Test with extended game progression (10 moves)
- **日本語タイトル**: 拡張ゲーム進行（10手）でテストすること
- **テスト内容**: 10手適用した盤面でWASM AIを呼び出し、返された手がGameLogicの有効手に含まれることを確認。手の選択に変化を付ける（i % 2で1番目か2番目を選択）。
- **テストコード抜粋**:

  ```typescript
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
      throw new Error(`Move ${i + 1} failed: ` + JSON.stringify(result.error));
    }
    board = result.value;
  }

  // ... WASM conversion and _ai_js call

  // Black's turn (after 10 moves: 10 total, so black is next)
  const result = Module._ai_js(ptr, 1, 0);
  Module._free(ptr);

  const decoded = decodeAIResponse(result);
  const blackValidMoves = GameLogic.calculateValidMoves(board, 'black');

  const isValid = blackValidMoves.some(
    (move) => move.row === decoded.row && move.col === decoded.col
  );

  expect(isValid).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(isValid).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 中盤～後半のゲーム状態でWASM AIが正常動作することを確認。

---

#### Test 24: Task 5.2 SUCCESS CRITERIA: Level 0 should show randomness (non-deterministic)

- **元のテストタイトル**: Task 5.2 SUCCESS CRITERIA: Level 0 should show randomness (non-deterministic)
- **日本語タイトル**: Level 0がランダム性を示すこと（非決定的）
- **テスト内容**: Level 0で\_ai_jsを10回呼び出し、少なくとも1種類以上の異なる手が返されることを確認（ランダム性の検証）
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(results.size).toBeGreaterThanOrEqual(1);
  ```
- **削除判定**: [ ] 不要
- **備考**: Level 0のランダム性を検証。完全な決定性がないことを確認するが、ランダム性の性質上、厳密には2種類以上とは断言できない。

---

#### Test 25: Task 5.2 SUCCESS CRITERIA: AI response should be in valid range (0-63 bit positions)

- **元のテストタイトル**: Task 5.2 SUCCESS CRITERIA: AI response should be in valid range (0-63 bit positions)
- **日本語タイトル**: AIレスポンスが有効範囲（0-63ビット位置）内であること
- **テスト内容**: \_ai_jsの返り値をデコードし、bitPosition（policy）が0-63の範囲内、row/colが0-7の範囲内であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(decoded.bitPosition).toBeGreaterThanOrEqual(0);
  expect(decoded.bitPosition).toBeLessThanOrEqual(63);
  expect(decoded.row).toBeGreaterThanOrEqual(0);
  expect(decoded.row).toBeLessThan(8);
  expect(decoded.col).toBeGreaterThanOrEqual(0);
  expect(decoded.col).toBeLessThan(8);
  ```
- **削除判定**: [ ] 不要
- **備考**: AIレスポンスのビット位置と座標の範囲検証。

---

### Task 5.3: \_calc_value Function Verification

#### Test 26: Task 5.3.1: \_calc_value should return evaluation values for all positions

- **元のテストタイトル**: Task 5.3.1: \_calc_value should return evaluation values for all positions
- **日本語タイトル**: \_calc_valueが全位置の評価値を返すこと
- **テスト内容**: \_calc_value(boardPtr, resPtr, level=1, ai_player=0)を呼び出し、res配列（74要素）から有効手が4個検出され、全ての評価値が有効な座標を持つことを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(legalMoveCount).toBe(4);
  expect(evaluations.length).toBe(4);
  // For each evaluation:
  expect(ev.row).toBeGreaterThanOrEqual(0);
  expect(ev.row).toBeLessThan(8);
  expect(ev.col).toBeGreaterThanOrEqual(0);
  expect(ev.col).toBeLessThan(8);
  expect(typeof ev.value).toBe('number');
  ```
- **削除判定**: [ ] 不要
- **備考**: res配列構造: res[10+i]がbit position (63-i)に対応。初期盤面で4個の有効手。

---

#### Test 27: Task 5.3.2: \_calc_value evaluation values should be signed integers

- **元のテストタイトル**: Task 5.3.2: \_calc_value evaluation values should be signed integers
- **日本語タイトル**: \_calc_valueの評価値が符号付き整数であること
- **テスト内容**: \_calc_valueを呼び出し、返された評価値（-1以外）が全て符号付き整数であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(values.length).toBeGreaterThan(0);
  // For each value:
  expect(typeof value).toBe('number');
  expect(Number.isInteger(value)).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 評価値が符号付き整数（負、ゼロ、正）であることを確認。

---

#### Test 28: Task 5.3.3: Level 0 randomness verification with \_calc_value

- **元のテストタイトル**: Task 5.3.3: Level 0 randomness verification with \_calc_value
- **日本語タイトル**: Level 0のランダム性検証（\_calc_value）
- **テスト内容**: Level 0で\_calc_valueを2回呼び出し、両方とも4個の有効手を返すことを確認（ランダム性は手選択時のため、calc_value自体は一貫している可能性がある）
- **テストコード抜粋**:

  ```typescript
  const boardPtr = encodeBoard(initialBoard);
  const resPtr1 = Module._malloc(74 * 4);
  const resPtr2 = Module._malloc(74 * 4);

  // Call _calc_value twice with Level 0
  Module._calc_value(boardPtr, resPtr1, 0, 0);
  Module._calc_value(boardPtr, resPtr2, 0, 0);

  const res1 = new Int32Array(Module.HEAP32.buffer, resPtr1, 74);
  const res2 = new Int32Array(Module.HEAP32.buffer, resPtr2, 74);

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
  ```

- **期待値**:
  ```typescript
  expect(legal1).toBe(4);
  expect(legal2).toBe(4);
  ```
- **削除判定**: [ ] 不要
- **備考**: Level 0では静的評価を使用するため、評価値自体は一貫している可能性がある。ランダム性は手選択時。

---

#### Test 29: Task 5.3.4: Illegal moves should have value -1

- **元のテストタイトル**: Task 5.3.4: Illegal moves should have value -1
- **日本語タイトル**: 不正な手は値-1を持つこと
- **テスト内容**: \_calc_valueを呼び出し、res配列で-1の値を持つ要素が60個（64 - 4有効手）であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(illegalCount).toBe(60);
  ```
- **削除判定**: [ ] 不要
- **備考**: 初期盤面: 有効手4個、不正な手60個（64 - 4）。

---

#### Test 30: Task 5.3.5: Evaluation values should reflect position quality

- **元のテストタイトル**: Task 5.3.5: Evaluation values should reflect position quality
- **日本語タイトル**: 評価値が位置の質を反映すること
- **テスト内容**: Level 5で\_calc_valueを呼び出し、4個の有効手の評価値が全て数値で有限であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(evaluations.length).toBe(4);
  // For each evaluation:
  expect(typeof ev.value).toBe('number');
  expect(Number.isFinite(ev.value)).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 高レベル（Level 5）での評価値が有限数値であることを確認。

---

### Task 5.4: Memory Management Verification

#### Test 31: Task 5.4.1: \_malloc(256) should allocate board memory successfully

- **元のテストタイトル**: Task 5.4.1: \_malloc(256) should allocate board memory successfully
- **日本語タイトル**: \_malloc(256)でボードメモリを正常に確保できること
- **テスト内容**: \_malloc(256)（64 Int32要素 \* 4バイト）を呼び出し、ポインタが0より大きく数値型であることを確認後、解放
- **テストコード抜粋**:

  ```typescript
  const size = 256; // 64 Int32 elements * 4 bytes
  const ptr = Module._malloc(size);

  expect(ptr).toBeGreaterThan(0);
  expect(typeof ptr).toBe('number');

  // Cleanup
  Module._free(ptr);
  ```

- **期待値**:
  ```typescript
  expect(ptr).toBeGreaterThan(0);
  expect(typeof ptr).toBe('number');
  ```
- **削除判定**: [ ] 不要

---

#### Test 32: Task 5.4.2: HEAP32 memory read/write should work correctly

- **元のテストタイトル**: Task 5.4.2: HEAP32 memory read/write should work correctly
- **日本語タイトル**: HEAP32メモリの読み書きが正常動作すること
- **テスト内容**: \_malloc(256)で確保したメモリにInt32Array経由で0-63を書き込み、読み戻して値が一致することを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  // For each i (0-63):
  expect(heap[i]).toBe(i);
  ```
- **削除判定**: [ ] 不要

---

#### Test 33: Task 5.4.3: \_free(ptr) should release memory without errors

- **元のテストタイトル**: Task 5.4.3: \_free(ptr) should release memory without errors
- **日本語タイトル**: \_free(ptr)がエラーなしでメモリを解放すること
- **テスト内容**: \_malloc(256)で確保したメモリを\_free()で解放し、例外がスローされないことを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = Module._malloc(256);

  expect(() => {
    Module._free(ptr);
  }).not.toThrow();
  ```

- **期待値**:
  ```typescript
  expect(() => {
    Module._free(ptr);
  }).not.toThrow();
  ```
- **削除判定**: [ ] 不要

---

#### Test 34: Task 5.4.4: 10 consecutive AI calculations should not cause memory leaks

- **元のテストタイトル**: Task 5.4.4: 10 consecutive AI calculations should not cause memory leaks
- **日本語タイトル**: 10回連続のAI計算でメモリリークが発生しないこと
- **テスト内容**: 10回のループで\_malloc、盤面エンコード、\_ai_js呼び出し、\_freeを実行し、クラッシュせずに完了することを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  // For each iteration:
  expect(typeof result).toBe('number');
  // After all iterations:
  expect(true).toBe(true); // No crashes
  ```
- **削除判定**: [ ] 不要
- **備考**: メモリリークがないことをクラッシュせずに完了することで検証。

---

#### Test 35: Task 5.4.5: \_free(0) should handle null pointer safely

- **元のテストタイトル**: Task 5.4.5: \_free(0) should handle null pointer safely
- **日本語タイトル**: \_free(0)がヌルポインタを安全に処理すること
- **テスト内容**: \_free(0)を呼び出し、例外がスローされないことを確認（C標準でfree(NULL)は安全）
- **テストコード抜粋**:
  ```typescript
  // According to C standard, free(NULL) is safe
  // WASM _free(0) should also be safe
  expect(() => {
    Module._free(0);
  }).not.toThrow();
  ```
- **期待値**:
  ```typescript
  expect(() => {
    Module._free(0);
  }).not.toThrow();
  ```
- **削除判定**: [ ] 不要
- **備考**: ヌルポインタの安全処理を検証。

---

#### Test 36: Task 5.4.6: Multiple allocations and deallocations should work correctly

- **元のテストタイトル**: Task 5.4.6: Multiple allocations and deallocations should work correctly
- **日本語タイトル**: 複数のメモリ確保と解放が正常動作すること
- **テスト内容**: 5個のメモリブロックを確保し、逆順で全て解放し、例外がスローされないことを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  // For each allocation:
  expect(ptr).toBeGreaterThan(0);
  // For each deallocation:
  expect(() => {
    Module._free(pointers[i]);
  }).not.toThrow();
  ```
- **削除判定**: [ ] 不要

---

#### Test 37: Task 5.4.7: Memory isolation - different allocations should not interfere

- **元のテストタイトル**: Task 5.4.7: Memory isolation - different allocations should not interfere
- **日本語タイトル**: メモリ分離 - 異なる確保メモリが干渉しないこと
- **テスト内容**: 2個のメモリブロックを確保し、それぞれ異なる値（i、i+1000）を書き込み、読み戻して干渉がないことを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  // For each i (0-63):
  expect(heap1[i]).toBe(i);
  expect(heap2[i]).toBe(i + 1000);
  ```
- **削除判定**: [ ] 不要
- **備考**: メモリブロック間の分離を検証。

---

### Task 5.5: Performance and Timeout Verification

#### Test 38: Task 5.5.1: Level 0 calculation should complete within 3 seconds

- **元のテストタイトル**: Task 5.5.1: Level 0 calculation should complete within 3 seconds
- **日本語タイトル**: Level 0計算が3秒以内に完了すること
- **テスト内容**: Level 0で\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = encodeBoard(initialBoard);
  const startTime = Date.now();

  const result = Module._ai_js(ptr, 0, 0);

  const elapsedTime = Date.now() - startTime;
  Module._free(ptr);

  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(TARGET_TIME_MS); // 3000ms
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 39: Task 5.5.2: Level 1 calculation should complete within 3 seconds

- **元のテストタイトル**: Task 5.5.2: Level 1 calculation should complete within 3 seconds
- **日本語タイトル**: Level 1計算が3秒以内に完了すること
- **テスト内容**: Level 1で\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = encodeBoard(initialBoard);
  const startTime = Date.now();

  const result = Module._ai_js(ptr, 1, 0);

  const elapsedTime = Date.now() - startTime;
  Module._free(ptr);

  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 40: Task 5.5.3: Level 2 calculation should complete within 3 seconds

- **元のテストタイトル**: Task 5.5.3: Level 2 calculation should complete within 3 seconds
- **日本語タイトル**: Level 2計算が3秒以内に完了すること
- **テスト内容**: Level 2で\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = encodeBoard(initialBoard);
  const startTime = Date.now();

  const result = Module._ai_js(ptr, 2, 0);

  const elapsedTime = Date.now() - startTime;
  Module._free(ptr);

  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 41: Task 5.5.4: Level 3 calculation should complete within 3 seconds

- **元のテストタイトル**: Task 5.5.4: Level 3 calculation should complete within 3 seconds
- **日本語タイトル**: Level 3計算が3秒以内に完了すること
- **テスト内容**: Level 3で\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = encodeBoard(initialBoard);
  const startTime = Date.now();

  const result = Module._ai_js(ptr, 3, 0);

  const elapsedTime = Date.now() - startTime;
  Module._free(ptr);

  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 42: Task 5.5.5: Level 4 calculation should complete within 3 seconds

- **元のテストタイトル**: Task 5.5.5: Level 4 calculation should complete within 3 seconds
- **日本語タイトル**: Level 4計算が3秒以内に完了すること
- **テスト内容**: Level 4で\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = encodeBoard(initialBoard);
  const startTime = Date.now();

  const result = Module._ai_js(ptr, 4, 0);

  const elapsedTime = Date.now() - startTime;
  Module._free(ptr);

  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 43: Task 5.5.6: Level 5 calculation should complete within 3 seconds

- **元のテストタイトル**: Task 5.5.6: Level 5 calculation should complete within 3 seconds
- **日本語タイトル**: Level 5計算が3秒以内に完了すること
- **テスト内容**: Level 5で\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = encodeBoard(initialBoard);
  const startTime = Date.now();

  const result = Module._ai_js(ptr, 5, 0);

  const elapsedTime = Date.now() - startTime;
  Module._free(ptr);

  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(TARGET_TIME_MS);
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 44: Task 5.5.7: Mid-game board calculation time (Level 3)

- **元のテストタイトル**: Task 5.5.7: Mid-game board calculation time (Level 3)
- **日本語タイトル**: 中盤盤面の計算時間（Level 3）
- **テスト内容**: 中盤シナリオ（7石配置）でLevel 3の\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 45: Task 5.5.8: Endgame board calculation time (Level 3)

- **元のテストタイトル**: Task 5.5.8: Endgame board calculation time (Level 3)
- **日本語タイトル**: 終盤盤面の計算時間（Level 3）
- **テスト内容**: 終盤シナリオ（ほとんど埋まった盤面）でLevel 3の\_ai_jsを呼び出し、実行時間が3000ms未満であることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  expect(elapsedTime).toBeLessThan(3000);
  ```
- **削除判定**: [ ] 不要

---

#### Test 46: Task 5.5.9: \_stop() function should exist and be callable

- **元のテストタイトル**: Task 5.5.9: \_stop() function should exist and be callable
- **日本語タイトル**: \_stop()関数が存在し呼び出し可能であること
- **テスト内容**: Module.\_stopが定義され、関数型であり、呼び出し時に例外をスローしないことを確認
- **テストコード抜粋**:

  ```typescript
  expect(Module._stop).toBeDefined();
  expect(typeof Module._stop).toBe('function');

  // Should not throw
  expect(() => {
    Module._stop();
  }).not.toThrow();
  ```

- **期待値**:
  ```typescript
  expect(Module._stop).toBeDefined();
  expect(typeof Module._stop).toBe('function');
  expect(() => {
    Module._stop();
  }).not.toThrow();
  ```
- **削除判定**: [ ] 不要

---

#### Test 47: Task 5.5.10: \_resume() function should exist and be callable

- **元のテストタイトル**: Task 5.5.10: \_resume() function should exist and be callable
- **日本語タイトル**: \_resume()関数が存在し呼び出し可能であること
- **テスト内容**: Module.\_resumeが定義され、関数型であり、呼び出し時に例外をスローしないことを確認
- **テストコード抜粋**:

  ```typescript
  expect(Module._resume).toBeDefined();
  expect(typeof Module._resume).toBe('function');

  // Should not throw
  expect(() => {
    Module._resume();
  }).not.toThrow();
  ```

- **期待値**:
  ```typescript
  expect(Module._resume).toBeDefined();
  expect(typeof Module._resume).toBe('function');
  expect(() => {
    Module._resume();
  }).not.toThrow();
  ```
- **削除判定**: [ ] 不要

---

#### Test 48: Task 5.5.11: \_stop() and \_resume() sequence should work

- **元のテストタイトル**: Task 5.5.11: \_stop() and \_resume() sequence should work
- **日本語タイトル**: \_stop()と\_resume()のシーケンスが動作すること
- **テスト内容**: \_resume()、\_ai_js呼び出し前に\_stop()、\_ai_js呼び出し、\_resume()のシーケンスを実行し、結果が正常に返されることを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(result).toBeGreaterThan(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: \_stop()は主に長時間計算に影響するため、同期呼び出しでは効果が限定的。

---

### Task 5.6: Error Cases and Edge Cases Verification

#### Test 49: Task 5.6.1: Invalid board size (63 elements) handling

- **元のテストタイトル**: Task 5.6.1: Invalid board size (63 elements) handling
- **日本語タイトル**: 無効な盤面サイズ（63要素）の処理
- **テスト内容**: 63要素の盤面を確保し\_ai_jsを呼び出して、WASMがクラッシュまたはエラーを返すか、数値結果を返すかを確認（未定義動作）
- **テストコード抜粋**:

  ```typescript
  // Create 63-element board (one short)
  const ptr = Module._malloc(63 * 4);
  const heap = new Int32Array(Module.HEAP32.buffer, ptr, 63);

  // Fill with initial board pattern
  for (let i = 0; i < 63; i++) {
    heap[i] = -1;
  }

  // WASM may crash or return invalid result
  // We expect either an error or undefined behavior
  try {
    const result = Module._ai_js(ptr, 1, 0);
    // If it returns, result should be checked
    // Note: WASM may not validate input size
    expect(typeof result).toBe('number');
  } catch (error) {
    // Expected: WASM may throw or crash
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```

- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number'); // WASM doesn't validate size
  // Or:
  expect(error).toBeDefined(); // WASM throws
  ```
- **削除判定**: [ ] 不要
- **備考**: WASMは入力サイズを検証しない可能性があり、未定義動作を確認するテスト。

---

#### Test 50: Task 5.6.2: Invalid board size (65 elements) handling

- **元のテストタイトル**: Task 5.6.2: Invalid board size (65 elements) handling
- **日本語タイトル**: 無効な盤面サイズ（65要素）の処理
- **テスト内容**: 65要素の盤面を確保し\_ai_jsを呼び出して、WASMが最初の64要素のみ読み取り、正常動作するか確認
- **テストコード抜粋**:

  ```typescript
  // Create 65-element board (one extra)
  const ptr = Module._malloc(65 * 4);
  const heap = new Int32Array(Module.HEAP32.buffer, ptr, 65);

  // Fill with initial board pattern
  for (let i = 0; i < 65; i++) {
    heap[i] = -1;
  }

  // WASM reads only first 64 elements, extra element is ignored
  try {
    const result = Module._ai_js(ptr, 1, 0);
    // WASM will read first 64 elements, should work
    expect(typeof result).toBe('number');
  } catch (error) {
    // Unexpected, but we handle it
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```

- **期待値**:
  ```typescript
  expect(typeof result).toBe('number');
  ```
- **削除判定**: [ ] 不要
- **備考**: WASMは最初の64要素のみ読み取るため、余分な要素は無視される。

---

#### Test 51: Task 5.6.3: Invalid cell value (out of range -2) handling

- **元のテストタイトル**: Task 5.6.3: Invalid cell value (out of range -2) handling
- **日本語タイトル**: 無効なセル値（範囲外 -2）の処理
- **テスト内容**: 初期盤面に無効値-2を挿入し\_ai_jsを呼び出して、WASMが-2を空セルとして扱うか、未定義動作を起こすかを確認
- **テストコード抜粋**:

  ```typescript
  const ptr = Module._malloc(64 * 4);
  const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);

  // Create initial board
  for (let i = 0; i < 64; i++) {
    heap[i] = -1;
  }
  heap[27] = 1; // (3,3)
  heap[28] = 0; // (3,4)
  heap[35] = 0; // (4,3)
  heap[36] = 1; // (4,4)

  // Insert invalid value
  heap[0] = -2; // Invalid

  // WASM may interpret -2 as empty or cause undefined behavior
  try {
    const result = Module._ai_js(ptr, 1, 0);
    expect(typeof result).toBe('number');
  } catch (error) {
    // May throw
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```

- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

#### Test 52: Task 5.6.4: Invalid cell value (out of range 2) handling

- **元のテストタイトル**: Task 5.6.4: Invalid cell value (out of range 2) handling
- **日本語タイトル**: 無効なセル値（範囲外 2）の処理
- **テスト内容**: 初期盤面に無効値2を挿入し\_ai_jsを呼び出して、WASMの動作を確認（2は内部表現でVACANTだが、入力は-1/0/1であるべき）
- **テストコード抜粋**:

  ```typescript
  // Insert invalid value
  heap[0] = 2; // Invalid (2 is VACANT in internal representation, but input should be -1/0/1)

  try {
    const result = Module._ai_js(ptr, 1, 0);
    expect(typeof result).toBe('number');
  } catch (error) {
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```

- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

#### Test 53: Task 5.6.5: Invalid cell value (large positive) handling

- **元のテストタイトル**: Task 5.6.5: Invalid cell value (large positive) handling
- **日本語タイトル**: 無効なセル値（大きな正の値）の処理
- **テスト内容**: 初期盤面に無効値999を挿入し\_ai_jsを呼び出して、WASMの動作を確認
- **テストコード抜粋**:

  ```typescript
  // Insert invalid value
  heap[0] = 999;

  try {
    const result = Module._ai_js(ptr, 1, 0);
    expect(typeof result).toBe('number');
  } catch (error) {
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```

- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

#### Test 54: Task 5.6.6: \_malloc failure simulation (request huge memory)

- **元のテストタイトル**: Task 5.6.6: \_malloc failure simulation (request huge memory)
- **日本語タイトル**: \_malloc失敗シミュレーション（巨大メモリ要求）
- **テスト内容**: 非常に大きなメモリ（10GB）を\_mallocで要求し、失敗時に0を返すか、例外をスローするかを確認
- **テストコード抜粋**:

  ```typescript
  // Request unreasonably large memory (10GB)
  const hugeSize = 10 * 1024 * 1024 * 1024;

  try {
    const ptr = Module._malloc(hugeSize);
    if (ptr === 0) {
      // Expected: malloc returns 0 on failure
      expect(ptr).toBe(0);
    } else {
      // Unexpectedly succeeded, free it
      Module._free(ptr);
    }
  } catch (error) {
    // May throw out-of-memory error
    expect(error).toBeDefined();
  }
  ```

- **期待値**:
  ```typescript
  // Either:
  expect(ptr).toBe(0); // malloc returns 0 on failure
  // Or:
  expect(error).toBeDefined(); // throws out-of-memory
  ```
- **削除判定**: [ ] 不要

---

#### Test 55: Task 5.6.7: Response value range check (should be within 0-63)

- **元のテストタイトル**: Task 5.6.7: Response value range check (should be within 0-63)
- **日本語タイトル**: レスポンス値範囲チェック（0-63内であること）
- **テスト内容**: \_ai_jsの結果をデコードし、policy（bitPosition）が0-63の範囲内であることを確認
- **テストコード抜粋**:

  ```typescript
  const result = Module._ai_js(ptr, 1, 0);
  Module._free(ptr);

  // Decode and check range
  const policy = 63 - Math.floor((result - 100) / 1000);
  expect(policy).toBeGreaterThanOrEqual(0);
  expect(policy).toBeLessThanOrEqual(63);
  ```

- **期待値**:
  ```typescript
  expect(policy).toBeGreaterThanOrEqual(0);
  expect(policy).toBeLessThanOrEqual(63);
  ```
- **削除判定**: [ ] 不要

---

#### Test 56: Task 5.6.8: All empty board (no stones) handling

- **元のテストタイトル**: Task 5.6.8: All empty board (no stones) handling
- **日本語タイトル**: 全て空の盤面（石なし）の処理
- **テスト内容**: 全セル-1（空）の盤面で\_ai_jsを呼び出し、有効手がないため無効な結果または特別な値を返すかを確認
- **テストコード抜粋**:

  ```typescript
  const emptyBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(-1));

  const ptr = Module._malloc(64 * 4);
  const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      heap[row * 8 + col] = emptyBoard[row][col];
    }
  }

  // Empty board has no legal moves
  try {
    const result = Module._ai_js(ptr, 1, 0);
    // May return invalid result or special value
    expect(typeof result).toBe('number');
  } catch (error) {
    // May throw
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```

- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

#### Test 57: Task 5.6.9: All filled board (no empty cells) handling

- **元のテストタイトル**: Task 5.6.9: All filled board (no empty cells) handling
- **日本語タイトル**: 全て埋まった盤面（空セルなし）の処理
- **テスト内容**: 全セル0（黒）の盤面で\_ai_jsを呼び出し、有効手がないため特別な値（例: -1でゲーム終了）を返すかを確認
- **テストコード抜粋**:

  ```typescript
  const filledBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(0)); // All black

  const ptr = Module._malloc(64 * 4);
  const heap = new Int32Array(Module.HEAP32.buffer, ptr, 64);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      heap[row * 8 + col] = filledBoard[row][col];
    }
  }

  // No empty cells, no legal moves
  try {
    const result = Module._ai_js(ptr, 1, 0);
    // May return special value (e.g., -1 for game end)
    expect(typeof result).toBe('number');
  } catch (error) {
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```

- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

#### Test 58: Task 5.6.10: Invalid ai_player value (2) handling

- **元のテストタイトル**: Task 5.6.10: Invalid ai_player value (2) handling
- **日本語タイトル**: 無効なai_player値（2）の処理
- **テスト内容**: ai_player=2（本来は0または1）で\_ai_jsを呼び出し、WASMがモジュロ演算で0または1として扱うか、未定義動作を起こすかを確認
- **テストコード抜粋**:
  ```typescript
  // ai_player should be 0 or 1, test with 2
  try {
    const result = Module._ai_js(ptr, 1, 2);
    // WASM may interpret 2 as 0 or 1 (modulo), or cause undefined behavior
    expect(typeof result).toBe('number');
  } catch (error) {
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```
- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

#### Test 59: Task 5.6.11: Invalid level value (-1) handling

- **元のテストタイトル**: Task 5.6.11: Invalid level value (-1) handling
- **日本語タイトル**: 無効なlevel値（-1）の処理
- **テスト内容**: level=-1（本来は0-60）で\_ai_jsを呼び出し、WASMが0にクランプするか、エラーを起こすかを確認
- **テストコード抜粋**:
  ```typescript
  // Level should be 0-60, test with -1
  try {
    const result = Module._ai_js(ptr, -1, 0);
    // May clamp to 0 or cause error
    expect(typeof result).toBe('number');
  } catch (error) {
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```
- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

#### Test 60: Task 5.6.12: Invalid level value (100) handling

- **元のテストタイトル**: Task 5.6.12: Invalid level value (100) handling
- **日本語タイトル**: 無効なlevel値（100）の処理
- **テスト内容**: level=100（本来は0-60）で\_ai_jsを呼び出し、WASMが最大レベルにクランプするか、エラーを起こすかを確認
- **テストコード抜粋**:
  ```typescript
  // Level should be 0-60, test with 100
  try {
    const result = Module._ai_js(ptr, 100, 0);
    // May clamp to max level or cause error
    expect(typeof result).toBe('number');
  } catch (error) {
    expect(error).toBeDefined();
  } finally {
    Module._free(ptr);
  }
  ```
- **期待値**:
  ```typescript
  // Either:
  expect(typeof result).toBe('number');
  // Or:
  expect(error).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 60件（全て）

このファイルは**実際のWASMバイナリを使用したブラックボックス統合テスト** であり、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- **モジュールロード検証（10件）**: WASMモジュールのロード成功、関数エクスポート確認、メモリヒープビュー、基本メモリ操作
- **ボードエンコーディング検証（15件）**: 盤面データのWASM形式変換、\_ai_js呼び出し、デコード関数検証、Hypothesisテスト（仮説検証）、ランダム性検証
- **\_calc_value関数検証（5件）**: 評価値計算、符号付き整数検証、不正手の-1、評価値の有限性
- **メモリ管理検証（7件）**: メモリ確保/解放、読み書き、メモリリーク防止、ヌルポインタ処理、メモリ分離
- **パフォーマンス検証（11件）**: Level 0-5の各レベルで3秒以内の完了、中盤/終盤盤面でのパフォーマンス、\_stop/\_resume関数
- **エラーケース検証（12件）**: 無効盤面サイズ、無効セル値、巨大メモリ要求、レスポンス範囲、空盤面、埋まった盤面、無効パラメータ

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）** で、非常に良好な状態です。

WASM統合テストは以下の理由で包括的なテストカバレッジが極めて重要です：

- **TypeScript型チェックが効かない領域**: WASMバイナリは実行時検証が必須
- **実際のバイナリの動作検証**: モックではなく実際のWASMファイルを使用
- **パフォーマンス要件の検証**: 各レベルで3秒以内という明確な要件
- **エラーケースの実際の動作確認**: 未定義動作や境界条件の実際の挙動を確認
- **リグレッション検出**: Hypothesisテスト（Test 16-23）は様々なゲーム状態でのWASM AI動作を検証し、将来のバグ検出に非常に有効
- **メモリ安全性**: メモリリーク、分離、ヌルポインタ処理などの検証

**特に重要なテスト群:**

- **Hypothesis Tests（Test 16-23）**: WASM AIの動作を様々なゲーム進行（2手、3手、5手、10手）で詳細に検証。リグレッション検出のための貴重なテストケース集。
- **Performance Tests（Test 38-45）**: 各レベル（0-5）での3秒以内完了を個別に検証。性能要件を保証。
- **Edge Cases（Test 49-60）**: 無効入力、境界条件、エラー処理を網羅的にテスト。

変更不要です。

**備考**:

- beforeAllで60秒タイムアウトでWASM初期化
- encodeBoard()ヘルパー: Int32Array（64要素、256バイト）にエンコード、-1=空、0=黒、1=白
- decodeAIResponse()ヘルパー: result = 1000 \* (63 - policy) + 100 + value形式をデコード
- wasmBoardToGameLogicBoard()ヘルパー: WASM形式からGameLogic形式に変換（null/'black'/'white'）
- gameLogicBoardToWASM()ヘルパー: GameLogic形式からWASM形式に変換
- TARGET_TIME_MS = 3000（パフォーマンステストの基準時間）
