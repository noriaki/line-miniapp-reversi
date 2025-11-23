# 実装計画

## タスク概要

本実装計画は、Node.js環境で実行されるWASM統合テストにおけるHEAPビュー初期化問題を修正するための詳細なタスクリストです。7箇所の統合テスト（`wasm.integration.test.ts`の6箇所、`ai-engine.integration.test.ts`の1箇所）の`onRuntimeInitialized`コールバックに、3段階のフォールバック戦略を実装します。

## 実装タスク

- [ ] 1. Task 5.1（Module Loading）のHEAPビュー初期化修正
- [ ] 1.1 (P) wasm.integration.test.ts:68付近のonRuntimeInitializedコールバック修正
  - グローバルオブジェクトに明示的な型注釈を追加（`typeof global & { HEAP8?: Int8Array; HEAPU8?: Uint8Array; HEAP32?: Int32Array; HEAPU32?: Uint32Array; wasmMemory?: WebAssembly.Memory; }`）
  - 戦略1：グローバルスコープに`HEAP32`が存在する場合、すべてのHEAPビュー（HEAP8、HEAPU8、HEAP32、HEAPU32）をグローバルからコピー（Non-null assertion operator使用）
  - 戦略2：グローバルスコープに`wasmMemory`が存在する場合、`wasmMemory.buffer`から新しいHEAPビューを作成
  - 戦略3：`Module.memory.buffer`が存在する場合、そこから新しいHEAPビューを作成
  - `Module.HEAP32`の存在を確認し、存在する場合はPromiseを解決、存在しない場合は`'Failed to initialize HEAP views'`エラーでPromiseを拒否
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [ ] 2. Task 5.2（Board Encoding）のHEAPビュー初期化修正
- [ ] 2.1 (P) wasm.integration.test.ts:249付近のonRuntimeInitializedコールバック修正
  - タスク1.1と同じ3段階フォールバック戦略を実装
  - グローバルオブジェクトの型注釈、戦略1-3のロジック、エラーハンドリングを含む統一されたHEAP初期化ロジックを適用
  - ボードエンコーディングテストで`HEAP32.buffer`へのアクセスが正常に実行されることを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [ ] 3. Task 5.3（\_calc_value）のHEAPビュー初期化修正
- [ ] 3.1 (P) wasm.integration.test.ts:1058付近のonRuntimeInitializedコールバック修正
  - タスク1.1と同じ3段階フォールバック戦略を実装
  - グローバルオブジェクトの型注釈、戦略1-3のロジック、エラーハンドリングを含む統一されたHEAP初期化ロジックを適用
  - `_calc_value`関数の実行でHEAPビューにアクセス可能であることを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [ ] 4. Task 5.4（Memory Management）のHEAPビュー初期化修正
- [ ] 4.1 (P) wasm.integration.test.ts:1400付近のonRuntimeInitializedコールバック修正
  - タスク1.1と同じ3段階フォールバック戦略を実装
  - グローバルオブジェクトの型注釈、戦略1-3のロジック、エラーハンドリングを含む統一されたHEAP初期化ロジックを適用
  - メモリ管理テスト（`_malloc`、`_free`）でHEAPビューが正しく機能することを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [ ] 5. Task 5.5（Performance）のHEAPビュー初期化修正
- [ ] 5.1 (P) wasm.integration.test.ts:1616付近のonRuntimeInitializedコールバック修正
  - タスク1.1と同じ3段階フォールバック戦略を実装
  - グローバルオブジェクトの型注釈、戦略1-3のロジック、エラーハンドリングを含む統一されたHEAP初期化ロジックを適用
  - パフォーマンステストで大量のWASM関数呼び出しが正常に実行されることを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [ ] 6. Task 5.6（Error Cases）のHEAPビュー初期化修正
- [ ] 6.1 (P) wasm.integration.test.ts:1945付近のonRuntimeInitializedコールバック修正
  - タスク1.1と同じ3段階フォールバック戦略を実装
  - グローバルオブジェクトの型注釈、戦略1-3のロジック、エラーハンドリングを含む統一されたHEAP初期化ロジックを適用
  - エラーケーステストでHEAPビューが正しく機能することを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.6, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [ ] 7. AIEngine統合テストのHEAPビュー初期化修正
- [ ] 7.1 (P) ai-engine.integration.test.ts:47付近のonRuntimeInitializedコールバック修正
  - タスク1.1と同じ3段階フォールバック戦略を実装
  - グローバルオブジェクトの型注釈、戦略1-3のロジック、エラーハンドリングを含む統一されたHEAP初期化ロジックを適用
  - AIEngine全体の統合テストでAI計算の完全なフローが正常に実行されることを確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.7, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [ ] 8. 統合テスト実行と検証
- [ ] 8.1 ローカル環境でのwasm.integration.test.ts実行
  - `pnpm test src/lib/ai/__tests__/wasm.integration.test.ts`を実行
  - すべてのテストケース（Task 5.1-5.6）が成功することを確認
  - 各テストスイートでHEAPビュー初期化が正常に完了することを確認
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8_

- [ ] 8.2 ローカル環境でのai-engine.integration.test.ts実行
  - `pnpm test src/lib/ai/__tests__/ai-engine.integration.test.ts`を実行
  - すべての統合テストケースが成功することを確認
  - AIEngine全体のフローでHEAPビューが正しく機能することを確認
  - _Requirements: 2.7, 2.8_

- [ ] 8.3 全テストスイート実行
  - `pnpm test`を実行し、プロジェクト全体のテストを実行
  - 565個のテストすべてが成功することを確認（修正前の失敗数46から0へ）
  - TypeScript型チェックがstrictモードでパスすることを確認（`pnpm type-check`）
  - _Requirements: 2.8, 4.4_

- [ ] 9. 本番環境への影響確認
- [ ] 9.1 (P) 本番ファイルの非変更確認
  - `public/ai.js`ファイルが変更されていないことをGit statusで確認
  - `public/ai.wasm`ファイルが変更されていないことをGit statusで確認
  - 変更がテストコード（`src/lib/ai/__tests__/`配下）のみであることを確認
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 9.2 (P) E2Eテスト実行でブラウザ環境の動作確認
  - `pnpm test:e2e`を実行し、Playwright E2Eテストを実行
  - Web Worker環境での既存動作が維持されていることを確認
  - ブラウザ環境でのHEAP初期化が正常に機能することを確認（既存の動作を継続）
  - _Requirements: 3.4_

- [ ] 10. コードレビューと品質確認
- [ ] 10.1 統一されたHEAP初期化ロジックの一貫性確認
  - 7箇所の`onRuntimeInitialized`コールバックがすべて同じフォールバック戦略を実装していることをレビュー
  - 各コールバックのthis型指定（`this: EgaroucidWASMModule`）が正しく設定されていることを確認
  - エラーメッセージ`'Failed to initialize HEAP views'`が統一されていることを確認
  - _Requirements: 1.5, 4.3, 6.1_

- [ ] 10.2 TypeScript型安全性の最終確認
  - グローバルオブジェクトの型注釈がすべて正しく設定されていることを確認（`typeof global & { HEAP8?: Int8Array; ... }`）
  - Non-null assertion operator（`!`）がグローバルスコープからの取得時のみ使用されていることを確認
  - TypeScript strictモードでのコンパイルが成功することを確認
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 10.3 フォールバック戦略の優先順位確認
  - 各コールバックで戦略1（グローバルスコープ）が第一優先として実装されていることを確認
  - 戦略2（wasmMemory）が第二優先、戦略3（Module.memory）が第三優先として実装されていることを確認
  - いずれかの戦略が成功した時点で残りの戦略を試行せず、早期リターンすることを確認
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

## タスク実装ガイド

### HEAP初期化ロジックの標準実装

すべてのタスク（1.1-7.1）で使用する統一されたコードパターン：

```typescript
onRuntimeInitialized: function (this: EgaroucidWASMModule) {
  // グローバルオブジェクトの型注釈（要件4.1）
  const globalObj = global as typeof global & {
    HEAP8?: Int8Array;
    HEAPU8?: Uint8Array;
    HEAP32?: Int32Array;
    HEAPU32?: Uint32Array;
    wasmMemory?: WebAssembly.Memory;
  };

  // 戦略1: グローバルスコープから取得（要件5.1）
  if (globalObj.HEAP32) {
    // 要件4.2: Non-null assertion operator使用
    this.HEAP8 = globalObj.HEAP8!;
    this.HEAPU8 = globalObj.HEAPU8!;
    this.HEAP32 = globalObj.HEAP32!;
    this.HEAPU32 = globalObj.HEAPU32!;
  }
  // 戦略2: wasmMemory.bufferから新規作成（要件5.2）
  else if (globalObj.wasmMemory) {
    const buffer = globalObj.wasmMemory.buffer;
    this.HEAP8 = new Int8Array(buffer);
    this.HEAPU8 = new Uint8Array(buffer);
    this.HEAP32 = new Int32Array(buffer);
    this.HEAPU32 = new Uint32Array(buffer);
  }
  // 戦略3: Module.memory.bufferから新規作成（要件5.3）
  else if (this.memory && this.memory.buffer) {
    const buffer = this.memory.buffer;
    this.HEAP8 = new Int8Array(buffer);
    this.HEAPU8 = new Uint8Array(buffer);
    this.HEAP32 = new Int32Array(buffer);
    this.HEAPU32 = new Uint32Array(buffer);
  }

  // 成功確認とエラーハンドリング（要件5.4, 6.1, 6.2）
  if (this.HEAP32) {
    resolve(this);
  } else {
    reject(new Error('Failed to initialize HEAP views'));
  }
}
```

### 修正対象ファイルと行番号

1. **wasm.integration.test.ts**
   - 行68付近（Task 5.1）
   - 行249付近（Task 5.2）
   - 行1058付近（Task 5.3）
   - 行1400付近（Task 5.4）
   - 行1616付近（Task 5.5）
   - 行1945付近（Task 5.6）

2. **ai-engine.integration.test.ts**
   - 行47付近（AIEngine統合テスト）

### 並列実行について

- タスク1.1-7.1は並列実行可能（`(P)`マーク付き）：各テストスイートのセットアップは独立しており、異なるファイルまたは異なるテストブロックを修正するため、ファイル競合なし
- タスク8.1-8.3は順次実行推奨：テスト実行結果を段階的に確認
- タスク9.1-9.2は並列実行可能：Git status確認とE2Eテスト実行は独立
- タスク10.1-10.3は並列実行可能：異なる観点でのレビュー

### 検証チェックリスト

各タスク完了時に以下を確認：

- [ ] 型注釈が正しく設定されている
- [ ] 3段階のフォールバック戦略がすべて実装されている
- [ ] エラーメッセージが統一されている（`'Failed to initialize HEAP views'`）
- [ ] `this`の型指定が`EgaroucidWASMModule`になっている
- [ ] TypeScriptのコンパイルエラーがない

### 要件カバレッジマトリクス

| 要件ID | タスク                                  |
| ------ | --------------------------------------- |
| 1.1    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1       |
| 1.2    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1       |
| 1.3    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1       |
| 1.4    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1       |
| 1.5    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.1 |
| 2.1    | 1.1, 8.1                                |
| 2.2    | 2.1, 8.1                                |
| 2.3    | 3.1, 8.1                                |
| 2.4    | 4.1, 8.1                                |
| 2.5    | 5.1, 8.1                                |
| 2.6    | 6.1, 8.1                                |
| 2.7    | 7.1, 8.2                                |
| 2.8    | 8.1, 8.2, 8.3                           |
| 3.1    | 9.1                                     |
| 3.2    | 9.1                                     |
| 3.3    | 9.1                                     |
| 3.4    | 9.2                                     |
| 4.1    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.2 |
| 4.2    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.2 |
| 4.3    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.1 |
| 4.4    | 8.3, 10.2                               |
| 5.1    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.3 |
| 5.2    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.3 |
| 5.3    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.3 |
| 5.4    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.3 |
| 6.1    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.1 |
| 6.2    | 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1       |
| 6.3    | （Jestの標準機能、実装不要）            |

全要件がタスクでカバーされています。
