# Requirements Document

## Project Description (Input)

# WASM統合テスト修正：HEAPビュー初期化問題

**作成日**: 2025-11-23
**ステータス**: 実装待ち
**優先度**: 高

## 問題の概要

統合テスト（`wasm.integration.test.ts`、`ai-engine.integration.test.ts`）が失敗（46/565テスト）。

**エラー**: `TypeError: Cannot read properties of undefined (reading 'buffer')`
**原因**: `Module.HEAP32` が `undefined`

## 背景

### テスト構成

- **単体テスト**: Mock使用（`test-setup.ts`） ✓ 適切
- **統合テスト**: 実際の `public/ai.wasm` + `public/ai.js` 使用 ✓ 適切
- **E2Eテスト**: Playwright（ブラウザ環境） ✓ 適切

### Node.js環境でのテストは妥当

- WASM API検証には十分
- 業界標準アプローチ
- 高速・安定・CI/CD最適
- `jest.setup.js` は Node.js環境で何もしない（`typeof window !== 'undefined'` で判定）

## 根本原因

### `.specify/resources/ai.js` vs `public/ai.js` の違い

**.specify/resources/ai.js** (3,344行、非minified):

```javascript
function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b); // 二重代入
  Module['HEAP32'] = HEAP32 = new Int32Array(b); // グローバル + Module両方
  // ...
}
```

**public/ai.js** (1行、minified):

- `Module.HEAP32` への代入が欠落している可能性
- グローバル変数のみに設定される

### Node.js環境での問題

1. `new Function()` によるスコープ分離
2. Emscriptenが `updateMemoryViews()` でグローバルスコープに `HEAP32` を作成
3. しかし `Module.HEAP32` には設定されない
4. テストコードは `Module.HEAP32.buffer` にアクセス → `undefined`

## 解決策

### ✅ 推奨：解決策B（テストコード内でHEAP動的生成）

**方針**: `public/ai.js` を変更せず、テストコード側で対応

**実装箇所**:

- `src/lib/ai/__tests__/wasm.integration.test.ts` - 6箇所
- `src/lib/ai/__tests__/ai-engine.integration.test.ts` - 1箇所

**修正内容**:

各 `onRuntimeInitialized` コールバックを以下に置き換え：

```typescript
onRuntimeInitialized: function (this: EgaroucidWASMModule) {
  const globalObj = global as typeof global & {
    HEAP8?: Int8Array;
    HEAPU8?: Uint8Array;
    HEAP32?: Int32Array;
    HEAPU32?: Uint32Array;
    wasmMemory?: WebAssembly.Memory;
  };

  // 戦略1: グローバルスコープから取得
  if (globalObj.HEAP32) {
    this.HEAP8 = globalObj.HEAP8!;
    this.HEAPU8 = globalObj.HEAPU8!;
    this.HEAP32 = globalObj.HEAP32!;
    this.HEAPU32 = globalObj.HEAPU32!;
  }
  // 戦略2: wasmMemory.buffer から直接作成
  else if (globalObj.wasmMemory) {
    const buffer = globalObj.wasmMemory.buffer;
    this.HEAP8 = new Int8Array(buffer);
    this.HEAPU8 = new Uint8Array(buffer);
    this.HEAP32 = new Int32Array(buffer);
    this.HEAPU32 = new Uint32Array(buffer);
  }
  // 戦略3: Module.memory から作成
  else if (this.memory && this.memory.buffer) {
    const buffer = this.memory.buffer;
    this.HEAP8 = new Int8Array(buffer);
    this.HEAPU8 = new Uint8Array(buffer);
    this.HEAP32 = new Int32Array(buffer);
    this.HEAPU32 = new Uint32Array(buffer);
  }

  if (this.HEAP32) {
    resolve(this);
  } else {
    reject(new Error('Failed to initialize HEAP views'));
  }
}
```

### 修正対象箇所

**wasm.integration.test.ts**:

- 行68付近: Task 5.1: Module Loading
- 行249付近: Task 5.2: Board Encoding
- 行1058付近: Task 5.3: \_calc_value
- 行1400付近: Task 5.4: Memory Management
- 行1616付近: Task 5.5: Performance
- 行1945付近: Task 5.6: Error Cases

**ai-engine.integration.test.ts**:

- 行47付近: Integration Test

## 検証手順

```bash
# テスト実行
pnpm test src/lib/ai/__tests__/wasm.integration.test.ts
pnpm test src/lib/ai/__tests__/ai-engine.integration.test.test.ts

# 期待結果: 565/565 passed
```

## 代替案

### 解決策A: `.specify/resources/ai.js` を `public/` にコピー

- **不採用理由**: 本番用ファイルの変更は不可

### 解決策C: `vm.runInNewContext()` 使用

- **採用条件**: 解決策Bで失敗した場合のみ
- **参考**: `docs/wasm-heap-access-issue.md`

## 関連情報

- **本番環境**: Web Worker環境で `public/ai.js` は正常動作
- **HEAPビューの必要性**: `wasm-bridge.ts:70-88` で必須
- **本番コード**: `wasm-loader.ts:116-119` でグローバルスコープからコピー

## 次のアクション

1. 上記7箇所の `onRuntimeInitialized` を修正
2. テスト実行
3. 565/565 成功を確認
4. コミット・PR作成

---

## Introduction

本機能は、Node.js環境で実行されるWASM統合テストにおけるHEAPビュー初期化問題を修正します。Emscriptenが生成する`public/ai.js`がNode.js環境で`Module.HEAP32`を正しく初期化しないため、統合テストが失敗する問題に対処します。

テストコード側で複数のフォールバック戦略を実装し、グローバルスコープまたはメモリバッファから動的にHEAPビューを生成することで、本番環境のファイル（`public/ai.js`、`public/ai.wasm`）を変更せずに問題を解決します。

## Requirements

### Requirement 1: WASM統合テストのHEAPビュー初期化

**Objective:** テスト実行者として、Node.js環境でWASM統合テストが正常に実行されることを期待し、CI/CDパイプラインでの品質保証を確実にする

#### Acceptance Criteria

1. When WASMモジュールの`onRuntimeInitialized`コールバックが実行される, the テスト環境 shall グローバルスコープから`HEAP8`、`HEAPU8`、`HEAP32`、`HEAPU32`を取得し`Module`オブジェクトに設定する
2. If グローバルスコープにHEAPビューが存在しない, then the テスト環境 shall `wasmMemory.buffer`から新しいHEAPビューを作成し`Module`オブジェクトに設定する
3. If グローバルスコープとwasmMemoryの両方が利用不可, then the テスト環境 shall `Module.memory.buffer`から新しいHEAPビューを作成し`Module`オブジェクトに設定する
4. If すべてのフォールバック戦略が失敗した, then the テスト環境 shall `'Failed to initialize HEAP views'`エラーメッセージでPromiseを拒否する
5. The テスト環境 shall 7箇所の統合テスト（`wasm.integration.test.ts`の6箇所、`ai-engine.integration.test.ts`の1箇所）すべてに統一されたHEAPビュー初期化ロジックを適用する

### Requirement 2: 統合テストのカバレッジ維持

**Objective:** 開発者として、既存のすべてのWASM統合テストが成功することを期待し、機能の退行を防ぐ

#### Acceptance Criteria

1. When `wasm.integration.test.ts`を実行する, the テストスイート shall Task 5.1（Module Loading）のすべてのテストケースが成功する
2. When `wasm.integration.test.ts`を実行する, the テストスイート shall Task 5.2（Board Encoding）のすべてのテストケースが成功する
3. When `wasm.integration.test.ts`を実行する, the テストスイート shall Task 5.3（\_calc_value）のすべてのテストケースが成功する
4. When `wasm.integration.test.ts`を実行する, the テストスイート shall Task 5.4（Memory Management）のすべてのテストケースが成功する
5. When `wasm.integration.test.ts`を実行する, the テストスイート shall Task 5.5（Performance）のすべてのテストケースが成功する
6. When `wasm.integration.test.ts`を実行する, the テストスイート shall Task 5.6（Error Cases）のすべてのテストケースが成功する
7. When `ai-engine.integration.test.ts`を実行する, the テストスイート shall すべての統合テストケースが成功する
8. The テストスイート shall 合計565個のテストすべてが成功することを検証する

### Requirement 3: 本番環境への影響排除

**Objective:** システム管理者として、テスト修正が本番環境のWASMファイルに影響しないことを期待し、デプロイメントの安全性を確保する

#### Acceptance Criteria

1. The テスト修正 shall `public/ai.js`ファイルを変更しない
2. The テスト修正 shall `public/ai.wasm`ファイルを変更しない
3. The テスト修正 shall テストコード（`src/lib/ai/__tests__/`配下）のみを変更する
4. When Web Worker環境で本番コードを実行する, the AI Engine shall 既存の動作を維持し、修正前と同じ方法でHEAPビューにアクセスする

### Requirement 4: TypeScriptの型安全性維持

**Objective:** 開発者として、HEAPビュー初期化ロジックが型安全であることを期待し、実行時エラーを防ぐ

#### Acceptance Criteria

1. The テストコード shall グローバルオブジェクトにHEAPプロパティを追加する際、明示的な型注釈（`typeof global & { HEAP8?: Int8Array; ... }`）を使用する
2. The テストコード shall Non-null assertion operator（`!`）をグローバルスコープからHEAPビューを取得する際にのみ使用する
3. The テストコード shall `onRuntimeInitialized`コールバック内で`this`の型を`EgaroucidWASMModule`として明示的に指定する
4. The テストコード shall TypeScriptのstrict modeですべての型チェックをパスする

### Requirement 5: フォールバック戦略の優先順位

**Objective:** テスト環境として、最も信頼性の高い方法から順にHEAPビュー初期化を試行することを期待し、テストの安定性を最大化する

#### Acceptance Criteria

1. The テスト環境 shall 第一優先としてグローバルスコープの`HEAP32`の存在を確認し、存在する場合はすべてのHEAPビュー（HEAP8、HEAPU8、HEAP32、HEAPU32）をグローバルから取得する
2. If グローバルスコープにHEAPビューが存在しない, then the テスト環境 shall 第二優先としてグローバルスコープの`wasmMemory`の存在を確認し、`wasmMemory.buffer`から新しいHEAPビューを作成する
3. If グローバルスコープとwasmMemoryの両方が利用不可, then the テスト環境 shall 第三優先として`Module.memory.buffer`から新しいHEAPビューを作成する
4. The テスト環境 shall いずれかの戦略が成功した時点で残りの戦略を試行せず、`Module.HEAP32`の存在を確認してPromiseを解決する

### Requirement 6: エラーハンドリングと診断情報

**Objective:** デバッグ担当者として、HEAPビュー初期化が失敗した場合に原因を特定できることを期待し、問題解決を迅速化する

#### Acceptance Criteria

1. If すべてのフォールバック戦略が失敗した, then the テスト環境 shall 明確なエラーメッセージ`'Failed to initialize HEAP views'`を含むErrorオブジェクトでPromiseを拒否する
2. The テスト環境 shall 初期化成功時に`Module.HEAP32`の存在を検証し、存在しない場合はエラーを発生させる
3. When テストが失敗する, the テストランナー shall Jestの標準エラー出力に失敗した戦略と状態を含むスタックトレースを表示する
