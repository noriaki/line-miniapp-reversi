# wasm-loader-emscripten.test.ts

## ファイル情報

- **テストファイル**: `src/lib/ai/__tests__/wasm-loader-emscripten.test.ts`
- **テスト対象コード**: `src/lib/ai/wasm-loader.ts`
- **テスト数**: 8（1件はスキップ）
- **削除推奨テスト数**: 1

## テストケース一覧

### Test 1: should load WASM via Emscripten Module in Web Worker context

- **元のテストタイトル**: should load WASM via Emscripten Module in Web Worker context
- **日本語タイトル**: Web WorkerコンテキストでEmscripten ModuleからWASMをロードすること
- **テスト内容**: Web Worker環境でEmscriptenのai.jsを読み込み、Moduleが正常にロードされることを確認
- **テストコード抜粋**:

  ```typescript
  const mockImportScripts = jest.fn().mockImplementation(() => {
    const emscriptenModule = { ...mockEmscriptenModule };
    (global as any).Module = emscriptenModule;

    process.nextTick(() => {
      if (emscriptenModule.onRuntimeInitialized) {
        emscriptenModule.onRuntimeInitialized();
      }
    });
  });

  (global as any).importScripts = mockImportScripts;

  const result = await loadWASM('/ai.wasm');

  expect(mockImportScripts).toHaveBeenCalledWith('http://localhost/ai.js');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value).toBeDefined();
    expect(result.value._init_ai).toBeDefined();
    expect(result.value._malloc).toBeDefined();
    expect(result.value._calc_value).toBeDefined();
  }
  ```

- **期待値**:
  ```typescript
  expect(mockImportScripts).toHaveBeenCalledWith('http://localhost/ai.js');
  expect(result.success).toBe(true);
  expect(result.value).toBeDefined();
  expect(result.value._init_ai).toBeDefined();
  expect(result.value._malloc).toBeDefined();
  expect(result.value._calc_value).toBeDefined();
  ```
- **削除判定**: [ ] 不要

---

### Test 2: should wait for onRuntimeInitialized callback

- **元のテストタイトル**: should wait for onRuntimeInitialized callback
- **日本語タイトル**: onRuntimeInitializedコールバックを待つこと
- **テスト内容**: Emscriptenランタイムの初期化が非同期で完了するまで待機することを確認
- **テストコード抜粋**:

  ```typescript
  let callbackWasSet = false;

  const mockImportScripts = jest.fn().mockImplementation(() => {
    const emscriptenModule = {
      _init_ai: jest.fn(),
      _calc_value: jest.fn(),
      _malloc: jest.fn(),
      _free: jest.fn(),
      // ... other fields
      set onRuntimeInitialized(callback: () => void) {
        callbackWasSet = true;
        process.nextTick(() => {
          callback();
        });
      },
    };
    (global as any).Module = emscriptenModule;
  });

  (global as any).importScripts = mockImportScripts;

  const result = await loadWASM('/ai.wasm');

  expect(result.success).toBe(true);
  expect(callbackWasSet).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(callbackWasSet).toBe(true);
  ```
- **削除判定**: [ ] 不要

---

### Test 3: should return error when importScripts is not available (not in Worker)

- **元のテストタイトル**: should return error when importScripts is not available (not in Worker)
- **日本語タイトル**: importScriptsが利用できない場合（Worker外）にエラーを返すこと
- **テスト内容**: Web Worker環境でない場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  delete (global as any).importScripts;

  const result = await loadWASM('/ai.wasm');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('wasm_load_error');
    expect(result.error.reason).toBe('fetch_failed');
    expect(result.error.message).toContain('importScripts');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('wasm_load_error');
  expect(result.error.reason).toBe('fetch_failed');
  expect(result.error.message).toContain('importScripts');
  ```
- **削除判定**: [ ] 不要

---

### Test 4: should return error when importScripts throws

- **元のテストタイトル**: should return error when importScripts throws
- **日本語タイトル**: importScriptsが例外をスローした場合にエラーを返すこと
- **テスト内容**: スクリプト読み込みに失敗した場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  (global as any).importScripts = jest.fn().mockImplementation(() => {
    throw new Error('Script load failed');
  });

  const result = await loadWASM('/ai.wasm');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('wasm_load_error');
    expect(result.error.reason).toBe('fetch_failed');
    expect(result.error.message).toContain('Script load failed');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('wasm_load_error');
  expect(result.error.reason).toBe('fetch_failed');
  expect(result.error.message).toContain('Script load failed');
  ```
- **削除判定**: [ ] 不要

---

### Test 5: should return error when Module is not available after importScripts

- **元のテストタイトル**: should return error when Module is not available after importScripts
- **日本語タイトル**: importScripts後にModuleが利用できない場合にエラーを返すこと
- **テスト内容**: Emscriptenのグルーコードが正常にModuleを設定できなかった場合、適切なエラーを返すことを確認
- **テストコード抜粋**:

  ```typescript
  delete (global as any).Module;

  (global as any).importScripts = jest.fn().mockImplementation(() => {
    delete (global as any).Module;
  });

  const result = await loadWASM('/ai.wasm');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('wasm_load_error');
    expect(result.error.reason).toBe('instantiation_failed');
    expect(result.error.message).toContain('Module not found');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('wasm_load_error');
  expect(result.error.reason).toBe('instantiation_failed');
  expect(result.error.message).toContain('Module not found');
  ```
- **削除判定**: [ ] 不要

---

### Test 6: should timeout if onRuntimeInitialized never called

- **元のテストタイトル**: should timeout if onRuntimeInitialized never called
- **日本語タイトル**: onRuntimeInitializedが呼ばれない場合にタイムアウトすること
- **テスト内容**: ランタイム初期化が完了しない場合にタイムアウトすることを確認（スキップ済み）
- **テストコード抜粋**:

  ```typescript
  // SKIPPED: Jest fake timers don't work reliably with setTimeout inside Promise
  // The timeout functionality IS implemented in wasm-loader.ts (INIT_TIMEOUT_MS = 10s)

  jest.useFakeTimers();

  const mockModule = {
    ...mockEmscriptenModule,
    set onRuntimeInitialized(_callback: () => void) {
      // Never call the callback (simulate hang)
    },
  };

  (global as any).importScripts = jest.fn().mockImplementation(() => {
    (global as any).Module = mockModule;
  });

  const loadPromise = loadWASM('/ai.wasm');
  jest.advanceTimersByTime(10001);

  const result = await loadPromise;

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('wasm_load_error');
    expect(result.error.reason).toBe('initialization_timeout');
  }

  jest.useRealTimers();
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('wasm_load_error');
  expect(result.error.reason).toBe('initialization_timeout');
  ```
- **削除判定**: [x] 不要
- **削除理由**: テストが`it.skip`でスキップされており、実行されていない。コメントによれば「Jest fake timersがPromise内のsetTimeoutで信頼性が低い」ため。タイムアウト機能は実装されているが、テストが技術的理由で動作しない。ドキュメントとして保持する価値も低い。完全に削除すべき。

---

### Test 7: should call \_init_ai after runtime initialization

- **元のテストタイトル**: should call \_init_ai after runtime initialization
- **日本語タイトル**: ランタイム初期化後に\_init_aiを呼び出すこと
- **テスト内容**: Emscriptenランタイムの初期化完了後、AI初期化関数が呼ばれることを確認
- **テストコード抜粋**:

  ```typescript
  const initAiMock = jest.fn();

  (global as any).importScripts = jest.fn().mockImplementation(() => {
    const emscriptenModule = {
      ...mockEmscriptenModule,
      _init_ai: initAiMock,
      set onRuntimeInitialized(callback: () => void) {
        process.nextTick(() => callback());
      },
    };
    (global as any).Module = emscriptenModule;
  });

  await loadWASM('/ai.wasm');

  expect(initAiMock).toHaveBeenCalledTimes(1);
  ```

- **期待値**:
  ```typescript
  expect(initAiMock).toHaveBeenCalledTimes(1);
  ```
- **削除判定**: [ ] 不要
- **備考**: 初期化シーケンスの検証として重要

---

### Test 8: should derive ai.js path from wasm path

- **元のテストタイトル**: should derive ai.js path from wasm path
- **日本語タイトル**: wasmパスからai.jsパスを導出すること
- **テスト内容**: 様々なWASMパス形式から正しいai.jsパスが生成されることを確認
- **テストコード抜粋**:

  ```typescript
  const mockImportScripts = jest.fn().mockImplementation(() => {
    const emscriptenModule = { ...mockEmscriptenModule };
    (global as any).Module = emscriptenModule;
    process.nextTick(() => {
      if (emscriptenModule.onRuntimeInitialized) {
        emscriptenModule.onRuntimeInitialized();
      }
    });
  });

  (global as any).importScripts = mockImportScripts;

  await loadWASM('/ai.wasm');
  expect(mockImportScripts).toHaveBeenNthCalledWith(
    1,
    'http://localhost/ai.js'
  );

  await loadWASM('/path/to/ai.wasm');
  expect(mockImportScripts).toHaveBeenNthCalledWith(
    2,
    'http://localhost/path/to/ai.js'
  );

  await loadWASM('ai.wasm');
  expect(mockImportScripts).toHaveBeenNthCalledWith(3, 'http://localhostai.js');
  ```

- **期待値**:
  ```typescript
  expect(mockImportScripts).toHaveBeenNthCalledWith(
    1,
    'http://localhost/ai.js'
  );
  expect(mockImportScripts).toHaveBeenNthCalledWith(
    2,
    'http://localhost/path/to/ai.js'
  );
  expect(mockImportScripts).toHaveBeenNthCalledWith(3, 'http://localhostai.js');
  ```
- **削除判定**: [ ] 不要
- **備考**: パス導出ロジックの検証として重要

---

## サマリー

### 保持推奨テスト: 7件

このファイルは**Emscripten統合によるWASMロード**をテストしており、ほとんどのテストが保持すべきです。

**主要テストカテゴリ:**

- 正常ロードテスト（3件）: Module読み込み、初期化待機、初期化シーケンス
- エラーハンドリングテスト（3件）: importScripts未対応、スクリプトエラー、Module未設定
- パス処理テスト（1件）: WASMパスからJSパスへの変換

### 削除推奨テスト: 1件

**スキップされたテスト（1件）:**

- Test 6: タイムアウトテスト - `it.skip`でスキップされており、Jest fake timersの技術的制約により実行できない。ドキュメントとしての価値も低い。

### 推奨事項

このテストファイルは全体的に良好で、**削除推奨は1件のみ（スキップ済みテスト）**です。

Emscripten統合テストは以下の理由で重要です：

- Web Worker環境の特殊性（importScripts）
- 非同期初期化の複雑性（onRuntimeInitialized）
- エラーハンドリングの網羅性

削除推奨のTest 6は既にスキップされており、実行されていません。完全に削除しても品質に影響しません。
