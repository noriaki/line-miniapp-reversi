# テストカバレッジ改善プラン

このドキュメントは、テストカバレッジを90%以上に改善するためのプランの索引です。

## ドキュメント構成

プランは以下のドキュメントに分割されています：

### [📊 概要 (00-overview.md)](./test-coverage/00-overview.md)

- 現在のカバレッジ状況
- 対応が必要なファイル一覧
- 全体サマリーと推定改善後の指標
- テストパフォーマンスへの影響
- CI/CD 統合
- エッジケースのドキュメント方針
- メンテナンス戦略
- 品質メトリクス

### [🔴 優先度: 高 (01-priority-high.md)](./test-coverage/01-priority-high.md)

カバレッジが0%または50%未満のファイル：

1. **src/hooks/useAIPlayer.ts** (0%)
   - Worker モック戦略
   - テスト環境の改善
   - 詳細なテストケース

2. **src/components/WASMErrorHandler.tsx** (64.7%)
   - エラータイプの網羅
   - インタラクションテスト

3. **src/lib/ai/wasm-loader.ts** (63.04%)
   - エッジケースのテスト
   - エラーハンドリングの追加

### [🟡 優先度: 中 (02-priority-medium.md)](./test-coverage/02-priority-medium.md)

カバレッジが50%以上70%未満のファイル：

4. **src/components/ErrorBoundary.tsx** (73.68%)
   - リロード機能のテスト
   - ホバーエフェクトのテスト

5. **src/components/GameBoard.tsx** (81.13%)
   - LIFF-Mock を活用した LINE ログインエラーのテスト
   - パスロジックのエッジケース
   - AI エラーハンドリング

### [🟢 優先度: 低 (03-priority-low.md)](./test-coverage/03-priority-low.md)

カバレッジが70%以上90%未満のファイル：

6. **src/lib/game/move-history.ts** (72.72%)
   - 範囲外の位置エラーケース

7. **src/lib/ai/index.ts** (Functions 42.85%)
   - エクスポート確認テスト

### [🚀 実装アクションプラン (04-implementation.md)](./test-coverage/04-implementation.md)

- ステップバイステップの実装手順
- PR 戦略（フェーズごとに分割を推奨）
- GitHub Issue の作成方法
- 参考コマンド
- CI/CD での自動チェック
- 進捗の記録方法

## クイックスタート

1. [概要ドキュメント](./test-coverage/00-overview.md)を確認して全体像を把握
2. [実装アクションプラン](./test-coverage/04-implementation.md)に従って環境準備
3. [優先度: 高](./test-coverage/01-priority-high.md)から順に実装を開始

## 進捗状況

### フェーズ1: 高優先度

- [ ] useAIPlayer.ts
- [ ] WASMErrorHandler.tsx
- [ ] wasm-loader.ts

### フェーズ2: 中優先度

- [ ] ErrorBoundary.tsx
- [ ] GameBoard.tsx

### フェーズ3: 低優先度

- [ ] move-history.ts
- [ ] index.ts

## 目標

**全てのカバレッジ指標を90%以上にする**

| 指標           | 現在   | 目標 |
| -------------- | ------ | ---- |
| **Statements** | 82.74% | 90%+ |
| **Branches**   | 75.86% | 90%+ |
| **Functions**  | 77.86% | 90%+ |
| **Lines**      | 82.6%  | 90%+ |

## 推定工数

- **最小工数**: 約6.5時間
- **最大工数**: 約9時間

## 関連リンク

- [カバレッジレポート](../coverage/lcov-report/index.html) (ローカル生成後)
- [Jest 設定](../jest.config.js)

---

**最終更新**: 2025-11-03
