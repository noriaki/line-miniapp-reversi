# Next.js 15.5.6 → 16.x アップグレードプラン

## 概要

LINE Reversi ミニアプリを Next.js 15.5.6 から Next.js 16.x（最新安定版）へアップグレードします。

### 現在の構成

- **Next.js**: 15.5.6
- **React**: 18.3.1
- **Node.js**: 24.9.0
- **構成**: Static export mode (`output: 'export'`)、App Router専用
- **特殊な依存関係**: @line/liff (LINE SDK)、Web Workers、WASM

### ターゲット構成

- **Next.js**: 16.0.4（最新安定版）
- **React**: 19.2.x（必須）
- **React DOM**: 19.2.x（必須）
- **@types/react**: 19.x
- **@types/react-dom**: 19.x

### リスク評価: **低〜中**

**低リスク要因:**

- Static export構成のため、多くの破壊的変更が影響しない
- params/searchParams/cookies/headers を使用していない
- middlewareなし
- next/image未使用（unoptimized設定）
- カスタムwebpack設定なし

**中リスク要因:**

- React 19へのメジャーアップグレード
- LIFF SDKのReact 19互換性が未確認
- Web Workers + WASMの動作確認必要

---

## 推奨アプローチ: 公式Codemod一括アップグレード

### 選択肢1: 公式Codemod使用（推奨）

**メリット:**

- 最速（1コマンドで完了）
- 公式サポートあり
- 破壊的変更を自動修正
- Next.jsチームが推奨

**デメリット:**

- 一括変更のため問題の切り分けが難しい
- React 19とNext.js 16の変更が同時に適用される

**実行コマンド:**

```bash
npx @next/codemod@canary upgrade latest
```

### 選択肢2: 手動段階的アップグレード

**メリット:**

- 変更を細かく制御可能
- 問題の切り分けが容易

**デメリット:**

- Next.js 16はReact 19必須のため、段階的アップグレード不可
- 余分な作業が発生
- Next.js 15は既にEOL

**結論:** 非推奨

---

## アップグレード手順

### 準備フェーズ

#### 1. Gitの状態確認

```bash
cd /Users/noruchiy/Workspace/line-miniapp-reversi
git status
```

#### 2. 現在の変更をコミット

```bash
git add .mcp.json
git commit -m "chore: update MCP configuration"
```

#### 3. フィーチャーブランチ作成

```bash
git flow feature start upgrade-nextjs-16
```

#### 4. バックアップブランチ作成

```bash
git branch backup/pre-nextjs-16 main
```

### 実行フェーズ

#### 5. 公式Codemod実行

```bash
npx @next/codemod@canary upgrade latest
```

**自動処理される内容:**

- next, react, react-dom のバージョン更新
- @types/react, @types/react-dom の更新
- next.config.ts の設定移行（該当なし）
- 破壊的変更の自動修正（該当なし）

#### 6. 依存関係インストール

```bash
rm -rf node_modules .next
pnpm install
```

#### 7. 型チェック

```bash
pnpm type-check
```

#### 8. ビルド検証

```bash
pnpm build
```

**確認事項:**

- Static exportが成功（`out/`ディレクトリ生成）
- WASMファイルがコピーされている（`out/ai.wasm`, `out/ai.js`）
- エラーなく完了

### テストフェーズ

#### 9. ユニットテスト

```bash
pnpm test:unit
```

**期待される結果:** 全テスト成功（90%以上のカバレッジ維持）

#### 10. 統合テスト

```bash
pnpm test:integration
```

**重点確認項目:**

- WASM読み込み
- AI処理の動作

#### 11. 開発サーバー起動

```bash
pnpm dev
```

**手動確認項目:**

- ページ表示
- LIFF初期化
- ゲームプレイ動作
- AI対戦機能
- コンソールエラーなし

#### 12. E2Eテスト

```bash
pnpm test:e2e
```

**テスト範囲:**

- Chromium（デスクトップ）
- Mobile Chrome（Pixel 5）
- Mobile Safari（iPhone 12）

### コミットフェーズ

#### 13. 変更をコミット

```bash
git add .
git commit -m "chore: upgrade to Next.js 16 and React 19

- Upgrade next from 15.0.0 to 16.0.4
- Upgrade react/react-dom from 18.3.0 to 19.2.x
- Update @types/react and @types/react-dom to v19
- Verify static export functionality
- Confirm LIFF SDK compatibility
- All tests passing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 破壊的変更の影響分析

### このプロジェクトに影響のない変更

| 破壊的変更           | 影響    | 理由                                         |
| -------------------- | ------- | -------------------------------------------- |
| Async Request APIs   | ❌ なし | params, searchParams, cookies, headers未使用 |
| middleware → proxy   | ❌ なし | middlewareファイルなし                       |
| Image API変更        | ❌ なし | next/image未使用（unoptimized設定）          |
| Parallel Routes      | ❌ なし | 使用していない                               |
| PPR/Cache Components | ❌ なし | Static exportでは無効                        |

### 確認が必要な項目

#### React 19の変更

- **新機能**: View Transitions, useEffectEvent, Activity
- **同時レンダリングの改善**
- **厳格なハイドレーション警告**

**対応:**

- Testing Library 16.3.0は既にReact 19対応済み
- 全コンポーネントが関数コンポーネント（互換性高）
- テスト結果で確認

#### LIFF SDK互換性

**確認事項:**

- LIFF初期化が正常に動作
- useLiffフックが機能
- Jestのモックが動作
- React 19の同時レンダリングとの相互作用

**テスト戦略:**

1. 開発環境で動作確認
2. E2Eテストで自動検証
3. 必要に応じてステージング環境でLINEアプリ内テスト

---

## ロールバック計画

### 即座のロールバック（アップグレード直後）

```bash
git reset --hard HEAD~1
pnpm install
```

### 完全なロールバック（プッシュ後）

```bash
git checkout main
git reset --hard backup/pre-nextjs-16
git push origin main --force-with-lease
```

---

## 成功基準

### 技術的基準

- ✅ 全パッケージがNext.js 16.x + React 19.xに更新
- ✅ `pnpm build`がエラーなく完了
- ✅ `pnpm dev`がエラーなく起動
- ✅ Static export（`out/`ディレクトリ）が正常に生成
- ✅ 型チェック成功（`pnpm type-check`）
- ✅ Lintエラーなし（`pnpm lint`）
- ✅ 全ユニットテスト成功
- ✅ 全統合テスト成功
- ✅ 全E2Eテスト成功
- ✅ カバレッジ90%以上維持

### 機能的基準

- ✅ ゲーム盤面が正常に表示
- ✅ 石の配置が正常に動作
- ✅ AI対戦が正常に動作
- ✅ パス機能が動作
- ✅ ゲーム終了検知が正常
- ✅ スコア表示が正確
- ✅ リセット機能が動作
- ✅ 最終手のハイライト表示
- ✅ レスポンシブレイアウト（375px, 640px, 768px）
- ✅ LIFF統合が正常（テスト可能な場合）
- ✅ コンソールエラーなし

---

## パフォーマンス向上の期待

### Turbopack（デフォルト化）

- **ビルド時間**: 30-50%短縮の見込み
- **Fast Refresh**: 最大10倍高速化
- **開発体験**: 大幅な改善

### ルーティング最適化

- **レイアウト重複排除**: 複数URL prefetch時にレイアウトを1回だけダウンロード
- **増分 prefetch**: キャッシュにない部分のみをprefetch

---

## 重要ファイル

アップグレードで変更されるファイル:

- `/Users/noruchiy/Workspace/line-miniapp-reversi/package.json` - バージョン更新
- `/Users/noruchiy/Workspace/line-miniapp-reversi/pnpm-lock.yaml` - 依存関係ロック

動作確認が必要なファイル:

- `/Users/noruchiy/Workspace/line-miniapp-reversi/next.config.ts` - 設定の互換性
- `/Users/noruchiy/Workspace/line-miniapp-reversi/src/contexts/LiffProvider.tsx` - LIFF初期化
- `/Users/noruchiy/Workspace/line-miniapp-reversi/jest.setup.js` - LIFFモック
- `/Users/noruchiy/Workspace/line-miniapp-reversi/src/components/GameBoard.tsx` - メインUI

---

## ユーザー確認事項

### LIFF SDKテスト

- **方針**: 開発環境のみでテスト（ローカル + E2E）
- **理由**: 本番LINE環境でのテストは不要との確認

### Turbopack利用

- **方針**: デフォルトのTurbopackを使用（推奨アプローチ）
- **理由**: カスタムwebpack設定がないため互換性問題なし、パフォーマンス向上が期待できる

### 実行方法

- **方針**: Spec-Driven Development (SDD) により推進
- **手順**:
  1. このプランを `docs/upgrade-nextjs-16.md` として保存
  2. `/kiro:spec-init @docs/upgrade-nextjs-16.md を参照してNext.js v16へアップグレード` を実行
  3. 保存したドキュメントを参照しながらSDD手法で実装

---

## 見積もり時間

- **準備**: 15分
- **実行**: 30分
- **テスト**: 1-2時間
- **検証とコミット**: 30分

**合計**: 2.5-3.5時間

---

## SDD実装のための推奨アプローチ

このアップグレードプランをKiro Spec-Driven Developmentのプロセスで実装する場合:

### 1. 仕様初期化

```bash
/kiro:spec-init "Next.js 15から16へのアップグレード（React 19対応含む）"
```

### 2. Requirements定義

- 現在のバージョンから目標バージョンへの移行要件
- 破壊的変更への対応要件
- テストカバレッジ維持要件

### 3. Design文書

- アップグレード手順の詳細設計
- ロールバック戦略
- リスク軽減策

### 4. Tasks分解

- Git準備タスク
- Codemod実行タスク
- テストタスク（Unit, Integration, E2E）
- 検証タスク

### 5. Implementation

- `/kiro:spec-impl` を使用してタスクを順次実行
- 各タスク完了後の検証
- TDDアプローチでテストを先に実行

---

## 参考資料

- [Next.js 16 公式ブログ](https://nextjs.org/blog/next-16)
- [Next.js 16 アップグレードガイド](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [React 19.2 リリースノート](https://react.dev/blog/2025/10/01/react-19-2)
