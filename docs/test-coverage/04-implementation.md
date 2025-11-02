# テストカバレッジ改善プラン - 実装アクションプラン

このドキュメントでは、テストカバレッジ改善の実装手順とコマンドを記載します。

---

## 実装アクションプラン

### ステップ1: 環境準備

- [x] テストカバレッジベースラインを記録
- [x] ブランチ作成: `feature/test-coverage-improvement`
- [ ] カバレッジ閾値の設定（`jest.config.js`）

```javascript
// jest.config.js に追加
module.exports = {
  // ... 既存の設定
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
```

### ステップ2: フェーズ1実装（高優先度）

- [ ] useAIPlayer.ts のテスト追加
  - [ ] Workerモックの作成
  - [ ] テストファイル作成: `src/hooks/__tests__/useAIPlayer.test.ts`
  - [ ] 全テストケースの実装
  - [ ] カバレッジ確認

- [ ] WASMErrorHandler.tsx のテスト追加
  - [ ] エラータイプの網羅
  - [ ] インタラクションテストの追加
  - [ ] カバレッジ確認

- [ ] wasm-loader.ts のテスト追加
  - [ ] エッジケースの追加
  - [ ] エラーハンドリングの追加
  - [ ] カバレッジ確認

- [ ] **カバレッジ確認**: 目標 Statements 90%+

### ステップ3: フェーズ2実装（中優先度）

- [ ] ErrorBoundary.tsx のテスト追加
  - [ ] リロード機能のテスト
  - [ ] ホバーエフェクトのテスト
  - [ ] カバレッジ確認

- [ ] GameBoard.tsx のテスト追加
  - [ ] LINEログインエラーのテスト
  - [ ] パスロジックのエッジケース
  - [ ] AIエラーハンドリング
  - [ ] カバレッジ確認

- [ ] **カバレッジ確認**: 目標 All 90%+

### ステップ4: フェーズ3実装（低優先度）

- [ ] move-history.ts のテスト追加
  - [ ] 範囲外の位置エラーケース
  - [ ] カバレッジ確認

- [ ] index.ts のテスト追加
  - [ ] エクスポート確認テスト
  - [ ] カバレッジ確認

- [ ] **最終カバレッジ確認**

### ステップ5: 完了

- [ ] すべてのテストがパスすることを確認
- [ ] カバレッジレポート生成
- [ ] ドキュメントの更新（達成したカバレッジ値）
- [ ] すべてのコミットをプッシュ

---

## コミット戦略

### 推奨アプローチ: 適切な粒度でのコミット分割

各フェーズ内でファイル単位または機能単位でコミットを分割することを推奨します：

#### フェーズ1: 高優先度

1. **useAIPlayer.ts のテスト追加**
   - コミットメッセージ例: `test(hooks): add tests for useAIPlayer (0% → 90%+)`
   - 内容:
     - Workerモックのセットアップ
     - Worker初期化のテスト
     - calculateMove関数のテスト
     - クリーンアップのテスト

2. **WASMErrorHandler.tsx のテスト追加**
   - コミットメッセージ例: `test(components): add missing tests for WASMErrorHandler`
   - 内容:
     - エラータイプの網羅テスト
     - インタラクションテスト（リロード、ホバー）

3. **wasm-loader.ts のテスト追加**
   - コミットメッセージ例: `test(lib/ai): add edge case tests for wasm-loader`
   - 内容:
     - locateFileコールバックのテスト
     - タイムアウトシナリオのテスト
     - エラーハンドリングのテスト

**フェーズ1完了後のカバレッジ確認コミット**:

- コミットメッセージ例: `docs(test): update coverage report after phase 1`

#### フェーズ2: 中優先度

1. **ErrorBoundary.tsx のテスト追加**
   - コミットメッセージ例: `test(components): add reload and hover tests for ErrorBoundary`
   - 内容:
     - リロード機能のテスト
     - ホバーエフェクトのテスト

2. **GameBoard.tsx のテスト追加**
   - コミットメッセージ例: `test(components): add edge case tests for GameBoard`
   - 内容:
     - LINEログインエラーのテスト
     - パスロジックのエッジケース
     - AIエラーハンドリング

**フェーズ2完了後のカバレッジ確認コミット**:

- コミットメッセージ例: `docs(test): update coverage report after phase 2`

#### フェーズ3: 低優先度

1. **move-history.ts と index.ts のテスト追加**
   - コミットメッセージ例: `test(lib): add remaining tests for move-history and ai/index`
   - 内容:
     - move-history.ts の範囲外エラーケース
     - index.ts のエクスポート確認テスト

**フェーズ3完了後の最終コミット**:

- コミットメッセージ例: `docs(test): achieve 90%+ coverage across all metrics`

### コミット分割の指針

1. **関連する変更をまとめる**: 1つのファイルのテスト追加は1コミット
2. **論理的な単位で分割**: 大きなファイルは機能ごとに分割も可
3. **意味のあるコミットメッセージ**: 何を追加したか明確に記述
4. **カバレッジの節目でコミット**: 各フェーズ完了時にドキュメント更新

### コミットメッセージの形式

Semantic Commit Messages 形式を使用：

```
test(<scope>): <subject>

<body>
```

**例**:

```
test(hooks): add tests for useAIPlayer (0% → 90%+)

- Add Worker mock setup in jest.setup.ts
- Test Worker initialization and cleanup
- Test calculateMove with various scenarios
- Test error handling and fallbacks

Coverage improved:
- Statements: 82.74% → 90.14% (+7.4%)
- Functions: 77.86% → 84.86% (+7.0%)
```

---

## 参考コマンド

### カバレッジレポート生成

```bash
# カバレッジレポート生成
pnpm test:coverage

# カバレッジレポートをブラウザで確認
open coverage/lcov-report/index.html
```

### 特定ファイルのテスト実行

```bash
# useAIPlayer のテスト実行
pnpm test src/hooks/__tests__/useAIPlayer.test.ts

# WASMErrorHandler のテスト実行
pnpm test src/components/__tests__/WASMErrorHandler.test.tsx

# wasm-loader のテスト実行
pnpm test src/lib/ai/__tests__/wasm-loader-emscripten.test.ts

# ErrorBoundary のテスト実行
pnpm test src/components/__tests__/ErrorBoundary.test.tsx

# GameBoard のテスト実行（すべてのテストファイル）
pnpm test src/components/__tests__/GameBoard

# move-history のテスト実行
pnpm test src/lib/game/__tests__/move-history.test.ts

# index.ts のテスト実行
pnpm test src/lib/ai/__tests__/index.test.ts
```

### ウォッチモードでのテスト実行

```bash
# ウォッチモードでテスト実行（変更を監視して自動実行）
pnpm test --watch

# 特定ファイルのウォッチモード
pnpm test --watch src/hooks/__tests__/useAIPlayer.test.ts
```

### カバレッジ閾値のチェック

```bash
# カバレッジ閾値を満たしているか確認
pnpm test:coverage

# 閾値を満たさない場合はエラーで終了
# jest.config.js の coverageThreshold 設定に従う
```

### テストの並列実行

```bash
# 最大ワーカー数を指定してテスト実行（デフォルトはCPUコア数-1）
pnpm test --maxWorkers=4

# シングルワーカーで実行（デバッグ時に便利）
pnpm test --maxWorkers=1
```

### カバレッジレポートの詳細表示

```bash
# カバレッジサマリーを表示
pnpm test:coverage --verbose

# 特定ファイルのカバレッジを表示
pnpm test:coverage --collectCoverageFrom='src/hooks/useAIPlayer.ts'
```

## 進捗の記録

各フェーズ完了後、このドキュメントまたは [00-overview.md](./00-overview.md) に進捗を記録：

### フェーズ1完了時

- 達成したカバレッジ値を記録
- 残りのフェーズの見積もりを更新

### フェーズ2完了時

- 達成したカバレッジ値を記録
- 90%目標の達成を確認

### フェーズ3完了時

- 最終カバレッジ値を記録
- 全ファイル90%達成を確認
- プロジェクトの完了を宣言

---

## 関連ドキュメント

- [概要](./00-overview.md)
- [優先度: 高](./01-priority-high.md)
- [優先度: 中](./02-priority-medium.md)
- [優先度: 低](./03-priority-low.md)
