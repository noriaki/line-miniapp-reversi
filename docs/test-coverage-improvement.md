# テストカバレッジ改善プラン

## 目標

全てのカバレッジ指標を90%以上にする

## カバレッジ指標

- Statements (文)
- Branches (分岐)
- Functions (関数)
- Lines (行)

## 現在の状況

**全体指標（目標: 90%以上）:**

- Statements: 82.74% ❌ (目標まで +7.26%)
- Branches: 75.86% ❌ (目標まで +14.14%)
- Functions: 77.86% ❌ (目標まで +12.14%)
- Lines: 82.6% ❌ (目標まで +7.4%)

## 対応が必要なファイル

### 優先度: 高（カバレッジ0%または50%未満）

1. **src/hooks/useAIPlayer.ts** - 全指標 0% 🚨
   - Statements: 0% (0/98行)
   - Branches: 0%
   - Functions: 0%
   - Lines: 0%

2. **src/components/WASMErrorHandler.tsx** - 平均 57.9%
   - Statements: 64.7%
   - Branches: 62.5%
   - Functions: 40% 🚨
   - Lines: 64.7%

### 優先度: 中（50%以上70%未満）

3. **src/lib/ai/wasm-loader.ts** - 平均 52.3%
   - Statements: 63.04%
   - Branches: 32.35% 🚨
   - Functions: 50%
   - Lines: 63.04%

### 優先度: 低（70%以上90%未満）

4. **src/components/ErrorBoundary.tsx** - 平均 68.1%
   - Statements: 73.68%
   - Branches: 75%
   - Functions: 50% 🚨
   - Lines: 73.68%

5. **src/components/GameBoard.tsx** - 平均 84.5%
   - Statements: 81.13%
   - Branches: 90.09% ✅
   - Functions: 83.33%
   - Lines: 83.49%

6. **src/lib/game/move-history.ts** - 平均 69.3%
   - Statements: 72.72%
   - Branches: 62.5%
   - Functions: 100% ✅
   - Lines: 72.72%

7. **src/lib/ai/index.ts** - 一部の関数が未使用
   - Statements: 100% ✅
   - Branches: 100% ✅
   - Functions: 42.85% 🚨
   - Lines: 100% ✅

## 対応プラン

各ファイルごとの詳細な対応方針を以下に記録します。

---

### 1. src/hooks/useAIPlayer.ts (カバレッジ 0%)

**現状分析:**

- テストファイルが存在しない
- 98行すべてが未カバー
- Web Workerを使用したAI計算フック
- テスト環境では14-16行目で早期リターンするため、実質的に何も実行されない

**未カバー箇所:**

- Worker初期化ロジック (11-24行)
- Workerクリーンアップ (28-30行)
- calculateMove関数全体 (34-96行)
  - Workerなし時のフォールバック (36-47行)
  - タイムアウト処理 (50-61行)
  - メッセージハンドラー (64-84行)
  - Workerへのメッセージ送信 (86-92行)

**対応方針:**

1. **テストファイルの作成**: `src/hooks/__tests__/useAIPlayer.test.ts`
2. **Worker のモック作成**:
   - `@testing-library/react` の `renderHook` を使用
   - Workerのコンストラクタとメソッドをモック
3. **テストケース**:
   - ✅ Worker初期化成功
   - ✅ Worker初期化失敗（エラーハンドリング）
   - ✅ calculateMove: 成功パス（Workerから正常な応答）
   - ✅ calculateMove: Workerが初期化されていない場合のフォールバック
   - ✅ calculateMove: タイムアウト時のフォールバック
   - ✅ calculateMove: Workerエラー時のフォールバック
   - ✅ calculateMove: フォールバックも失敗する場合のエラー
   - ✅ Workerのクリーンアップ（アンマウント時）
4. **テスト環境の早期リターンを削除または条件付きに変更**
   - モックWorkerを使用できるように修正が必要

**推定工数**: 中（2-3時間）
**優先度**: 最高（0%のため）
**影響**: Statements +7.4%, Branches +9.8%, Functions +7.0%, Lines +7.4%

---

### 2. src/components/WASMErrorHandler.tsx (カバレッジ 64.7%)

**現状分析:**

- テストファイルは存在するが、一部のケースが未カバー
- 既存テスト: `src/components/__tests__/WASMErrorHandler.test.tsx`
- 6つのテストケースがあるが、全てのエラータイプとインタラクションをカバーしていない

**未カバー箇所:**

- 行33: `instantiation_failed` (wasm_load_error) のケース
- 行50: `wasm_load_failed` (initialization_error) のケース
- 行62: `test_call_failed` (initialization_error) のケース
- 行80: `handleReload` 関数（リロードボタンのクリック）
- 行198, 201: マウスオーバー/アウトイベントハンドラー

**カバー済み:**

- ✅ fetch_failed (wasm_load_error)
- ✅ initialization_timeout (wasm_load_error)
- ✅ wasm_instantiation_failed (initialization_error)

**対応方針:**

1. **既存テストファイルに追加テストケースを追加**:
   - `wasm_load_error` の `instantiation_failed` ケース
   - `initialization_error` の `wasm_load_failed` ケース
   - `initialization_error` の `test_call_failed` ケース
2. **インタラクションテストの追加**:
   - リロードボタンのクリックテスト (window.location.reload のモック)
   - マウスオーバー/アウトイベントのテスト（スタイル変更の確認）
3. **テストケース構成**:
   - describe: "All error types coverage"
     - ✅ 各エラータイプ・理由の組み合わせをテスト
   - describe: "User interactions"
     - ✅ リロードボタンクリック
     - ✅ ボタンホバーエフェクト

**推定工数**: 小（30分-1時間）
**優先度**: 高
**影響**: Statements +2.1%, Branches +2.8%, Functions +3.0%, Lines +2.1%

---

### 3. src/lib/ai/wasm-loader.ts (カバレッジ 63.04%)

**現状分析:**

- テストファイルは存在: `src/lib/ai/__tests__/wasm-loader-emscripten.test.ts`
- 基本的なケースはカバーされているが、エッジケースやエラーハンドリングが未カバー
- Emscripten を使用した WASM ローダーの複雑なロジック

**未カバー箇所:**

- 行59-63: `locateFile` コールバック（Module.locateFile 内）
  - ai.wasm の場合のパス解決
  - その他のファイルの場合のパス解決
- 行105: タイムアウト時の reject
- 行113-123: `onRuntimeInitialized` コールバック内
  - HEAP8, HEAPU8, HEAP32, HEAPU32 のコピー
  - memory オブジェクトの設定
  - timeout のクリア
- 行139-147: \_malloc/\_free が見つからない場合のエラー
- 行161-172: タイムアウトエラーハンドリング
- 行175-182: その他のエラーハンドリング
- 行199: isModuleReady の false パス

**カバー済み:**

- ✅ importScripts が利用不可（Worker 以外）
- ✅ importScripts がエラーを投げる
- ✅ Module が利用不可
- ✅ \_init_ai の呼び出し
- ✅ パス解析（ai.js の導出）

**対応方針:**

1. **既存テストファイルに追加テストケースを追加**:
   - `locateFile` コールバックのテスト
     - ai.wasm の場合の絶対 URL 返却
     - その他のファイルの場合の as-is 返却
   - タイムアウトシナリオ
     - onRuntimeInitialized が10秒以内に呼ばれない場合
   - `onRuntimeInitialized` 内の処理
     - HEAP 変数のコピー確認
     - memory オブジェクトの設定確認
   - \_malloc/\_free が欠落しているケース
     - Module に \_malloc または \_free が存在しない場合
   - その他のエラーケース
     - 予期しない例外の処理
2. **isModuleReady の追加テスト**:
   - null/undefined の場合
   - 必要な関数が欠けている場合
   - すべての関数が揃っている場合

**推定工数**: 中（1.5-2時間）
**優先度**: 中
**影響**: Statements +2.2%, Branches +4.8%, Functions +3.0%, Lines +2.2%

---

### 4. src/components/ErrorBoundary.tsx (カバレッジ 73.68%)

**現状分析:**

- テストファイルは存在: `src/components/__tests__/ErrorBoundary.test.tsx`
- 基本的なエラーキャッチとリトライ機能はテスト済み
- リロードボタンとホバーエフェクトが未テスト

**未カバー箇所:**

- 行80: `handleReload` 関数（リロードボタンのクリック）
- 行195, 198: 再試行ボタンのマウスオーバー/アウトイベントハンドラー
- 行216, 219: リロードボタンのマウスオーバー/アウトイベントハンドラー

**カバー済み:**

- ✅ エラーキャッチとエラーUI表示
- ✅ エラーログ（ErrorLog形式）
- ✅ リトライボタンのクリック
- ✅ 正常なレンダリング（エラーなし）

**対応方針:**

1. **既存テストファイルに追加テストケースを追加**:
   - リロードボタンのクリックテスト
     - window.location.reload のモック
     - リロードボタンクリック時の動作確認
   - ボタンホバーエフェクトのテスト
     - 再試行ボタンのマウスオーバー時のスタイル変更
     - 再試行ボタンのマウスアウト時のスタイル復元
     - リロードボタンのマウスオーバー時のスタイル変更
     - リロードボタンのマウスアウト時のスタイル復元
2. **テストケース構成**:
   - describe: "Reload functionality"
     - ✅ リロードボタンクリック時の window.location.reload 呼び出し
   - describe: "Button hover effects"
     - ✅ 各ボタンのホバーエフェクト

**推定工数**: 小（30分）
**優先度**: 低
**影響**: Statements +1.6%, Branches +1.9%, Functions +3.0%, Lines +1.6%

---

### 5. src/components/GameBoard.tsx (カバレッジ 81.13%)

**現状分析:**

- 複数のテストファイルが存在:
  - `GameBoard.test.tsx` (メインテスト)
  - `GameBoard-error-handling.test.tsx` (エラーハンドリング)
  - `GameBoard-pass-logic.test.tsx` (パスロジック)
  - `GameBoard-pass-performance.test.tsx` (パスパフォーマンス)
  - `GameBoard-liff.test.tsx` (LIFF統合)
  - `GameBoard.integration.test.tsx` (統合テスト)
  - `GameBoard.final-verification.test.tsx` (最終検証)
- 基本機能は十分カバーされているが、一部のエッジケースが未カバー

**未カバー箇所:**

- 行69: `handleLineLogin` 内の catch ブロック（LINE ログイン失敗）
- 行87-90: `handlePass` - ゲームがプレイ中でない場合のエラーログ
- 行98-99: `handlePass` - 有効な手が存在するのにパスボタンがクリックされた場合
- 行156-160: ゲーム終了後のプレイヤー切り替え（ゲームが終了しない場合）
- 行187-191: `consecutivePassCount` の範囲外の値エラー（< 0 または > 2）
- 行242-243: AI が無効な手を返した場合のエラーハンドリング
- 行276: AI の手でゲームが終了しなかった場合の分岐
- 行290-292: AI 計算エラー時の catch ブロック
- 行331-332: エラーメッセージまたはパスメッセージの条件分岐

**カバー済み:**

- ✅ 基本的なゲームフロー
- ✅ パスロジック（正常系）
- ✅ エラーハンドリング（主要なケース）
- ✅ LIFF 統合
- ✅ AI プレイヤー（正常系）

**対応方針:**

1. **既存テストファイルに追加テストケースを追加**:
   - `GameBoard-liff.test.tsx` に追加:
     - LINE ログイン失敗時のエラーハンドリング
   - `GameBoard-pass-logic.test.tsx` に追加:
     - ゲームがプレイ中でない時にパスを試みる
     - 有効な手が存在する時にパスボタンをクリック
   - `GameBoard-error-handling.test.tsx` に追加:
     - `consecutivePassCount` が範囲外の値の場合
     - AI が無効な手を返した場合
     - AI 計算がエラーを投げた場合
   - `GameBoard.test.tsx` に追加:
     - エラーメッセージとパスメッセージの表示条件
2. **新規テストケース**:
   - エッジケースの網羅的なテスト

**推定工数**: 中（1.5-2時間）
**優先度**: 中
**影響**: Statements +1.4%, Branches +0.7%, Functions +1.0%, Lines +1.3%

---

### 6. src/lib/game/move-history.ts (カバレッジ 72.72%)

**現状分析:**

- テストファイルは存在: `src/lib/game/__tests__/move-history.test.ts`
- 正常系と境界値は十分カバーされている
- エラーケース（範囲外の位置）が未カバー

**未カバー箇所:**

- 行24-27: `positionToNotation` で範囲外の位置を渡した場合
  - row < 0 または row > 7
  - col < 0 または col > 7
  - 開発環境での console.warn
  - "??" の返却

**カバー済み:**

- ✅ 正常な位置の変換（全ての行・列）
- ✅ 境界値テスト（0,0）（7,7）
- ✅ generateNotationString の全ケース
- ✅ パフォーマンステスト

**対応方針:**

1. **既存テストファイルに追加テストケースを追加**:
   - describe: "invalid position tests"
     - ✅ row が 0 未満の場合
     - ✅ row が 7 より大きい場合
     - ✅ col が 0 未満の場合
     - ✅ col が 7 より大きい場合
     - ✅ 開発環境での console.warn 呼び出し確認
     - ✅ "??" が返却されることを確認

**推定工数**: 小（20分）
**優先度**: 低
**影響**: Statements +0.2%, Branches +2.8%, Functions +0%, Lines +0.2%

---

### 7. src/lib/ai/index.ts (Functions カバレッジ 42.85%)

**現状分析:**

- テストファイルは存在: `src/lib/ai/__tests__/index.test.ts`
- Export のみのファイル（実装なし）
- 一部の export が index.ts 経由で使用されていないため、Functions カバレッジが低い
- 実際の機能は他のファイル（ai-engine.ts, wasm-loader.ts, wasm-bridge.ts）でテスト済み

**未カバー箇所:**

- `loadWASM` の export（anonymous_1）
- `encodeBoard` の export（anonymous_3）
- `callAIFunction` の export（anonymous_5）
- `freeMemory` の export（anonymous_6）

**カバー済み:**

- ✅ AIEngine の export
- ✅ isModuleReady の export
- ✅ decodeResponse の export

**対応方針:**

1. **既存テストファイルに追加テストケースを追加**:
   - `loadWASM` を index.ts 経由でインポートして簡易テスト
   - `encodeBoard` を index.ts 経由でインポートして簡易テスト
   - `callAIFunction` を index.ts 経由でインポートして簡易テスト
   - `freeMemory` を index.ts 経由でインポートして簡易テスト
2. **注意点**:
   - これらの関数は実際には他のテストファイルで十分にテストされている
   - このテストは index.ts のエクスポートが正しく機能することを確認するためのもの
   - 深いテストは不要（各関数の詳細なテストは他のファイルで実施済み）

**推定工数**: 小（15分）
**優先度**: 低
**影響**: Statements +0%, Branches +0%, Functions +3.4%, Lines +0%

---

## 全体サマリー

### 推定される改善後の指標

すべての対応を完了した場合の推定カバレッジ：

| 指標           | 現在   | 改善幅 | 目標値      | 達成見込み          |
| -------------- | ------ | ------ | ----------- | ------------------- |
| **Statements** | 82.74% | +14.9% | **97.64%**  | ✅ 90%超            |
| **Branches**   | 75.86% | +33.0% | **108.86%** | ✅ 90%超 (実質100%) |
| **Functions**  | 77.86% | +26.4% | **104.26%** | ✅ 90%超 (実質100%) |
| **Lines**      | 82.6%  | +14.8% | **97.4%**   | ✅ 90%超            |

**注意**: 改善幅は各ファイルの影響を単純に合算したものです。実際の改善幅は、ファイル間の依存関係やテストの重複により異なる場合があります。

### 優先順位別の対応計画

#### フェーズ1: 高優先度（目標カバレッジへの影響大）

1. **src/hooks/useAIPlayer.ts** (0% → 90%+)
   - 影響: 全指標 +7-10%
   - 工数: 2-3時間
   - **最優先**: カバレッジ0%のため

2. **src/components/WASMErrorHandler.tsx** (64.7% → 90%+)
   - 影響: 全指標 +2-3%
   - 工数: 30分-1時間

3. **src/lib/ai/wasm-loader.ts** (63.04% → 90%+)
   - 影響: Branches +4.8%, 他 +2-3%
   - 工数: 1.5-2時間

#### フェーズ2: 中優先度（エッジケース対応）

4. **src/components/ErrorBoundary.tsx** (73.68% → 90%+)
   - 影響: 全指標 +1.6-3%
   - 工数: 30分

5. **src/components/GameBoard.tsx** (81.13% → 90%+)
   - 影響: Statements +1.4%, Functions +1%
   - 工数: 1.5-2時間

#### フェーズ3: 低優先度（細かい改善）

6. **src/lib/game/move-history.ts** (72.72% → 90%+)
   - 影響: Branches +2.8%
   - 工数: 20分

7. **src/lib/ai/index.ts** (42.85% Functions → 90%+)
   - 影響: Functions +3.4%
   - 工数: 15分

### 総工数

- **最小工数**: 約6.5時間
- **最大工数**: 約9時間
- **推奨アプローチ**: フェーズごとに実施し、各フェーズ後にカバレッジを確認

---

## 実装アクションプラン

### ステップ1: 環境準備

- [ ] テストカバレッジベースラインを記録
- [ ] ブランチ作成: `feature/test-coverage-improvement`

### ステップ2: フェーズ1実装（高優先度）

- [ ] useAIPlayer.ts のテスト追加
- [ ] WASMErrorHandler.tsx のテスト追加
- [ ] wasm-loader.ts のテスト追加
- [ ] カバレッジ確認: 目標 Statements 90%+

### ステップ3: フェーズ2実装（中優先度）

- [ ] ErrorBoundary.tsx のテスト追加
- [ ] GameBoard.tsx のテスト追加
- [ ] カバレッジ確認: 目標 All 90%+

### ステップ4: フェーズ3実装（低優先度）

- [ ] move-history.ts のテスト追加
- [ ] index.ts のテスト追加
- [ ] 最終カバレッジ確認

### ステップ5: 完了

- [ ] すべてのテストがパスすることを確認
- [ ] カバレッジレポート生成
- [ ] Pull Request 作成
- [ ] レビュー対応
- [ ] マージ

---

## 参考コマンド

```bash
# カバレッジレポート生成
pnpm test:coverage

# 特定ファイルのテスト実行
pnpm test src/hooks/__tests__/useAIPlayer.test.ts

# カバレッジレポートをブラウザで確認
open coverage/lcov-report/index.html
```
