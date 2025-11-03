# WASM Bridge カバレッジ改善プラン

## 現状分析

**ファイル**: `src/lib/ai/wasm-bridge.ts`
**現在のBranch Coverage**: 70.83%
**目標**: 90%以上
**未カバー行**: 77-78

## 未カバー部分の詳細

### 問題箇所: `encodeBoard`関数の Line 76-78

```typescript
const buffer =
  module.memory?.buffer ||
  module.HEAP32?.buffer ||
  module.HEAPU8?.buffer ||
  module.HEAP8?.buffer;

if (!buffer) {
  // ← この分岐が未カバー (Line 76)
  module._free(boardPtr); // ← Line 77
  return {
    // ← Line 78
    success: false,
    error: {
      type: 'encode_error',
      reason: 'memory_allocation_failed',
      message: 'WASM memory buffer not accessible',
    },
  };
}
```

### 未カバーの理由

現在のテスト (`src/lib/ai/__tests__/wasm-bridge.test.ts`) では、モックWASMモジュールが常に以下のプロパティを持つ:

```typescript
const createMockModule = (): EgaroucidWASMModule => {
  const memory = new ArrayBuffer(1024);
  return {
    // ... 他のプロパティ
    memory: {} as WebAssembly.Memory, // 常に存在
    HEAP8: new Int8Array(memory), // 常に存在
    HEAPU8: new Uint8Array(memory), // 常に存在
    HEAP32: new Int32Array(memory), // 常に存在
    HEAPU32: new Uint32Array(memory), // 常に存在
  };
};
```

そのため、`buffer`変数は常に値を持ち、`if (!buffer)`分岐に到達しない。

## 改善プラン

### 目的

WASMモジュールのメモリバッファが完全にアクセス不可能な極端なエッジケースをテストする。

### 実装方針

1. **新しいテストケースを追加**: メモリバッファプロパティがすべて`undefined`のモックモジュールを作成
2. **テスト対象**: Line 76-78の分岐処理
3. **検証項目**:
   - エラーが正しく返されること
   - `_free`が呼ばれてメモリリークを防ぐこと
   - エラーメッセージが適切であること

## 実装手順

### Step 1: テストファイルを開く

```bash
# 編集対象ファイル
src/lib/ai/__tests__/wasm-bridge.test.ts
```

### Step 2: 新しいモック作成関数を追加

`createMockModule`関数の直後に、以下の関数を追加:

```typescript
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
```

### Step 3: 新しいテストケースを追加

`encodeBoard`のdescribeブロック内の最後に、以下のテストを追加:

```typescript
describe('encodeBoard', () => {
  // ... 既存のテスト

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
```

### Step 4: テスト実行と検証

```bash
# 特定のテストファイルを実行
pnpm test src/lib/ai/__tests__/wasm-bridge.test.ts

# カバレッジを確認
pnpm test:coverage -- src/lib/ai/__tests__/wasm-bridge.test.ts
```

## 期待される改善

### カバレッジ改善

- **Before**: Branches 70.83%
- **After**: Branches 100% (推定)
- **改善**: +29.17%

### 全体への影響

`wasm-bridge.ts`のBranchesが100%になることで、全体のBranchesカバレッジが約0.5%改善する見込み。

## 注意事項

### TypeScriptの型安全性

`createMockModuleWithoutBuffer`では、プロパティが`undefined`のモジュールを作成するため、型アサーション`as unknown as EgaroucidWASMModule`が必要です。これは、テスト目的で意図的に無効な状態を作るためです。

### 実装コード変更の必要性

このエッジケースは、実際の本番環境では発生しない可能性が高いですが、防衛的プログラミングの観点から重要です。テスト追加のみで実装コードの変更は不要です。

## 補足: 代替アプローチ

もし、このエッジケースが現実的でないと判断する場合、以下の選択肢もあります:

### オプションA: 実装を簡素化

```typescript
// buffer変数を削除し、直接アクセス
const heap = new Int32Array(
  module.memory?.buffer || module.HEAP32?.buffer!, // 存在しない場合はランタイムエラー
  boardPtr,
  64
);
```

この場合、バッファアクセス失敗時に例外がスローされ、外側のtry-catchでキャッチされます。

### オプションB: ドキュメント化

バッファが必ず存在する前提をドキュメントに明記し、Line 76-78を削除します。ただし、この場合Branchesカバレッジは改善されません。

## 推奨

**Step 1-4の実装を推奨**します。防衛的プログラミングを維持しつつ、カバレッジを向上できます。
