# ai-engine.integration.test.ts

## ファイル情報

- **テストファイル**: `src/lib/ai/__tests__/ai-engine.integration.test.ts`
- **テスト対象**: AIEngine + WASMBridgeの統合（Task 9.2）
- **テスト数**: 6
- **削除推奨テスト数**: 1

## テストケース一覧

### Test 1: should complete full flow: WASM init -> encode board -> calculate move -> decode result

- **元のテストタイトル**: should complete full flow: WASM init -> encode board -> calculate move -> decode result
- **日本語タイトル**: WASM初期化からボードエンコード、手計算、結果デコードまでの全フローを完了すること
- **テスト内容**: WASM初期化、ボードエンコード、AI手計算、結果デコードの完全な統合フローを検証
- **テストコード抜粋**:

  ```typescript
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
  const result = Module._ai_js(boardPtr, 1, 0);

  // Decode result
  const policy = 63 - Math.floor((result - 100) / 1000);
  const index = 63 - policy;
  const row = Math.floor(index / 8);
  const col = index % 8;

  Module._free(boardPtr);

  expect(row).toBeGreaterThanOrEqual(0);
  expect(row).toBeLessThan(8);
  expect(col).toBeGreaterThanOrEqual(0);
  expect(col).toBeLessThan(8);
  ```

- **期待値**:
  ```typescript
  expect(row).toBeGreaterThanOrEqual(0);
  expect(row).toBeLessThan(8);
  expect(col).toBeGreaterThanOrEqual(0);
  expect(col).toBeLessThan(8);
  expect(typeof result).toBe('number');
  ```
- **削除判定**: [ ] 不要

---

### Test 2: should handle WASM calculation timeout scenario (mock)

- **元のテストタイトル**: should handle WASM calculation timeout scenario (mock)
- **日本語タイトル**: WASMの計算タイムアウトシナリオを処理すること（モック）
- **テスト内容**: AI計算が3秒以内に完了することを確認（実際のタイムアウトではなくパフォーマンステスト）
- **テストコード抜粋**:

  ```typescript
  const startTime = Date.now();
  const result = Module._ai_js(boardPtr, 1, 0);
  const elapsedTime = Date.now() - startTime;

  Module._free(boardPtr);

  expect(elapsedTime).toBeLessThan(3000);
  expect(typeof result).toBe('number');
  ```

- **期待値**:
  ```typescript
  expect(elapsedTime).toBeLessThan(3000);
  expect(typeof result).toBe('number');
  ```
- **削除判定**: [ ] 不要

---

### Test 3: should handle WASM initialization failure (simulated via invalid module)

- **元のテストタイトル**: should handle WASM initialization failure (simulated via invalid module)
- **日本語タイトル**: WASMの初期化失敗を処理すること（無効なモジュールによるシミュレーション）
- **テスト内容**: WASM初期化失敗のシミュレーション（実際にはモジュールロード成功を確認するのみ）
- **テストコード抜粋**:

  ```typescript
  // WASMが正常にロードされていることを確認
  expect(Module).toBeDefined();
  expect(Module._ai_js).toBeDefined();

  // エラーハンドリングのロジックが存在することを確認
  // (実際のエラーは発生させない)
  expect(typeof Module._malloc).toBe('function');
  expect(typeof Module._free).toBe('function');
  ```

- **期待値**:
  ```typescript
  expect(Module).toBeDefined();
  expect(Module._ai_js).toBeDefined();
  expect(typeof Module._malloc).toBe('function');
  expect(typeof Module._free).toBe('function');
  ```
- **削除判定**: [x] 不要
- **削除理由**: テスト名は「初期化失敗を処理」だが、実際には単にモジュールロード成功を確認しているだけ。コメントにも「実際のWASMは既にロード済みなので、エラーハンドリングロジックの確認のみ」とあるが、実際にはエラーハンドリングをテストしていない。Module Loading tests (Task 5.1) で既にテスト済みの内容と完全に重複している。

---

### Test 4: should maintain WASM module state across multiple AI calculations

- **元のテストタイトル**: should maintain WASM module state across multiple AI calculations
- **日本語タイトル**: 複数のAI計算間でWASMモジュールの状態を維持すること
- **テスト内容**: 複数回のAI計算を連続で実行し、モジュール状態が正常に維持されることを確認
- **テストコード抜粋**:

  ```typescript
  const results: number[] = [];

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

  expect(results.length).toBe(3);
  results.forEach((result) => {
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });
  ```

- **期待値**:
  ```typescript
  expect(results.length).toBe(3);
  results.forEach((result) => {
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });
  ```
- **削除判定**: [ ] 不要

---

### Test 5: should properly encode and decode board state with edge cases

- **元のテストタイトル**: should properly encode and decode board state with edge cases
- **日本語タイトル**: エッジケースで盤面状態を正しくエンコード・デコードすること
- **テスト内容**: ボードの4隅に石を配置したエッジケースで正しくエンコードされることを確認
- **テストコード抜粋**:

  ```typescript
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

  expect(heap[0]).toBe(0); // (0,0) = black
  expect(heap[7]).toBe(1); // (0,7) = white
  expect(heap[56]).toBe(0); // (7,0) = black
  expect(heap[63]).toBe(1); // (7,7) = white
  ```

- **期待値**:
  ```typescript
  expect(heap[0]).toBe(0);
  expect(heap[7]).toBe(1);
  expect(heap[56]).toBe(0);
  expect(heap[63]).toBe(1);
  ```
- **削除判定**: [ ] 不要

---

### Test 6: should handle memory allocation and deallocation without leaks

- **元のテストタイトル**: should handle memory allocation and deallocation without leaks
- **日本語タイトル**: メモリリークなしでメモリの確保と解放を処理すること
- **テスト内容**: 10回の連続メモリ確保・解放でメモリリークが発生しないことを確認
- **テストコード抜粋**:

  ```typescript
  const iterations = 10;

  for (let i = 0; i < iterations; i++) {
    const boardPtr = Module._malloc(64 * 4);
    const resPtr = Module._malloc(74 * 4);

    expect(boardPtr).toBeGreaterThan(0);
    expect(resPtr).toBeGreaterThan(0);

    Module._free(boardPtr);
    Module._free(resPtr);
  }

  expect(true).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(boardPtr).toBeGreaterThan(0);
  expect(resPtr).toBeGreaterThan(0);
  // クラッシュしないことを確認
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 5件

このファイルは**AIEngine + WASMBridgeの統合テスト**（Task 9.2）であり、エンドツーエンドの統合フローを検証します。

**主要テストカテゴリ:**

- 完全統合フロー（1件）: 初期化から結果取得まで
- パフォーマンステスト（1件）: 計算時間検証
- 状態管理テスト（1件）: 複数計算での状態維持
- エッジケーステスト（1件）: 4隅の石エンコード
- メモリ管理テスト（1件）: メモリリーク検証

### 削除推奨テスト: 1件

**名前と実装の不一致（1件）:**

- Test 3: 「初期化失敗を処理」というテスト名だが、実際には単にモジュールロード成功を確認しているだけ。エラーハンドリングを全くテストしていない。Task 5.1のModule Loading testsと完全に重複。

### 推奨事項

このテストファイルは全体的に良好で、**削除推奨は1件のみ（約17%）**です。

統合テストは以下の理由で重要です：

- AIEngine + WASMBridge の統合フローの検証
- 実際の使用パターンでの動作確認
- メモリ管理とパフォーマンスの実環境検証

削除推奨のTest 3は、テスト名と実装が一致しておらず、既存の他のテストと重複しています。
