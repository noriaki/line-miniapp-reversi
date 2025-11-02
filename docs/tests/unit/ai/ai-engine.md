# ai-engine.test.ts

## ファイル情報

- **テストファイル**: `src/lib/ai/__tests__/ai-engine.test.ts`
- **テスト対象コード**: `src/lib/ai/ai-engine.ts`
- **テスト数**: 11
- **削除推奨テスト数**: 0

## テストケース一覧

### constructor

#### Test 1: should accept custom worker path

- **元のテストタイトル**: should accept custom worker path
- **日本語タイトル**: カスタムワーカーパスを受け入れること
- **テスト内容**: AIEngineがカスタムワーカーパスを指定して初期化できることを確認
- **テストコード抜粋**:

  ```typescript
  const customPath = '/custom/worker.js';
  const customEngine = new AIEngine(customPath);

  expect(customEngine).toBeDefined();
  expect(customEngine.isReady()).toBe(false);
  ```

- **期待値**:
  ```typescript
  expect(customEngine).toBeDefined();
  expect(customEngine.isReady()).toBe(false);
  ```
- **削除判定**: [ ] 不要

---

### initialize

#### Test 2: should initialize successfully

- **元のテストタイトル**: should initialize successfully
- **日本語タイトル**: 正常に初期化すること
- **テスト内容**: AIEngineが正常に初期化され、準備完了状態になることを確認
- **テストコード抜粋**:

  ```typescript
  const result = await aiEngine.initialize();

  expect(result.success).toBe(true);
  expect(aiEngine.isReady()).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(aiEngine.isReady()).toBe(true);
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should handle Worker creation failure

- **元のテストタイトル**: should handle Worker creation failure
- **日本語タイトル**: Worker作成の失敗を処理すること
- **テスト内容**: Workerの作成に失敗した場合、適切なエラーレスポンスを返すことを確認
- **テストコード抜粋**:

  ```typescript
  // Mock Worker constructor to throw
  const originalWorker = (global as { Worker: typeof Worker }).Worker;
  (global as { Worker: typeof Worker }).Worker = jest.fn(() => {
    throw new Error('Worker script not found');
  }) as unknown as typeof Worker;

  const result = await brokenEngine.initialize();

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('initialization_error');
    expect(result.error.reason).toBe('wasm_load_failed');
    expect(result.error.message).toContain('Worker');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('initialization_error');
  expect(result.error.reason).toBe('wasm_load_failed');
  ```
- **削除判定**: [ ] 不要

---

### calculateMove

#### Test 4: should calculate AI move successfully

- **元のテストタイトル**: should calculate AI move successfully
- **日本語タイトル**: AIの手を正常に計算すること
- **テスト内容**: 初期化後、AIEngineが有効な手を計算できることを確認
- **テストコード抜粋**:

  ```typescript
  await aiEngine.initialize();

  const result = await aiEngine.calculateMove(emptyBoard, 'white');

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value).toBeDefined();
    expect(result.value.row).toBeGreaterThanOrEqual(0);
    expect(result.value.row).toBeLessThan(8);
    expect(result.value.col).toBeGreaterThanOrEqual(0);
    expect(result.value.col).toBeLessThan(8);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(result.value.row).toBeGreaterThanOrEqual(0);
  expect(result.value.row).toBeLessThan(8);
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should return error when not initialized

- **元のテストタイトル**: should return error when not initialized
- **日本語タイトル**: 初期化されていない場合にエラーを返すこと
- **テスト内容**: 初期化前にcalculateMoveを呼んだ場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  const result = await aiEngine.calculateMove(emptyBoard, 'white');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('ai_calculation_error');
    expect(result.error.reason).toBe('not_initialized');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('ai_calculation_error');
  expect(result.error.reason).toBe('not_initialized');
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should handle timeout correctly

- **元のテストタイトル**: should handle timeout correctly
- **日本語タイトル**: タイムアウトを正しく処理すること
- **テスト内容**: Workerが応答しない場合、タイムアウトエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  await aiEngine.initialize();

  // Mock worker that never responds
  const slowWorker = new MockWorker();
  slowWorker.postMessage = jest.fn(); // Does not call onmessage
  (aiEngine as any).worker = slowWorker;

  const result = await aiEngine.calculateMove(emptyBoard, 'white', 100);

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('ai_calculation_error');
    expect(result.error.reason).toBe('timeout');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('ai_calculation_error');
  expect(result.error.reason).toBe('timeout');
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should handle worker error response

- **元のテストタイトル**: should handle worker error response
- **日本語タイトル**: Workerのエラーレスポンスを処理すること
- **テスト内容**: Workerがエラーレスポンスを返した場合、適切にエラーを処理することを確認
- **テストコード抜粋**:

  ```typescript
  await aiEngine.initialize();

  // Mock worker that returns error
  const errorWorker = new MockWorker();
  errorWorker.postMessage = function () {
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(
          new MessageEvent('message', {
            data: {
              type: 'error',
              payload: {
                error: 'WASM calculation failed',
              },
            },
          })
        );
      }
    }, 10);
  };
  (aiEngine as any).worker = errorWorker;

  const result = await aiEngine.calculateMove(emptyBoard, 'white');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('ai_calculation_error');
    expect(result.error.reason).toBe('wasm_error');
    expect(result.error.message).toContain('WASM calculation failed');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('ai_calculation_error');
  expect(result.error.reason).toBe('wasm_error');
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should handle worker being null after initialization

- **元のテストタイトル**: should handle worker being null after initialization
- **日本語タイトル**: 初期化後にworkerがnullの場合を処理すること
- **テスト内容**: 初期化後にworkerが何らかの理由でnullになった場合のエラーハンドリングを確認
- **テストコード抜粋**:

  ```typescript
  await aiEngine.initialize();

  // Manually set worker to null and initialized to false
  (aiEngine as any).worker = null;
  (aiEngine as any).initialized = false;

  const result = await aiEngine.calculateMove(emptyBoard, 'white');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('ai_calculation_error');
    expect(result.error.reason).toBe('not_initialized');
    expect(result.error.message).toContain('initialize');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('ai_calculation_error');
  expect(result.error.reason).toBe('not_initialized');
  ```
- **削除判定**: [ ] 不要

---

### isReady

#### Test 9: should return false before initialization

- **元のテストタイトル**: should return false before initialization
- **日本語タイトル**: 初期化前にfalseを返すこと
- **テスト内容**: 初期化前のisReady()がfalseを返すことを確認
- **テストコード抜粋**:
  ```typescript
  expect(aiEngine.isReady()).toBe(false);
  ```
- **期待値**:
  ```typescript
  expect(aiEngine.isReady()).toBe(false);
  ```
- **削除判定**: [ ] 不要

---

#### Test 10: should return true after initialization

- **元のテストタイトル**: should return true after initialization
- **日本語タイトル**: 初期化後にtrueを返すこと
- **テスト内容**: 初期化後のisReady()がtrueを返すことを確認
- **テストコード抜粋**:
  ```typescript
  await aiEngine.initialize();
  expect(aiEngine.isReady()).toBe(true);
  ```
- **期待値**:
  ```typescript
  expect(aiEngine.isReady()).toBe(true);
  ```
- **削除判定**: [ ] 不要

---

#### Test 11: should return false after disposal

- **元のテストタイトル**: should return false after disposal
- **日本語タイトル**: 破棄後にfalseを返すこと
- **テスト内容**: dispose()呼び出し後のisReady()がfalseを返すことを確認
- **テストコード抜粋**:
  ```typescript
  await aiEngine.initialize();
  aiEngine.dispose();
  expect(aiEngine.isReady()).toBe(false);
  ```
- **期待値**:
  ```typescript
  expect(aiEngine.isReady()).toBe(false);
  ```
- **削除判定**: [ ] 不要

---

### dispose

#### Test 12: should clean up worker resources

- **元のテストタイトル**: should clean up worker resources
- **日本語タイトル**: Workerリソースをクリーンアップすること
- **テスト内容**: dispose()呼び出し時にworker.terminate()が呼ばれることを確認
- **テストコード抜粋**:

  ```typescript
  await aiEngine.initialize();
  const worker = (aiEngine as any).worker;
  const terminateSpy = jest.spyOn(worker, 'terminate');

  aiEngine.dispose();

  expect(terminateSpy).toHaveBeenCalled();
  expect(aiEngine.isReady()).toBe(false);
  ```

- **期待値**:
  ```typescript
  expect(terminateSpy).toHaveBeenCalled();
  expect(aiEngine.isReady()).toBe(false);
  ```
- **削除判定**: [ ] 不要

---

#### Test 13: should be safe to call multiple times

- **元のテストタイトル**: should be safe to call multiple times
- **日本語タイトル**: 複数回呼び出しても安全であること
- **テスト内容**: dispose()を複数回呼んでもエラーにならないことを確認
- **テストコード抜粋**:

  ```typescript
  await aiEngine.initialize();

  expect(() => {
    aiEngine.dispose();
    aiEngine.dispose();
  }).not.toThrow();
  ```

- **期待値**:
  ```typescript
  expect(() => {
    aiEngine.dispose();
    aiEngine.dispose();
  }).not.toThrow();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 11件（全て）

このファイルの全テストは重要なビジネスロジックとエラーハンドリングをテストしており、全て保持すべきです。

**主要テストカテゴリ:**

- 初期化テスト（2件）
- AI計算テスト（5件）
- 状態管理テスト（3件）
- リソース管理テスト（2件）

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは非常に良好な状態です：

- 実際のビジネスロジック（AI計算）をテスト
- エラーハンドリングを網羅的にテスト
- リソース管理（Worker）を適切にテスト
- モックを適切に使用してWorkerの動作をシミュレート

変更不要です。
