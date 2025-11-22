# Requirements Document

## Introduction

LINE Mini App Reversi プロジェクトにおける AI 支援開発を強化するため、**Claude Code (CLI)** 専用の開発デバッグ環境を構築します。本仕様では、Claude Code (CLI) が MCP (Model Context Protocol) サーバーを通じて Next.js 内部状態とブラウザ動作の両面からアプリケーションを診断できる環境を提供します。

### 対象範囲

- **対象ツール**: **Claude Code (CLI tool) のみ**
- **統合デバッグツール**: Next.js Devtools MCP, dev3000
- **完全に除外**:
  - その他の IDE 統合
  - GUI ベースの MCP クライアント

**重要**: 本仕様は CLI ツールとしての Claude Code 専用です。設定ファイル、ドキュメント、実装すべてにおいて Claude Code (CLI) のみを対象とします。

### 導入ツール

**dev3000** (vercel-labs/dev3000)

- フレームワーク非依存の包括的開発履歴記録ツール
- サーバーログ、ブラウザイベント、コンソールメッセージ、ネットワークリクエスト、スクリーンショットを統合タイムラインで記録
- Chrome DevTools Protocol (Playwright モード) による非侵襲的なブラウザ監視
- タイムラインダッシュボード (`http://localhost:3684/logs`) によるリアルタイム可視化
- MCP サーバー内蔵で Claude Code (CLI) 用 AI デバッグツール (`fix_my_app`, `execute_browser_action`) を提供
- Zero Configuration: MCP サーバーが内蔵されており、`.mcp.json` で自動認識可能

### 期待される効果

- Claude Code (CLI) による文脈を持った正確なデバッグ支援
- エラーメッセージやスクリーンショットの手動共有が不要に
- サーバーログとブラウザ動作の両面から問題を包括的に診断
- 開発効率の向上と問題解決時間の短縮
- チーム開発における再現困難なバグの共有が容易に

### 技術的制約

- dev3000 は Playwright モードでブラウザを自動起動し監視
- 通常開発は既存ワークフロー (`pnpm dev`) を維持し、必要時のみ dev3000 を起動する運用
- MCP サーバーは Claude Code (CLI) 専用に設定（プロジェクトルートの `.mcp.json` で管理）
- dev3000 起動時に自動的に `.mcp.json` が生成され、Claude Code (CLI) から自動認識される

## Requirements

### Requirement 1: dev3000 開発履歴記録システム

**Objective:** 開発者として、サーバーとブラウザの全イベントを統合タイムラインで記録したい。そうすることで、複雑な問題やテスト失敗時の状態を正確に再現し診断できるようにする。

#### Acceptance Criteria (Requirement 1)

1. WHEN 開発者が dev3000 を起動する THEN dev3000 System SHALL サーバーログ、ブラウザイベント、コンソールメッセージ、ネットワークリクエストを統合タイムラインとして記録開始する
2. WHEN ブラウザで開発サーバーにアクセスする THEN dev3000 System SHALL Playwright 経由で Chrome を自動起動し、Chrome DevTools Protocol を使用してブラウザイベントを監視する
3. WHEN 開発者がタイムラインダッシュボード (`http://localhost:3684/logs`) にアクセスする THEN dev3000 System SHALL 記録された全イベントをリアルタイムで時系列表示する
4. WHEN 重要なイベント（エラー、警告、ユーザーインタラクション）が発生する THEN dev3000 System SHALL 自動的にスクリーンショットを撮影しタイムラインに関連付けて保存する
5. WHEN E2E テストが失敗する THEN dev3000 System SHALL 失敗時点のスクリーンショット、コンソールログ、ネットワークリクエスト履歴を含む完全な状態スナップショットを保存する
6. WHEN WebAssembly (Egaroucid) モジュールが実行される THEN dev3000 System SHALL WASM 関連のコンソールメッセージとパフォーマンスメトリクスを記録する

### Requirement 2: dev3000 MCP サーバー AI デバッグ機能

**Objective:** 開発者として、Claude Code (CLI) が dev3000 の記録データにアクセスして問題を診断・修正できるようにしたい。そうすることで、手動でのログ共有なしに AI 支援デバッグを実現する。

#### Acceptance Criteria (Requirement 2)

1. WHEN dev3000 が起動している THEN dev3000 MCP Server SHALL 自動的に起動し Claude Code (CLI) からアクセス可能な状態になる
2. WHEN Claude Code (CLI) が `fix_my_app` ツールを実行する THEN dev3000 MCP Server SHALL 記録された全タイムラインデータ（ログ、エラー、スクリーンショット）を分析し問題の診断結果を返す
3. WHEN Claude Code (CLI) が `execute_browser_action` ツールを実行する THEN dev3000 MCP Server SHALL 指定されたブラウザアクション（クリック、入力、ナビゲーション）を実行しその結果を記録する
4. WHEN Claude Code (CLI) がネットワークリクエストの詳細を問い合わせる THEN dev3000 MCP Server SHALL リクエスト/レスポンスヘッダー、ボディ、ステータスコード、タイミング情報を提供する
5. IF 複数のエラーが記録されている THEN dev3000 MCP Server SHALL 時系列順にエラーを整理し根本原因となる可能性が高いエラーを特定する

### Requirement 3: 開発ワークフロー統合

**Objective:** 開発者として、既存の開発ワークフロー (`pnpm dev`) を維持しながら、必要に応じてデバッグツールを起動できるようにしたい。そうすることで、通常開発時のオーバーヘッドを避けつつ、問題発生時に強力なデバッグ機能を利用できるようにする。

#### Acceptance Criteria (Requirement 3)

1. WHEN 開発者が `pnpm dev` を実行する THEN Development Environment SHALL 通常通り Next.js 開発サーバーを起動し dev3000 は起動しない
2. WHEN 開発者が dev3000 を必要とする THEN Development Environment SHALL 専用コマンド（`pnpm dev:debug`）により dev3000 (Playwright モード) と Next.js 開発サーバーを同時起動する
3. WHEN dev3000 が起動している THEN Development Environment SHALL コンソールに dev3000 タイムラインダッシュボードの URL (`http://localhost:3684/logs`) を表示する
4. WHEN 開発者が `package.json` scripts を確認する THEN Development Environment SHALL デバッグツールの起動方法を README で明示する

### Requirement 4: MCP クライアント設定（Claude Code CLI 専用）

**Objective:** 開発者として、Claude Code (CLI) から MCP サーバーに接続できるようにしたい。そうすることで、Claude Code (CLI) による AI デバッグ支援を実際に利用可能にする。

**重要制約**: この要件は **Claude Code (CLI) 専用**です。

#### Acceptance Criteria (Requirement 4)

1. WHEN dev3000 が初回起動される THEN MCP Client Configuration SHALL プロジェクトルートに `.mcp.json` を自動生成し、dev3000 MCP Server のエントリを含む
2. WHEN Claude Code (CLI) がプロジェクトディレクトリで起動される THEN Claude Code SHALL `.mcp.json` を読み込み、dev3000 MCP Server に自動接続する
3. IF MCP サーバーへの接続が失敗する THEN MCP Client Configuration SHALL エラーメッセージにサーバーの起動状態、ポート、設定ファイルパスを含む診断情報を表示する
4. WHERE ドキュメントが MCP 設定について説明する THEN Documentation SHALL `.mcp.json` が dev3000 により自動生成されることを明示する

### Requirement 5: ドキュメントと使用ガイド

**Objective:** 開発者として、デバッグツールの使い方、設定方法、トラブルシューティングを理解したい。そうすることで、Claude Code (CLI) を活用して効率的に問題解決できるようにする。

#### Acceptance Criteria (Requirement 5)

1. WHEN 開発者がドキュメントを参照する THEN Documentation SHALL dev3000 の概要と利点を明確に説明する
2. WHEN 開発者が初期セットアップを行う THEN Documentation SHALL 必要な依存関係のインストール（`pnpm install -g dev3000`）、起動コマンド（`pnpm dev:debug`）の手順を提供する
3. WHEN 開発者が具体的なデバッグシナリオに対応する THEN Documentation SHALL ブラウザイベント追跡、WASM デバッグなどのユースケース別ガイドを含む
4. WHEN トラブルシューティングが必要になる THEN Documentation SHALL よくある問題（ポート競合、MCP 接続失敗）と解決策を記載する
5. WHEN 開発者が既存ワークフローとの統合を確認する THEN Documentation SHALL 通常開発 (`pnpm dev`) とデバッグモード (`pnpm dev:debug`) の違いを説明する
6. WHERE ドキュメントが Claude Code (CLI) の使用方法を説明する THEN Documentation SHALL Claude Code (CLI) のみを対象とし、他のツールへの参照を含まない
