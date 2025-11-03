# WASM Loader カバレッジ改善プラン

## 現状分析

**ファイル**: `src/lib/ai/wasm-loader.ts`
**現在のBranch Coverage**: 88.23%
**目標**: 90%以上
**未カバー行**: 177

## 未カバー部分の詳細

### 問題箇所: `loadWASM`関数の Line 177-184

```typescript
try {
  // ... WASM読み込み処理 (Line 30-160)

  // After runtime initialization, verify required functions
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
    // ← Line 177: この分岐が未カバー
    success: false,
    error: {
      type: 'wasm_load_error',
      reason: 'instantiation_failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    },
  };
}
```

### 未カバーの理由

現在のテスト (`src/lib/ai/__tests__/wasm-loader.test.ts`) では、以下のエラーケースをカバーしています:

1. `importScripts`が未定義の場合 (Line 31-40)
2. `importScripts`が例外をスローする場合 (Line 73-84)
3. `Module`が存在しない場合 (Line 92-101)
4. 初期化タイムアウト (Line 163-174)
5. 必須関数が存在しない場合 (Line 137-149)

しかし、**一般的な例外** (タイムアウトでも既知のエラーでもない) のケースがカバーされていません。

## 改善プラン

### 目的

予期しない例外が発生した場合のフォールバックエラーハンドリングをテストする。

### 実装方針

1. **新しいテストケースを追加**: Promise内で予期しない例外をスローするシナリオを作成
2. **テスト対象**: Line 177-184の一般的なcatchブロック
3. **検証項目**:
   - 一般的な例外が適切にキャッチされること
   - エラーメッセージが正しく伝達されること
   - Result型のエラーが返されること

## 実装手順

### Step 1: テストファイルを開く

```bash
# 編集対象ファイル
src/lib/ai/__tests__/wasm-loader.test.ts
```

### Step 2: 新しいテストケースを追加

`loadWASM`関数のテストdescribeブロック内に、以下のテストを追加します。
既存の「should handle timeout during runtime initialization」テストの直後が適切です。

```typescript
describe('loadWASM', () => {
  // ... 既存のテスト

  it('should handle unexpected errors during initialization', async () => {
    // Mock importScripts to be available
    (global as any).importScripts = jest.fn();

    // Mock Module with an error-throwing onRuntimeInitialized callback
    (global as any).Module = {
      locateFile: jest.fn((path: string) => path),
      onRuntimeInitialized: undefined,
    };

    // Override the Module to simulate an unexpected error
    // This needs to happen after importScripts is called
    (global as any).importScripts = jest.fn(() => {
      (global as any).Module = {
        locateFile: jest.fn((path: string) => path),
        // Simulate an unexpected error by throwing during property access
        get onRuntimeInitialized() {
          throw new Error('Unexpected internal error');
        },
        set onRuntimeInitialized(_value: (() => void) | undefined) {
          throw new Error('Unexpected internal error');
        },
      };
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('instantiation_failed');
      expect(result.error.message).toBe('Unexpected internal error');
    }

    // Cleanup
    delete (global as any).importScripts;
    delete (global as any).Module;
  });

  it('should handle non-Error exceptions', async () => {
    // Mock importScripts to be available
    (global as any).importScripts = jest.fn();

    // Mock Module that throws a non-Error object
    (global as any).importScripts = jest.fn(() => {
      (global as any).Module = {
        locateFile: jest.fn((path: string) => path),
        get onRuntimeInitialized() {
          // Throw a non-Error object
          throw 'String error instead of Error object';
        },
        set onRuntimeInitialized(_value: (() => void) | undefined) {
          throw 'String error instead of Error object';
        },
      };
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('instantiation_failed');
      expect(result.error.message).toBe('Unknown error');
    }

    // Cleanup
    delete (global as any).importScripts;
    delete (global as any).Module;
  });
});
```

### Step 3: より現実的なアプローチ (推奨)

上記のテストは少し人為的なので、より現実的なシナリオをテストする別のアプローチ:

```typescript
describe('loadWASM', () => {
  // ... 既存のテスト

  it('should handle errors thrown during Module property access', async () => {
    // Mock importScripts
    (global as any).importScripts = jest.fn();

    // Create a Module with a getter that throws
    const moduleProxy = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'locateFile') {
            return (path: string) => path;
          }
          // Simulate an error when accessing onRuntimeInitialized
          if (prop === 'onRuntimeInitialized') {
            return undefined;
          }
          // Simulate an error when accessing _malloc
          if (prop === '_malloc') {
            throw new Error('Memory allocation system failure');
          }
          return undefined;
        },
        set(target, prop, value) {
          if (prop === 'onRuntimeInitialized') {
            // Call the callback immediately to trigger the error path
            if (typeof value === 'function') {
              try {
                value();
              } catch (error) {
                // This will bubble up to the loadWASM catch block
                throw error;
              }
            }
          }
          return true;
        },
      }
    );

    (global as any).importScripts = jest.fn(() => {
      (global as any).Module = moduleProxy;
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('instantiation_failed');
      expect(result.error.message).toContain(
        'Memory allocation system failure'
      );
    }

    // Cleanup
    delete (global as any).importScripts;
    delete (global as any).Module;
  });

  it('should handle unknown error types gracefully', async () => {
    // Mock importScripts
    (global as any).importScripts = jest.fn(() => {
      (global as any).Module = {
        locateFile: jest.fn((path: string) => path),
      };

      // Immediately throw a non-Error, non-timeout error
      throw { code: 'UNKNOWN', details: 'Some weird error object' };
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('instantiation_failed');
      expect(result.error.message).toBe('Unknown error');
    }

    // Cleanup
    delete (global as any).importScripts;
    delete (global as any).Module;
  });
});
```

### Step 4: テスト実行と検証

```bash
# 特定のテストファイルを実行
pnpm test src/lib/ai/__tests__/wasm-loader.test.ts

# カバレッジを確認
pnpm test:coverage -- src/lib/ai/__tests__/wasm-loader.test.ts
```

## 期待される改善

### カバレッジ改善

- **Before**: Branches 88.23%
- **After**: Branches 100% (推定)
- **改善**: +11.77%

### 全体への影響

`wasm-loader.ts`のBranchesが100%になることで、全体のBranches カバレッジが約0.4%改善する見込み。

## 注意事項

### テストの複雑性

このテストは、以下の理由で既存のテストより複雑です:

1. **グローバルオブジェクトの操作**: `global.Module`や`global.importScripts`を動的に設定
2. **Proxy使用**: プロパティアクセス時のエラーをシミュレート
3. **非同期処理**: Promiseとタイムアウトの組み合わせ

### 代替アプローチ

もし、上記のテストが複雑すぎる場合、より簡単なアプローチ:

```typescript
it('should handle generic errors in catch block', async () => {
  // Mock importScripts to throw a generic error
  (global as any).importScripts = jest.fn(() => {
    throw new TypeError('Cannot read property of undefined');
  });

  const result = await loadWASM('/ai.wasm');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('wasm_load_error');
    expect(result.error.reason).toBe('fetch_failed');
    // TypeErrorは既にLine 73-84でキャッチされるため、
    // これはLine 177には到達しない
  }

  delete (global as any).importScripts;
});
```

ただし、この簡単なアプローチはLine 177に到達しない可能性があります（既存のcatchブロックでキャッチされる）。

## 推奨実装

**Step 3の「より現実的なアプローチ」を推奨**します。

特に2つ目のテスト:

```typescript
it('should handle unknown error types gracefully', async () => {
  // ...
});
```

このテストは:

- 実装がシンプル
- 非Error型の例外をテスト
- Line 177の`error instanceof Error`分岐の両方をカバー

## 実装後の確認

### 1. カバレッジレポート確認

```bash
pnpm test:coverage 2>&1 | grep wasm-loader
```

期待される出力:

```
wasm-loader.ts | 100  | 100  | 100 | 100 |
```

### 2. 全体カバレッジへの影響

```bash
pnpm test:coverage 2>&1 | grep "All files"
```

Branchesが88.66%から約89.1%に改善することを確認。

## まとめ

このプランは、予期しない例外に対する防衛的プログラミングをテストします。
実際の本番環境では稀ですが、堅牢性の観点から重要です。
