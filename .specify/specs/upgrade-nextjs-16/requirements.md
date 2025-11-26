# Requirements Document

## Introduction

本仕様書は、LINE Reversi ミニアプリを Next.js 15.5.6 から Next.js 16.x（最新安定版 16.0.4）へアップグレードするための要件を定義します。このアップグレードには React 18.3.1 から React 19.2.x へのメジャーバージョンアップも含まれます。

### 背景

現在のプロジェクトは静的エクスポート構成（`output: 'export'`）で運用されており、Next.js App Router、Web Workers、WebAssembly (Egaroucid AI)、LIFF SDK などの技術を組み合わせた LINE プラットフォーム上のブラウザベースゲームアプリケーションです。

### アップグレードの目的

- Next.js 16 の新機能とパフォーマンス改善を活用
- React 19 の改善された並行レンダリングとハイドレーション機能を利用
- デフォルトで有効化される Turbopack によるビルド時間短縮（30-50%）
- ルーティング最適化による prefetch 効率向上
- セキュリティアップデートの適用

### リスク評価

**低リスク要因:**

- 静的エクスポート構成のため多くの破壊的変更が影響しない
- `params`/`searchParams`/`cookies`/`headers` 未使用
- middleware 未使用
- `next/image` 未使用（unoptimized 設定）
- カスタム webpack 設定なし

**中リスク要因:**

- React 19 へのメジャーアップグレード
- LIFF SDK の React 19 互換性が未確認
- Web Workers + WASM の動作確認が必要

### スコープ外

本アップグレードでは以下を含みません：

- E2Eテストの追加または変更（既存のE2Eテストは実行しない）
- 新規テストの実装（既存テストの実行のみ）
- LIFF SDK の検証
- 新機能の追加
- アーキテクチャの変更
- UI/UX の改善
- LIFF SDK のバージョンアップ

## Requirements

### Requirement 1: 依存関係のバージョン更新

**Objective:** 開発者として、Next.js 16 と React 19 へのバージョンアップグレードを行い、最新の機能とパフォーマンス改善を利用できるようにしたい。

#### Acceptance Criteria

1. When 依存関係を更新する場合、システムは Next.js を 15.5.6 から 16.0.4 へアップグレードすること
2. When 依存関係を更新する場合、システムは React を 18.3.1 から 19.2.x へアップグレードすること
3. When 依存関係を更新する場合、システムは React DOM を 18.3.1 から 19.2.x へアップグレードすること
4. When 依存関係を更新する場合、システムは `@types/react` を 19.x へアップグレードすること
5. When 依存関係を更新する場合、システムは `@types/react-dom` を 19.x へアップグレードすること
6. システムは `package.json` に正しいバージョン番号を記録すること
7. システムは `pnpm-lock.yaml` を更新して依存関係ツリーの整合性を保つこと

### Requirement 2: 公式 Codemod によるマイグレーション

**Objective:** 開発者として、Next.js 公式の自動マイグレーションツールを使用して、破壊的変更に対する修正を自動適用したい。

#### Acceptance Criteria

1. When Codemod を実行する場合、システムは `npx @next/codemod@canary upgrade latest` コマンドを使用すること
2. When Codemod が実行される場合、システムは自動的に package.json のバージョンを更新すること
3. When Codemod が実行される場合、システムは該当する破壊的変更を自動修正すること
4. If プロジェクトに該当する破壊的変更がない場合、システムはバージョン更新のみを実行すること
5. システムは Codemod 実行後に依存関係の再インストールを行うこと

### Requirement 3: 型チェックの互換性検証

**Objective:** 開発者として、TypeScript の型定義が React 19 と Next.js 16 で正常に動作することを確認したい。

#### Acceptance Criteria

1. When 型チェックを実行する場合、システムは `pnpm type-check` コマンドでエラーなく完了すること
2. システムは strict モード（`strict: true`）での型チェックを維持すること
3. システムは `any` 型を使用せずに型安全性を保つこと
4. When LIFF SDK の型を使用する場合、システムは React 19 との互換性を保つこと
5. システムは既存のすべての TypeScript ファイルで型エラーが発生しないこと

### Requirement 4: ビルド検証

**Objective:** 開発者として、静的エクスポート機能が Next.js 16 でも正常に動作することを確認したい。

#### Acceptance Criteria

1. When ビルドを実行する場合、システムは `pnpm build` コマンドでエラーなく完了すること
2. When ビルドが完了する場合、システムは `out/` ディレクトリを生成すること
3. When ビルドが完了する場合、システムは `out/ai.wasm` ファイルを正しくコピーすること
4. When ビルドが完了する場合、システムは `out/ai.js` ファイルを正しくコピーすること
5. システムは静的エクスポート設定（`output: 'export'`）を維持すること
6. システムはビルド時に警告やエラーを出力しないこと

### Requirement 5: 開発サーバーの動作検証

**Objective:** 開発者として、開発サーバーが Next.js 16 と React 19 で正常に起動し、すべての機能が動作することを確認したい。

#### Acceptance Criteria

1. When 開発サーバーを起動する場合、システムは `pnpm dev` コマンドでエラーなく起動すること
2. When 開発サーバーが起動する場合、システムは `http://localhost:3000` でアクセス可能であること
3. When ページにアクセスする場合、システムはゲーム盤面を正常に表示すること
4. When ページにアクセスする場合、システムは LIFF 初期化処理を実行すること
5. When ページにアクセスする場合、システムはコンソールエラーを出力しないこと
6. システムは Fast Refresh 機能が正常に動作すること
7. システムは Turbopack をデフォルトで使用すること

### Requirement 6: ユニットテストの互換性維持

**Objective:** 開発者として、既存のユニットテストがすべて成功し、テストカバレッジ 90% 以上を維持したい。

#### Acceptance Criteria

1. When ユニットテストを実行する場合、システムは `pnpm test:unit` コマンドでエラーなく完了すること
2. システムは既存のすべてのユニットテストケース（51 ファイル）が成功すること
3. システムはテストカバレッジ 90% 以上を維持すること
4. If テストが失敗する場合、システムは React 19 または Next.js 16 の API 変更によるものであること
5. If テストが失敗する場合、テストコードのみを更新し、アプリケーションロジックは変更しないこと

### Requirement 7: 統合テストの互換性維持

**Objective:** 開発者として、WASM ブリッジと AI エンジンの統合テストが正常に動作することを確認したい。

#### Acceptance Criteria

1. When 統合テストを実行する場合、システムは `pnpm test:integration` コマンドでエラーなく完了すること
2. システムは既存のすべての統合テストケース（11 ファイル）が成功すること
3. If テストが失敗する場合、システムは React 19 の並行レンダリング変更によるものであること
4. If テストが失敗する場合、テストコードのみを更新し、WASM ブリッジの実装は変更しないこと

### Requirement 8: コード品質の維持

**Objective:** 開発者として、既存のコード品質基準を維持したい。

#### Acceptance Criteria

1. When Lint チェックを実行する場合、システムは `pnpm lint` コマンドでエラーなく完了すること
2. システムは ESLint の Next.js 設定に準拠すること
3. システムは Prettier フォーマットルールに準拠すること
4. システムは Husky pre-commit フックが正常に動作すること
5. システムは lint-staged が正常に動作すること
6. システムは既存のコーディング規約を維持すること

### Requirement 9: Git リポジトリの管理

**Objective:** 開発者として、アップグレード作業を適切なブランチ戦略で管理し、ロールバック可能な状態を維持したい。

#### Acceptance Criteria

1. When アップグレード作業を開始する場合、システムは作業中の変更をコミットすること
2. When フィーチャーブランチを作成する場合、システムは `git flow feature start upgrade-nextjs-16` コマンドを使用すること
3. When バックアップを作成する場合、システムは `backup/pre-nextjs-16` ブランチを作成すること
4. When アップグレードが完了する場合、システムは Semantic Commit Message 形式でコミットすること
5. システムはコミットメッセージに変更内容の概要を含めること
6. If アップグレードに失敗する場合、システムは `git reset --hard` でロールバック可能であること

### Requirement 10: ドキュメントの更新

**Objective:** 開発者として、アップグレード後の構成をドキュメントに反映したい。

#### Acceptance Criteria

1. When アップグレードが完了する場合、システムは `.specify/steering/tech.md` の Next.js バージョン番号を更新すること
2. When アップグレードが完了する場合、システムは `.specify/steering/tech.md` の React バージョン番号を更新すること
3. システムは変更内容を Git コミットメッセージに記録すること
4. システムは破壊的変更への対応内容をコミットメッセージに含めること

### Requirement 11: パフォーマンスの確認

**Objective:** 開発者として、アップグレード後のパフォーマンスが維持または向上していることを確認したい。

#### Acceptance Criteria

1. When ビルドを実行する場合、システムは Turbopack によるビルド時間短縮を実現すること
2. When 開発サーバーを起動する場合、システムは Fast Refresh の高速化を実現すること
3. システムは既存の SSG による sub-2-second 初期ロード時間を維持すること
4. システムは Web Worker による AI 処理の非ブロッキング動作を維持すること
5. システムはルーティング最適化による prefetch 効率向上を活用すること

### Requirement 12: 成功基準の検証

**Objective:** 開発者として、アップグレードが成功したことを客観的に検証したい。

#### Acceptance Criteria

1. システムは全パッケージが Next.js 16.x + React 19.x に更新されていること
2. システムは `pnpm build` がエラーなく完了すること
3. システムは `pnpm dev` がエラーなく起動すること
4. システムは静的エクスポート（`out/` ディレクトリ）が正常に生成されること
5. システムは `pnpm type-check` が成功すること
6. システムは `pnpm lint` がエラーなく完了すること
7. システムは全ユニットテストが成功すること
8. システムは全統合テストが成功すること
9. システムはテストカバレッジ 90% 以上を維持すること
10. システムはコンソールエラーが発生しないこと
