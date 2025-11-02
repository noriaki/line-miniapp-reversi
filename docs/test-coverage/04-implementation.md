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
- [ ] **フェーズ1 PR作成** (推奨)

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
- [ ] **フェーズ2 PR作成** (推奨)

### ステップ4: フェーズ3実装（低優先度）

- [ ] move-history.ts のテスト追加
  - [ ] 範囲外の位置エラーケース
  - [ ] カバレッジ確認

- [ ] index.ts のテスト追加
  - [ ] エクスポート確認テスト
  - [ ] カバレッジ確認

- [ ] **最終カバレッジ確認**
- [ ] **フェーズ3 PR作成** (推奨)

### ステップ5: 完了

- [ ] すべてのテストがパスすることを確認
- [ ] カバレッジレポート生成
- [ ] 各フェーズのPRがマージされたことを確認
- [ ] ドキュメントの更新（達成したカバレッジ値）

---

## PR戦略

### 推奨アプローチ: フェーズごとにPRを分割

各フェーズを個別のPRとして作成することを推奨します：

#### PR 1: フェーズ1（高優先度）

**タイトル**: `test: improve coverage for high-priority files (Phase 1)`

**内容**:

- `useAIPlayer.ts` のテスト追加（0% → 90%+）
- `WASMErrorHandler.tsx` のテスト追加（64.7% → 90%+）
- `wasm-loader.ts` のテスト追加（63.04% → 90%+）

**期待される効果**:

- 最大のカバレッジ改善（全指標 +10-15%）
- 早期フィードバックの獲得

#### PR 2: フェーズ2（中優先度）

**タイトル**: `test: improve coverage for medium-priority files (Phase 2)`

**内容**:

- `ErrorBoundary.tsx` のテスト追加（73.68% → 90%+）
- `GameBoard.tsx` のテスト追加（81.13% → 90%+）

**期待される効果**:

- エッジケースの網羅
- 90%目標の達成

#### PR 3: フェーズ3（低優先度）

**タイトル**: `test: improve coverage for low-priority files (Phase 3)`

**内容**:

- `move-history.ts` のテスト追加（72.72% → 90%+）
- `index.ts` のテスト追加（42.85% Functions → 90%+）

**期待される効果**:

- 細かい改善の完了
- 全ファイル90%達成

### 分割のメリット

1. **レビューの容易さ**: 1つのPRが小さく、レビューしやすい
2. **早期マージ**: 高優先度から順次マージできる
3. **リスク軽減**: 問題が発生してもロールバックが容易
4. **進捗の可視化**: 各フェーズの完了を明確に示せる

### 代替アプローチ: 単一PR

全フェーズを1つのPRにまとめることも可能ですが、以下の点に注意：

- **レビュー負荷**: 大量の変更を一度にレビュー
- **マージまでの時間**: レビューとフィードバックに時間がかかる
- **コンフリクトリスク**: 長期間のブランチは main との差分が大きくなる

---

## トラッキング

### GitHub Issue の作成

各フェーズの進捗を追跡するため、GitHub Issue を作成することを推奨：

**Issue タイトル**: `Test Coverage Improvement to 90%+`

**Issue 内容**:

```markdown
## 目標

全てのカバレッジ指標を90%以上にする

## 現在の状況

- Statements: 82.74% → 目標 90%+
- Branches: 75.86% → 目標 90%+
- Functions: 77.86% → 目標 90%+
- Lines: 82.6% → 目標 90%+

## 実装計画

詳細は [docs/test-coverage/](./docs/test-coverage/) を参照

### フェーズ1: 高優先度

- [ ] #XX useAIPlayer.ts のテスト追加
- [ ] #XX WASMErrorHandler.tsx のテスト追加
- [ ] #XX wasm-loader.ts のテスト追加

### フェーズ2: 中優先度

- [ ] #XX ErrorBoundary.tsx のテスト追加
- [ ] #XX GameBoard.tsx のテスト追加

### フェーズ3: 低優先度

- [ ] #XX move-history.ts のテスト追加
- [ ] #XX index.ts のテスト追加

## 関連PR

- [ ] Phase 1: #XX
- [ ] Phase 2: #XX
- [ ] Phase 3: #XX
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

---

## CI/CD での自動チェック

### GitHub Actions での設定例

`.github/workflows/test.yml` にカバレッジチェックを追加：

```yaml
name: Test

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm test:coverage
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### カバレッジレポートのコメント

PRに自動でカバレッジレポートをコメントする設定（オプション）：

```yaml
- name: Coverage comment
  uses: romeovs/lcov-reporter-action@v0.3.1
  with:
    lcov-file: ./coverage/lcov.info
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

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
