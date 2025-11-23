# 統合検証レポート: wasm-heap-init-fix

**生成日時**: 2025-11-23
**検証対象**: WASM HEAP初期化問題の修正仕様
**検証フェーズ**: ギャップ分析 + 設計レビュー

---

## 📊 検証結果サマリー

### 1. ギャップ分析（validate-gap）

- **ステータス**: ✅ 完了
- **推奨アプローチ**: Option A（既存テストコード修正）
- **実装複雑度**: S（1-3日）
- **リスク**: Low
- **スコープ**: Node.js環境のWASM統合テスト（7箇所）におけるHEAPビュー初期化問題の修正

### 2. 設計レビュー（validate-design）

- **ステータス**: ⚠️ 条件付きGO
- **決定**: 設計の方向性は健全だが、3つのCritical Issuesの修正が必要
- **次ステップ**: 設計書の修正後、タスク生成フェーズへ進行

---

## 🔍 ギャップ分析からの知見

### 既存実装の状況

**現在の初期化パターン**（7箇所で共通）:

```typescript
onRuntimeInitialized: function (this: EgaroucidWASMModule) {
  const globalObj = global as typeof global & {
    HEAP8?: Int8Array;
    HEAPU8?: Uint8Array;
    HEAP32?: Int32Array;
    HEAPU32?: Uint32Array;
  };

  // ❌ 問題: グローバルスコープにHEAPビューが存在しない
  this.HEAP8 = globalObj.HEAP8!;   // undefined
  this.HEAPU8 = globalObj.HEAPU8!; // undefined
  this.HEAP32 = globalObj.HEAP32!; // undefined → エラー発生
  this.HEAPU32 = globalObj.HEAPU32!; // undefined

  resolve(this);
}
```

**問題の原因**:

- `new Function()` によるスコープ分離で、Emscriptenが生成するグローバル変数がテストスコープに閉じ込められる
- `public/ai.js`（minified版）では `Module.HEAP32 = HEAP32` の二重代入が欠落

**影響範囲**:

- 7箇所の統合テスト:
  - `wasm.integration.test.ts`: 6箇所（Task 5.1-5.6）
  - `ai-engine.integration.test.ts`: 1箇所
- 565個のテストケースのうち46個が失敗

### 本番環境の成功パターン

**ファイルパス**: `src/lib/ai/wasm-loader.ts:116-122`

```typescript
// Web Worker環境では既に解決済み
Module.onRuntimeInitialized = () => {
  const globalScope = self as any;
  Module.HEAP8 = globalScope.HEAP8;
  Module.HEAPU8 = globalScope.HEAPU8;
  Module.HEAP32 = globalScope.HEAP32;
  Module.HEAPU32 = globalScope.HEAPU32;
  Module.memory = globalScope.wasmMemory || { buffer: Module.HEAP8?.buffer };
};
```

**重要な知見**: 本番コードは既にグローバルスコープからHEAPビューをコピーする実装を持っているが、フォールバックロジックは持たない。

### 技術的ギャップの特定

| カテゴリ               | 項目                    | ステータス | 詳細                                                                                     |
| ---------------------- | ----------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| **Missing Capability** | 3段階フォールバック戦略 | ❌ Missing | 現在は戦略1（グローバルスコープ）のみ。戦略2（wasmMemory）、戦略3（Module.memory）が欠落 |
| **Missing Capability** | エラーハンドリング      | ⚠️ Partial | Promise reject は実装済みだが、フォールバック失敗時の明確なエラーメッセージが欠落        |
| **Constraint**         | 型システム制約          | ⚠️         | `EgaroucidWASMModule` の HEAP プロパティは必須型。初期化失敗時は reject で対応必須       |
| **Constraint**         | 本番ファイル不変性      | ✅         | `public/ai.js` と `public/ai.wasm` を変更できない制約を尊重                              |

### 実装アプローチの評価

**Option A: Extend Existing Test Code（推奨）**

**概要**: 既存の7箇所の `onRuntimeInitialized` コールバックを拡張し、3段階フォールバック戦略を実装

**変更対象ファイル**:

1. `src/lib/ai/__tests__/wasm.integration.test.ts` (6箇所)
2. `src/lib/ai/__tests__/ai-engine.integration.test.ts` (1箇所)

**実装パターン**:

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

**メリット/デメリット**:

| メリット                              | デメリット                            |
| ------------------------------------- | ------------------------------------- |
| ✅ 本番ファイルを変更不要             | ❌ 7箇所の重複コード（DRY原則違反）   |
| ✅ テストの安定性向上                 | ⚠️ 各テストスイートでコード行数が増加 |
| ✅ 異なるEmscriptenバージョンで互換性 | -                                     |
| ✅ 実装が単純（条件分岐のみ）         | -                                     |

**複雑性**: Low

- 各箇所で20-30行のコード追加
- ロジックは条件分岐のみ（ループ、非同期処理なし）
- 同一パターンを7箇所に適用

**Option B: Replace Production WASM Files（非推奨）**

❌ 要件3（本番環境への影響排除）に違反するため不採用

**Option C: Use vm.runInNewContext（フォールバック）**

⚠️ Option Aで解決しない場合のフォールバックとして保持

### 工数見積もりとリスク評価

**工数**: S (1-3日)

- 7箇所の `onRuntimeInitialized` 修正: 1日
- テスト実行と検証（565テスト）: 0.5日
- ドキュメント更新とコミット: 0.5日

**リスク**: Low

**理由**:

- ✅ 既知の技術: TypedArray、条件分岐、Promiseパターン - すべて既存コードで使用済み
- ✅ 明確なスコープ: テストコードのみ変更、本番コードへの影響なし
- ✅ 実証済みパターン: `wasm-loader.ts` で既に同様のロジック実装済み
- ✅ 詳細な要件定義: 要件ドキュメントで全6要件、21の受け入れ基準が明確
- ✅ 検証可能性: 565個の既存テストで自動検証可能

**潜在的リスク**:

| リスク                                 | 影響度   | 緩和策                                         |
| -------------------------------------- | -------- | ---------------------------------------------- |
| 7箇所で異なる挙動が発生                | Low      | 統一パターン使用、コピー＆ペーストで一貫性確保 |
| 特定のEmscriptenバージョンで動作しない | Low      | 3段階フォールバックで複数環境に対応            |
| TypeScriptコンパイルエラー             | Very Low | 既存の型注釈パターンを踏襲                     |

---

## 🔴 設計レビューからのCritical Issues

### Critical Issue 1: フォールバック戦略の実装の不完全性

**Concern**: 設計書のフローチャート（design.md:99-119）と状態管理コード（design.md:259-290）では、各フォールバック戦略が失敗した場合に次の戦略に進む条件が明確に記述されていますが、実装例では戦略2と戦略3で`buffer`が取得できなかった場合のエラーハンドリングが欠落しています。`wasmMemory.buffer`や`Module.memory.buffer`が存在しても、実際には`undefined`や無効な値である可能性があります。

**Impact**: 戦略2または戦略3で無効なバッファから型付き配列を作成しようとした場合、JavaScriptランタイムエラー（TypeError）が発生し、Promiseがrejectされる前にテストがクラッシュする可能性があります。これは要件6.1（明確なエラーメッセージでのPromise reject）を満たしません。

**Suggestion**: 各フォールバック戦略でバッファの有効性を確認し、無効な場合は次の戦略に進むロジックを追加してください。

**推奨コード**:

```typescript
else if (globalObj.wasmMemory && globalObj.wasmMemory.buffer) {
  const buffer = globalObj.wasmMemory.buffer;
  this.HEAP8 = new Int8Array(buffer);
  this.HEAPU8 = new Uint8Array(buffer);
  this.HEAP32 = new Int32Array(buffer);
  this.HEAPU32 = new Uint32Array(buffer);
}
else if (this.memory && this.memory.buffer) {
  const buffer = this.memory.buffer;
  this.HEAP8 = new Int8Array(buffer);
  this.HEAPU8 = new Uint8Array(buffer);
  this.HEAP32 = new Int32Array(buffer);
  this.HEAPU32 = new Uint32Array(buffer);
}
```

**Traceability**: 要件1.2, 1.3, 1.4, 6.1, 6.2

**Evidence**: 設計書「State Management」セクション（行247-290）、「System Flows」セクション（行96-125）

---

### Critical Issue 2: 型安全性の不整合

**Concern**: 要件4.2では「Non-null assertion operator（`!`）をグローバルスコープからHEAPビューを取得する際にのみ使用する」と規定されていますが、状態管理コードの戦略1（design.md:262-266）では`globalObj.HEAP32`の存在確認後に`globalObj.HEAP8!`、`globalObj.HEAPU8!`などに対して`!`を使用しています。しかし、`globalObj.HEAP32`の存在が他のHEAPビューの存在を保証するという根拠が設計書に記載されていません。

**Impact**: `globalObj.HEAP32`は存在するが`globalObj.HEAP8`が`undefined`である環境が存在した場合、Non-null assertionにより型チェックをバイパスし、ランタイムエラーが発生します。これは要件4.4（TypeScript strictモード準拠）の意図に反します。

**Suggestion**: 以下の2つのオプションのいずれかを選択してください:

**オプション1: すべてのHEAPビューを個別に確認**

```typescript
if (
  globalObj.HEAP32 &&
  globalObj.HEAP8 &&
  globalObj.HEAPU8 &&
  globalObj.HEAPU32
) {
  this.HEAP8 = globalObj.HEAP8;
  this.HEAPU8 = globalObj.HEAPU8;
  this.HEAP32 = globalObj.HEAP32;
  this.HEAPU32 = globalObj.HEAPU32;
}
```

**オプション2: 設計書に根拠を記載**

設計書に「Emscriptenの仕様上、HEAP32が存在する場合は他のHEAPビュー（HEAP8、HEAPU8、HEAPU32）も必ず存在する」という根拠を記載し、現在の実装を正当化する。

**Traceability**: 要件4.2, 4.4

**Evidence**: 設計書「Components and Interfaces」セクション（行247-290）、「Requirements Traceability」セクション（行149）

---

### Critical Issue 3: 本番コードとの整合性検証の欠落

**Concern**: 設計書では「Existing Architecture Analysis」セクション（design.md:28-67）で本番コードのパターン（`wasm-loader.ts:116-122`）を参照していますが、実際にテストコードの修正が本番環境の動作と整合性を持つかを検証する手順が「Testing Strategy」セクション（design.md:428-477）に含まれていません。統合テストが成功しても、本番環境（Web Worker）での動作が変わらないことを確認する必要があります。

**Impact**: テストコードの修正が、意図せず本番環境のWASMロードロジックに依存する前提を変更した場合、E2Eテストでは検出されない可能性があります（E2Eテストは変更不要と記載）。これは要件3.4（Web Worker環境での既存動作維持）のリスクです。

**Suggestion**: 「Testing Strategy」セクションに以下を追加してください:

1. **E2Eテストの実行による本番環境整合性検証**:
   - 修正後に既存のE2Eテスト（Playwright）を実行し、本番環境での動作に変化がないことを確認する
   - 特に、ゲームプレイとAI計算の動作が変わらないことを検証

2. **統合テストへのアサーション追加**（オプション）:
   - `wasm-loader.ts`のHEAPビュー初期化ロジックと、テストコードの新しいロジックが同じメモリバッファを使用していることを確認するアサーションを統合テストに追加

**Traceability**: 要件3.4, 2.8

**Evidence**: 設計書「Testing Strategy」セクション（行428-477）、「E2E/UI Tests」（行466-468）

---

## ✨ 設計の強み

以下の点は設計の健全性を示しており、評価できます:

1. **明確なフォールバック戦略と優先順位**: 3段階のフォールバック戦略（グローバルスコープ → wasmMemory → Module.memory）は、異なる環境やEmscriptenバージョンへの対応を考慮しており、拡張性が高いです。特に、本番コード（`wasm-loader.ts`）との整合性を優先する設計は、既存アーキテクチャとの統合を重視しており、技術的負債を最小化します。

2. **本番環境への影響の完全排除**: テストコードのみを修正し、`public/ai.js`や`public/ai.wasm`に一切手を加えないアプローチは、デプロイメントリスクをゼロにします。Requirement 3（本番環境への影響排除）を完全に満たしており、安全性の高い設計です。

---

## ❓ 設計レビューからの質問（要確認）

設計をさらに堅牢にするため、以下3点の確認が必要です:

### 質問1: HEAP32の存在確認だけで十分な理由

Emscriptenの仕様上、`HEAP32`が存在する場合は他のHEAPビュー（`HEAP8`、`HEAPU8`、`HEAPU32`）も必ず存在するという保証はありますか？

- **YES**: 設計書に根拠を記載することで、Critical Issue 2は解消されます
- **NO**: すべてのHEAPビューを個別に確認するロジックに変更が必要です

**関連**: Critical Issue 2

---

### 質問2: 本番コードの整合性確認の必要性

`wasm-loader.ts`の実装と今回のテストコード修正が、同じメモリバッファを参照することを確認するために、統合テストにアサーションを追加する必要性をどう考えますか？

- **オプションA**: E2Eテストの実行で十分
- **オプションB**: 統合テストにアサーションを追加して明示的に検証

**関連**: Critical Issue 3

---

### 質問3: フォールバック戦略のエラーハンドリング

戦略2および戦略3で、バッファが取得できても無効な値（例：`ArrayBuffer`のサイズが0）である可能性を考慮すべきでしょうか？

- **YES**: バッファのサイズ検証を追加
- **NO**: そのようなケースは現実的にありえないため、簡潔性を優先

**関連**: Critical Issue 1

---

## 📋 次のステップ

### 短期（設計修正フェーズ）

#### 1. 設計書の修正（推奨）

以下の3つのCritical Issuesに対応してください:

- [ ] **Issue 1対応**: 「State Management」セクション（design.md:247-290）にバッファ有効性確認ロジックを追加
- [ ] **Issue 2対応**: 型安全性の根拠を追加、またはすべてのHEAPビューの存在確認ロジックに変更
- [ ] **Issue 3対応**: 「Testing Strategy」セクション（design.md:428-477）にE2Eテスト実行による本番環境整合性検証を追加

#### 2. 質問への回答と設計書への反映

上記3つの質問に回答し、設計書に反映してください。

#### 3. 設計書の再レビュー（簡易確認）

修正後、設計書を簡易確認してください。Critical Issuesが解消されていれば、タスク生成フェーズに進めます。

### 中期（実装フェーズへの移行）

#### 4. タスク生成

```bash
/kiro:spec-tasks wasm-heap-init-fix [-y]
```

#### 5. 実装開始

```bash
/kiro:spec-impl wasm-heap-init-fix [tasks]
```

---

## ✅ 総合評価

### ギャップ分析

- **評価**: ✅ 明確な実装アプローチが特定され、リスクも低い
- **推奨アプローチ**: Option A（既存テストコード修正）
- **工数**: S（1-3日）
- **リスク**: Low

### 設計レビュー

- **評価**: ⚠️ 方向性は健全だが、実装前に3つのCritical Issuesの修正が必要
- **決定**: 条件付きGO
- **推奨**: 設計書を修正してから実装フェーズに進む

### 最終推奨

設計書を修正してから実装フェーズに進むことで、実装時のリスクを大幅に低減できます。特に、以下の点を明確化することが重要です:

1. フォールバック戦略の各ステップでのエラーハンドリング
2. 型安全性の根拠（HEAP32の存在が他のHEAPビューの存在を保証するか）
3. 本番環境との整合性検証手順（E2Eテストの実行）

これらの修正により、実装フェーズでの手戻りを最小化し、高品質な実装を実現できます。

---

## 📚 関連ドキュメント

- **要件**: `.specify/specs/wasm-heap-init-fix/requirements.md`
- **設計**: `.specify/specs/wasm-heap-init-fix/design.md`
- **タスク**: `.specify/specs/wasm-heap-init-fix/tasks.md`
- **調査**: `.specify/specs/wasm-heap-init-fix/research.md`
- **技術ドキュメント**: `docs/wasm-heap-access-issue.md`
- **テストファイル**: `src/lib/ai/__tests__/wasm.integration.test.ts`
- **本番コード**: `src/lib/ai/wasm-loader.ts`

---

**生成者**: Claude Code (validate-gap-agent + validate-design-agent)
**検証ルール**: `.specify/settings/rules/gap-analysis.md`, `.specify/settings/rules/design-review.md`
