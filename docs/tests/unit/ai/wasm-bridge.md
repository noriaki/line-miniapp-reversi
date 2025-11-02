# wasm-bridge.test.ts

## ファイル情報

- **テストファイル**: `src/lib/ai/__tests__/wasm-bridge.test.ts`
- **テスト対象コード**: `src/lib/ai/wasm-bridge.ts`
- **テスト数**: 21
- **削除推奨テスト数**: 2

## テストケース一覧

### encodeBoard

#### Test 1: should encode empty board correctly

- **元のテストタイトル**: should encode empty board correctly
- **日本語タイトル**: 空の盤面を正しくエンコードすること
- **テスト内容**: 全てのマスが空の盤面を正しくWASM形式にエンコードできることを確認
- **テストコード抜粋**:

  ```typescript
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const result = encodeBoard(wasmModule, board);

  expect(result.success).toBe(true);
  if (result.success) {
    const pointer = result.value;
    expect(pointer).toBeGreaterThanOrEqual(0);
    expect(wasmModule._malloc).toHaveBeenCalledWith(256);

    const heap = new Int32Array(wasmModule.HEAP32.buffer, pointer, 64);
    for (let i = 0; i < 64; i++) {
      expect(heap[i]).toBe(-1);
    }
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(pointer).toBeGreaterThanOrEqual(0);
  expect(wasmModule._malloc).toHaveBeenCalledWith(256);
  expect(heap[i]).toBe(-1); // 全64マス
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should encode initial board state correctly

- **元のテストタイトル**: should encode initial board state correctly
- **日本語タイトル**: 初期盤面状態を正しくエンコードすること
- **テスト内容**: リバーシの初期配置（中央4石）が正しくWASM形式にエンコードされることを確認
- **テストコード抜粋**:

  ```typescript
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

    expect(heap[27]).toBe(1); // Row 3, Col 3: white = 1
    expect(heap[28]).toBe(0); // Row 3, Col 4: black = 0
    expect(heap[35]).toBe(0); // Row 4, Col 3: black = 0
    expect(heap[36]).toBe(1); // Row 4, Col 4: white = 1
    expect(heap[0]).toBe(-1);
    expect(heap[63]).toBe(-1);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(heap[27]).toBe(1);
  expect(heap[28]).toBe(0);
  expect(heap[35]).toBe(0);
  expect(heap[36]).toBe(1);
  expect(heap[0]).toBe(-1);
  expect(heap[63]).toBe(-1);
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should return error for invalid board size

- **元のテストタイトル**: should return error for invalid board size
- **日本語タイトル**: 無効な盤面サイズに対してエラーを返すこと
- **テスト内容**: 8x8でない盤面サイズの場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  const invalidBoard: Board = Array(7)
    .fill(null)
    .map(() => Array(7).fill(null));

  const result = encodeBoard(wasmModule, invalidBoard);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('encode_error');
    expect(result.error.reason).toBe('invalid_board');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('encode_error');
  expect(result.error.reason).toBe('invalid_board');
  ```
- **削除判定**: [ ] 不要
- **備考**: WASMインターフェースでは実行時検証が必要

---

#### Test 4: should return error for invalid row size

- **元のテストタイトル**: should return error for invalid row size
- **日本語タイトル**: 無効な行サイズに対してエラーを返すこと
- **テスト内容**: 一部の行が8列でない場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('encode_error');
  expect(result.error.reason).toBe('invalid_board');
  expect(result.error.message).toContain('8x8');
  ```
- **削除判定**: [ ] 不要
- **備考**: WASMインターフェースでは実行時検証が必要

---

#### Test 5: should return error and free memory for invalid cell value

- **元のテストタイトル**: should return error and free memory for invalid cell value
- **日本語タイトル**: 無効なセル値に対してエラーを返しメモリを解放すること
- **テスト内容**: 無効なセル値が含まれる場合、エラーを返し、かつ確保したメモリを解放することを確認
- **テストコード抜粋**:

  ```typescript
  const invalidBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  (invalidBoard as any)[2][3] = 'invalid';

  const result = encodeBoard(wasmModule, invalidBoard);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('encode_error');
    expect(result.error.reason).toBe('invalid_board');
    expect(result.error.message).toContain('[2, 3]');
  }

  expect(wasmModule._free).toHaveBeenCalled();
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('encode_error');
  expect(result.error.reason).toBe('invalid_board');
  expect(result.error.message).toContain('[2, 3]');
  expect(wasmModule._free).toHaveBeenCalled();
  ```
- **削除判定**: [ ] 不要
- **備考**: メモリリーク防止のための重要なテスト

---

#### Test 6: should return error when malloc fails

- **元のテストタイトル**: should return error when malloc fails
- **日本語タイトル**: mallocが失敗した場合にエラーを返すこと
- **テスト内容**: WASMのメモリ確保が失敗した場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false)
  expect(result.error.type).toBe('encode_error')
  expect(result.error.reason).toBe('memory_allocation_failed'
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should handle complex board state with multiple stones

- **元のテストタイトル**: should handle complex board state with multiple stones
- **日本語タイトル**: 複数の石を含む複雑な盤面状態を処理すること
- **テスト内容**: 多数の石が配置された複雑な盤面が正しくエンコードされることを確認
- **テストコード抜粋**:

  ```typescript
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

    expect(heap[0]).toBe(0); // Row 0, Col 0: black = 0
    expect(heap[1]).toBe(1); // Row 0, Col 1: white = 1
    expect(heap[2]).toBe(-1); // Row 0, Col 2: null = -1
    expect(heap[63]).toBe(0); // Row 7, Col 7: black = 0
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(heap[0]).toBe(0);
  expect(heap[1]).toBe(1);
  expect(heap[2]).toBe(-1);
  expect(heap[63]).toBe(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: WASMブリッジの信頼性確保のため、複雑なケースのテストも重要

---

### decodeResponse

#### Test 8: should decode ai_js response for top-left corner (a8)

- **元のテストタイトル**: should decode ai_js response for top-left corner (a8)
- **日本語タイトル**: 左上隅（a8）のai_jsレスポンスをデコードすること
- **テスト内容**: WASMからのレスポンス値を左上隅の座標に正しくデコードできることを確認
- **テストコード抜粋**:

  ```typescript
  // a8 = bit position 63 → index 0
  // policy = 63, value = 0 (example)
  // encoded = 1000*(63-63)+100+0 = 100
  const result = decodeResponse(100);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value.row).toBe(0);
    expect(result.value.col).toBe(0);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(result.value.row).toBe(0);
  expect(result.value.col).toBe(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: 境界値テスト

---

#### Test 9: should decode ai_js response for bottom-right corner (h1)

- **元のテストタイトル**: should decode ai_js response for bottom-right corner (h1)
- **日本語タイトル**: 右下隅（h1）のai_jsレスポンスをデコードすること
- **テスト内容**: WASMからのレスポンス値を右下隅の座標に正しくデコードできることを確認
- **テストコード抜粋**:

  ```typescript
  // h1 = bit position 0 → index 63
  // policy = 0, value = 0 (example)
  // encoded = 1000*(63-0)+100+0 = 63100
  const result = decodeResponse(63100);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value.row).toBe(7);
    expect(result.value.col).toBe(7);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(result.value.row).toBe(7);
  expect(result.value.col).toBe(7);
  ```
- **削除判定**: [ ] 不要
- **備考**: 境界値テスト

---

#### Test 10: should decode ai_js response for center position

- **元のテストタイトル**: should decode ai_js response for center position
- **日本語タイトル**: 中央位置のai_jsレスポンスをデコードすること
- **テスト内容**: WASMからのレスポンス値を中央付近の座標に正しくデコードできることを確認
- **テストコード抜粋**:

  ```typescript
  // Row 3, Col 3 → index 27 → bit position 36
  // policy = 36, value = 5 (example)
  // encoded = 1000*(63-36)+100+5 = 27105
  const result = decodeResponse(27105);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value.row).toBe(3);
    expect(result.value.col).toBe(3);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(result.value.row).toBe(3);
  expect(result.value.col).toBe(3);
  ```
- **削除判定**: [ ] 不要

---

#### Test 11: should decode ai_js response with negative value

- **元のテストタイトル**: should decode ai_js response with negative value
- **日本語タイトル**: 負の評価値を持つai_jsレスポンスをデコードすること
- **テスト内容**: 負の評価値を含むWASMレスポンスを正しくデコードできることを確認
- **テストコード抜粋**:

  ```typescript
  // policy = 63 - Math.floor(53080 / 1000) = 63 - 53 = 10
  // index = 63 - 10 = 53
  // row = Math.floor(53 / 8) = 6, col = 53 % 8 = 5
  const result = decodeResponse(53080);

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value.row).toBe(6);
    expect(result.value.col).toBe(5);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(result.value.row).toBe(6);
  expect(result.value.col).toBe(5);
  ```
- **削除判定**: [ ] 不要

---

#### Test 12: should return error for invalid policy range

- **元のテストタイトル**: should return error for invalid policy range
- **日本語タイトル**: 無効なポリシー範囲に対してエラーを返すこと
- **テスト内容**: 範囲外のポリシー値の場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  // Invalid: policy = 63 - floor(64100/1000) = 63 - 64 = -1 (< 0)
  const result = decodeResponse(64100);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('decode_error');
    expect(result.error.reason).toBe('invalid_response');
    expect(result.error.message).toContain('Invalid policy');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('decode_error');
  expect(result.error.reason).toBe('invalid_response');
  expect(result.error.message).toContain('Invalid policy');
  ```
- **削除判定**: [ ] 不要

---

#### Test 13: should accept negative values (value < 0)

- **元のテストタイトル**: should accept negative values (value < 0)
- **日本語タイトル**: 負の値（value < 0）を受け入れること
- **テスト内容**: 複数の負の評価値パターンを正しく処理できることを確認
- **テストコード抜粋**:

  ```typescript
  // Valid: policy=63, value=-2 → res=1000*0+100-2=98
  const result1 = decodeResponse(98);
  expect(result1.success).toBe(true);
  if (result1.success) {
    expect(result1.value).toEqual({ row: 0, col: 0 });
  }

  // Valid: policy=63, value=-50 → res=1000*0+100-50=50
  const result2 = decodeResponse(50);
  expect(result2.success).toBe(true);
  if (result2.success) {
    expect(result2.value).toEqual({ row: 0, col: 0 });
  }
  ```

- **期待値**:
  ```typescript
  expect(result1.success).toBe(true);
  expect(result1.value).toEqual({ row: 0, col: 0 });
  expect(result2.success).toBe(true);
  expect(result2.value).toEqual({ row: 0, col: 0 });
  ```
- **削除判定**: [x] 不要
- **削除理由**: Test 11で既に負の値のデコードをテストしている。複数の負の値パターンをテストすることに追加価値はない。重複テスト。

---

### freeMemory

#### Test 14: should call \_free with correct pointer

- **元のテストタイトル**: should call \_free with correct pointer
- **日本語タイトル**: 正しいポインタで\_freeを呼び出すこと
- **テスト内容**: WASMのメモリ解放関数が正しいポインタで呼ばれることを確認
- **テストコード抜粋**:

  ```typescript
  const wasmModule = createMockModule();
  const pointer = 64;

  freeMemory(wasmModule, pointer);

  expect(wasmModule._free).toHaveBeenCalledWith(pointer);
  expect(wasmModule._free).toHaveBeenCalledTimes(1);
  ```

- **期待値**:
  ```typescript
  expect(wasmModule._free).toHaveBeenCalledWith(pointer);
  expect(wasmModule._free).toHaveBeenCalledTimes(1);
  ```
- **削除判定**: [ ] 不要

---

#### Test 15: should handle zero pointer gracefully

- **元のテストタイトル**: should handle zero pointer gracefully
- **日本語タイトル**: ゼロポインタを適切に処理すること
- **テスト内容**: ヌルポインタ（0）でメモリ解放を呼んでもエラーにならないことを確認
- **テストコード抜粋**:

  ```typescript
  const wasmModule = createMockModule();

  expect(() => freeMemory(wasmModule, 0)).not.toThrow();
  ```

- **期待値**:
  ```typescript
  expect(() => freeMemory(wasmModule, 0)).not.toThrow();
  ```
- **削除判定**: [ ] 不要
- **備考**: エッジケースの安全性テスト

---

### callAIFunction

#### Test 16: should successfully call WASM function

- **元のテストタイトル**: should successfully call WASM function
- **日本語タイトル**: WASM関数を正常に呼び出すこと
- **テスト内容**: WASM AI関数を正しいパラメータで呼び出し、結果を取得できることを確認
- **テストコード抜粋**:

  ```typescript
  const wasmModule = createMockModule();
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
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(result.value).toBe(27105);
  expect(wasmModule._ai_js).toHaveBeenCalledWith(
    boardPointer,
    level,
    ai_player
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 17: should return error for null pointer

- **元のテストタイトル**: should return error for null pointer
- **日本語タイトル**: ヌルポインタに対してエラーを返すこと
- **テスト内容**: ヌルポインタ（0）でAI関数を呼んだ場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  const wasmModule = createMockModule();

  const result = callAIFunction(wasmModule, 0, 15, 0);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('wasm_call_error');
    expect(result.error.reason).toBe('null_pointer');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('wasm_call_error');
  expect(result.error.reason).toBe('null_pointer');
  ```
- **削除判定**: [ ] 不要

---

#### Test 18: should handle WASM execution errors

- **元のテストタイトル**: should handle WASM execution errors
- **日本語タイトル**: WASMの実行エラーを処理すること
- **テスト内容**: WASM関数の実行中にエラーが発生した場合、適切に処理することを確認
- **テストコード抜粋**:

  ```typescript
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
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('wasm_call_error');
  expect(result.error.reason).toBe('execution_failed');
  expect(result.error.message).toContain('WASM execution failed');
  ```
- **削除判定**: [ ] 不要

---

#### Test 19: should call WASM function with correct parameters

- **元のテストタイトル**: should call WASM function with correct parameters
- **日本語タイトル**: 正しいパラメータでWASM関数を呼び出すこと
- **テスト内容**: WASM AI関数が正しいパラメータで呼ばれることを確認
- **テストコード抜粋**:

  ```typescript
  const wasmModule = createMockModule();
  wasmModule._ai_js = jest.fn().mockReturnValue(100);

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
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(wasmModule._ai_js).toHaveBeenCalledWith(
    boardPointer,
    level,
    ai_player
  );
  ```
- **削除判定**: [x] 不要
- **削除理由**: Test 16で既に同じ内容をテストしている。パラメータが正しく渡されることの検証は重複している。

---

## サマリー

### 保持推奨テスト: 19件

このファイルは**WASMブリッジの重要なインターフェース**をテストしており、ほとんどのテストが保持すべきです。

**主要テストカテゴリ:**

- エンコードテスト（8件）: 盤面からWASM形式への変換
- デコードテスト（6件→5件）: WASMレスポンスから座標への変換
- メモリ管理テスト（2件）: メモリ解放の確認
- AI関数呼び出しテスト（4件→3件）: WASM関数呼び出しの検証

### 削除推奨テスト: 2件

**重複テスト（2件）:**

- Test 13: 負の値の複数パターンテスト（Test 11で既にカバー済み）
- Test 19: パラメータ検証テスト（Test 16で既にカバー済み）

### 推奨事項

このテストファイルは全体的に良好で、**削除推奨は2件のみ（約9.5%）**です。

WASMインターフェースは以下の理由で包括的なテストが重要です：

- TypeScriptの型チェックが効かない領域
- 実行時のメモリ管理が必要
- エラーハンドリングが複雑
- 境界値とエッジケースの検証が必須

削除推奨の2テストは明確な重複であり、削除しても品質に影響しません。
