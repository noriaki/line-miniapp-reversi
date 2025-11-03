# AI Engine カバレッジ改善プラン

## 現状分析

**ファイル**: `src/lib/ai/ai-engine.ts`
**現在のBranch Coverage**: 81.48%
**目標**: 90%以上
**未カバー行**: 88-96

## 未カバー部分の詳細

### 問題箇所: `calculateMove`メソッドの Line 87-96

```typescript
async calculateMove(
  board: Board,
  player: Player,
  timeoutMs: number = 3000
): Promise<Result<Position, AICalculationError>> {
  if (!this.initialized || !this.worker) {  // ← Line 75: 1つ目のチェック
    return {
      success: false,
      error: {
        type: 'ai_calculation_error',
        reason: 'not_initialized',
        message: 'AI Engine not initialized. Call initialize() first.',
      },
    };
  }

  return new Promise((resolve) => {
    if (!this.worker) {  // ← Line 87: 2つ目のチェック (未カバー)
      resolve({  // ← Line 88-95 (未カバー)
        success: false,
        error: {
          type: 'ai_calculation_error',
          reason: 'not_initialized',
          message: 'Worker not available',
        },
      });
      return;  // ← Line 96 (未カバー)
    }
    // ... 以降の処理
  });
}
```

### 未カバーの理由

Line 75のチェックで`!this.worker`が真の場合、既に関数から早期リターンしています。そのため、Line 87のPromise内の`!this.worker`チェックには、理論的に到達できません。

**コードフローの分析**:

1. Line 75で`!this.worker`がtrueなら → 早期リターン
2. Line 75で`!this.worker`がfalseなら → Promiseに進む
3. Promise内(Line 87)では、`this.worker`は必ず存在する

つまり、Line 87-96は**到達不可能なコード (Dead Code)**です。

## 改善プラン

### 選択肢の評価

#### オプションA: 到達不可能コードを削除 (推奨)

**利点**:

- コードが簡潔になる
- 意図が明確になる
- カバレッジが自動的に改善

**欠点**:

- 理論的な防衛的プログラミングが失われる

#### オプションB: 競合状態を作るテストを追加

**利点**:

- 既存コードを維持
- 非常に稀な競合状態をカバー

**欠点**:

- テストが複雑になる
- 現実的に発生しないケースをテスト

#### オプションC: コードを再構成

**利点**:

- 競合状態に対する保護を維持
- テスト可能性が向上

**欠点**:

- より大きなリファクタリングが必要

## 推奨実装: オプションA (到達不可能コード削除)

### 理由

1. **Single Responsibility**: Line 75のチェックで十分
2. **YAGNI原則**: 実際に必要になるまで複雑化しない
3. **保守性**: 重複チェックはバグの温床

### 実装手順

#### Step 1: 実装ファイルを開く

```bash
# 編集対象ファイル
src/lib/ai/ai-engine.ts
```

#### Step 2: 重複チェックを削除

`calculateMove`メソッドを以下のように修正:

**Before**:

```typescript
return new Promise((resolve) => {
  if (!this.worker) {
    resolve({
      success: false,
      error: {
        type: 'ai_calculation_error',
        reason: 'not_initialized',
        message: 'Worker not available',
      },
    });
    return;
  }

  // Set up timeout
  const timeout = setTimeout(() => {
    this.worker?.removeEventListener('message', handleMessage);
    // ...
  }, timeoutMs);
  // ...
});
```

**After**:

```typescript
return new Promise((resolve) => {
  // this.workerは必ず存在する (Line 75でチェック済み)
  const worker = this.worker!; // Non-null assertion

  // Set up timeout
  const timeout = setTimeout(() => {
    worker.removeEventListener('message', handleMessage);
    // ...
  }, timeoutMs);
  // ...
});
```

**重要**: 以降の`this.worker?.`も`worker.`に変更します。

#### Step 3: オプショナルチェーンを削除

Promise内の全ての`this.worker?.`を`worker.`に置き換え:

```typescript
// Before
this.worker?.removeEventListener('message', handleMessage);
this.worker?.addEventListener('message', handleMessage);
this.worker?.postMessage(request);

// After
worker.removeEventListener('message', handleMessage);
worker.addEventListener('message', handleMessage);
worker.postMessage(request);
```

#### Step 4: 完全な修正版

```typescript
async calculateMove(
  board: Board,
  player: Player,
  timeoutMs: number = 3000
): Promise<Result<Position, AICalculationError>> {
  if (!this.initialized || !this.worker) {
    return {
      success: false,
      error: {
        type: 'ai_calculation_error',
        reason: 'not_initialized',
        message: 'AI Engine not initialized. Call initialize() first.',
      },
    };
  }

  return new Promise((resolve) => {
    // this.workerの存在が保証されている
    const worker = this.worker!;

    // Set up timeout
    const timeout = setTimeout(() => {
      worker.removeEventListener('message', handleMessage);
      resolve({
        success: false,
        error: {
          type: 'ai_calculation_error',
          reason: 'timeout',
          message: `AI calculation timeout (>${timeoutMs}ms)`,
        },
      });
    }, timeoutMs);

    // Set up message listener
    const handleMessage = (event: MessageEvent<AIWorkerResponse>) => {
      clearTimeout(timeout);
      worker.removeEventListener('message', handleMessage);

      if (event.data.type === 'success') {
        resolve({
          success: true,
          value: event.data.payload.move!,
        });
      } else {
        resolve({
          success: false,
          error: {
            type: 'ai_calculation_error',
            reason: 'wasm_error',
            message: event.data.payload.error || 'Unknown error',
          },
        });
      }
    };

    worker.addEventListener('message', handleMessage);

    // Send calculation request to worker
    const request: AIWorkerRequest = {
      type: 'calculate',
      payload: {
        board,
        currentPlayer: player,
        timeoutMs,
      },
    };

    worker.postMessage(request);
  });
}
```

#### Step 5: 型チェックとテスト実行

```bash
# TypeScriptコンパイルチェック
pnpm type-check

# Lintチェック
pnpm lint

# 既存テストが通ることを確認
pnpm test src/lib/ai/__tests__/ai-engine.test.ts

# カバレッジ確認
pnpm test:coverage -- src/lib/ai/__tests__/ai-engine.test.ts
```

## 期待される改善

### カバレッジ改善

- **Before**: Branches 81.48%
- **After**: Branches 100% (推定)
- **改善**: +18.52%

### コード品質の向上

1. **簡潔性**: 重複チェックの削除
2. **明確性**: Non-null assertionで意図を明示
3. **保守性**: オプショナルチェーンの削除で意図が明確

### 全体への影響

`ai-engine.ts`のBranchesが100%になることで、全体のBranches カバレッジが約0.5%改善する見込み。

## 代替実装: オプションC (競合状態に対する保護)

もし、競合状態に対する保護を維持したい場合:

```typescript
async calculateMove(
  board: Board,
  player: Player,
  timeoutMs: number = 3000
): Promise<Result<Position, AICalculationError>> {
  if (!this.initialized || !this.worker) {
    return {
      success: false,
      error: {
        type: 'ai_calculation_error',
        reason: 'not_initialized',
        message: 'AI Engine not initialized. Call initialize() first.',
      },
    };
  }

  // Workerの参照をキャプチャ
  const worker = this.worker;

  return new Promise((resolve) => {
    // Set up timeout
    const timeout = setTimeout(() => {
      worker.removeEventListener('message', handleMessage);
      resolve({
        success: false,
        error: {
          type: 'ai_calculation_error',
          reason: 'timeout',
          message: `AI calculation timeout (>${timeoutMs}ms)`,
        },
      });
    }, timeoutMs);

    // ... 以降は同じ
  });
}
```

この場合:

- Line 87-96の重複チェックを削除
- `const worker = this.worker;`でキャプチャ
- Promise内では`worker`を使用

**テスト追加は不要**です（Line 75でカバー済み）。

## 注意事項

### Non-null Assertion (`!`)の使用

TypeScriptの`!`演算子は、値が`null`/`undefined`でないことをコンパイラに伝えます。
ただし、ランタイムチェックは行わないため、事前のチェックが必須です。

### 並行性

このクラスはシングルスレッドのJavaScript環境で動作するため、`this.worker`がLine 75とPromise内で異なる値になることはありません（`dispose()`が呼ばれない限り）。

## 推奨

**オプションA (到達不可能コード削除)** を推奨します。

- コードが簡潔
- テスト追加不要
- カバレッジ自動改善
