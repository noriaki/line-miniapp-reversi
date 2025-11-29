# E2E Tests - Playwright

このディレクトリには、LINE Reversi Mini Appの End-to-End (E2E) テストが含まれています。

## テスト概要

### game-basic.spec.ts

ゲームの基本動作を検証するテストスイートです。

- **Initial Board Display**: 8×8ボードの表示、初期4石の配置、有効手ヒント表示
- **Stone Placement and Flipping**: 石の配置と反転、スコア表示の更新
- **Turn Switching**: プレイヤー/AIのターン切替、有効手ヒントの表示制御
- **Invalid Move Handling**: 無効な手へのエラーメッセージ表示とゲーム継続
- **AI Battle - 2 Rounds**: AI対戦（2往復）、思考中表示、応答時間検証

## テスト実行方法

### すべてのE2Eテストを実行

```bash
pnpm test:e2e
```

### UI モードで実行（デバッグ用）

```bash
pnpm test:e2e:ui
```

### ブラウザを表示して実行

```bash
pnpm test:e2e:headed
```

## テスト環境

- **ベースURL**: http://localhost:3000
- **テストデバイス**（モバイルのみ）:
  - Mobile Chrome (Pixel 5)
  - Mobile Safari (iPhone 12)
- **Web Server**: `pnpm run dev`（ローカル）/ `pnpm run build && npx serve@latest out -l 3000`（CI）

## テスト要件

- Node.js 24.x
- pnpm 10.x
- Playwright 1.56.x

## 注意事項

- ローカル環境では開発サーバーが自動起動します
- CI環境では自動的にリトライ（最大2回）が有効になります
- テスト失敗時はスクリーンショットが保存されます
- HTMLレポートは `playwright-report/` に出力されます
