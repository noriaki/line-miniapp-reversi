# 実装計画

## Phase 0: バージョン管理の準備

- [x] 1. Git作業環境のセットアップ
- [x] 1.1 現在の作業中の変更をコミット
  - 未コミットの変更を確認し、適切なコミットメッセージで保存
  - クリーンな状態からアップグレード作業を開始できるようにする
  - _Requirements: 9_

- [x] 1.2 フィーチャーブランチの作成
  - `git flow feature start upgrade-nextjs-16` コマンドを実行
  - Git Flow戦略に従ってブランチを作成
  - _Requirements: 9_

- [x] 1.3 バックアップブランチの作成
  - `backup/pre-nextjs-16` ブランチを作成してロールバックポイントを確保
  - 現在の安定状態を保存
  - _Requirements: 9_

## Phase 1: 公式Codemodによる自動マイグレーション

- [x] 2. Next.js 16とReact 19へのマイグレーション実行
- [x] 2.1 (P) 公式Codemodの実行
  - `npx @next/codemod@canary upgrade latest` コマンドを実行
  - package.jsonのNext.js 16.0.4とReact 19.2.xへの自動更新
  - 該当する破壊的変更の自動修正を適用
  - Codemod実行ログを記録し、変更内容を確認
  - _Requirements: 1, 2_

- [x] 2.2 (P) 依存関係の再インストール
  - `pnpm install` を実行して依存関係ツリーを更新
  - `pnpm-lock.yaml` の整合性を確認
  - `@types/react` 19.xおよび `@types/react-dom` 19.xの型定義パッケージが更新されたことを検証
  - node_modulesディレクトリが正常に生成されたことを確認
  - _Requirements: 1, 2_

- [x] 2.3 (P) マイグレーション内容の検証
  - `git diff` で変更内容を確認
  - package.jsonのバージョン番号が正しく更新されているか検証
  - ソースコードの自動修正箇所を確認
  - 意図しない変更がないことを確認
  - _Requirements: 1, 2_

## Phase 2: ビルド検証

- [x] 3. TypeScript型チェックとLintの実行
- [x] 3.1 TypeScript型チェックの実行
  - `pnpm type-check` (= `tsc --noEmit`) を実行
  - strict モード設定が維持されていることを確認
  - React 19型定義との互換性を検証
  - LIFF SDK型定義がReact 19と互換性があることを確認
  - 既存のすべてのTypeScriptファイルで型エラーが発生しないことを検証
  - _Requirements: 3_

- [x] 3.2 ESLintとPrettierチェックの実行
  - `pnpm lint` を実行してNext.js 16のESLintルールでコード品質を検証
  - Prettierフォーマットルールへの準拠を確認
  - エラーが発生した場合は `eslint --fix` で自動修正を試行
  - コーディング規約が維持されていることを確認
  - _Requirements: 8_

- [x] 3.3 Prettierフォーマットチェックの実行
  - `pnpm format:check` を実行してPrettierフォーマットルールへの準拠を検証
  - フォーマット違反がないことを確認
  - 違反が検出された場合は `pnpm format` で自動修正を実行
  - コード品質基準が維持されていることを確認
  - _Requirements: 8_

## Phase 3: テストスイートによる互換性検証

- [x] 4. ユニットテストの実行と互換性確認
- [x] 4.1 ユニットテストの実行
  - `pnpm test:unit` を実行して全51ユニットテストファイルを検証
  - React Testing Library 16.3.0とReact 19の互換性を確認
  - ゲームロジック、AIエンジン、Hooksの動作を検証
  - テストカバレッジレポートで90%以上が維持されていることを確認
  - _Requirements: 6_

- [x] 4.2 テスト失敗時の修正（必要に応じて）
  - React 19 Strict ModeによるuseEffect二重実行の影響を確認
  - React 19型定義変更による型エラーをテストコードで修正
  - アプリケーションロジックは変更せず、テストコードのみを更新
  - 修正理由をコメントで記録
  - _Requirements: 6_

- [x] 5. 統合テストの実行と互換性確認
- [x] 5.1 統合テストの実行
  - `pnpm test:integration` を実行して全11統合テストファイルを検証
  - WASM統合テストでWASM + Web Workers + Reactの統合動作を確認
  - React 19並行レンダリングとの互換性を検証
  - HEAPビュー初期化が正常に動作することを確認
  - _Requirements: 7_

- [x] 5.2 統合テスト失敗時の修正（必要に応じて）
  - React 19並行レンダリング変更によるタイミング問題を調整
  - `waitFor` タイムアウトやテストセットアップを調整
  - WASMブリッジの実装は変更せず、テストコードのみを更新
  - 修正理由をコメントで記録
  - _Requirements: 7_

## Phase 4: ランタイム検証

- [x] 6. 開発サーバーの起動と動作確認
- [x] 6.1 開発サーバーの起動
  - `pnpm dev` を実行してNext.js 16開発サーバーを起動
  - `http://localhost:3000` でアクセス可能であることを確認
  - Turbopackがデフォルトで使用されていることを確認（`--turbopack` フラグ不要）
  - サーバーがエラーなく起動することを検証
  - _Requirements: 5, 11_

- [x] 6.2 開発環境での手動検証
  - ブラウザでゲーム盤面が正常に表示されることを目視確認
  - LIFF初期化処理が正常に実行されることを確認
  - ブラウザコンソールでエラーが発生しないことを確認
  - Fast Refresh機能が正常に動作することを確認
  - React 19 Strict Modeの警告がないことを確認
  - _Requirements: 5_

- [x] 7. 静的エクスポートの実行とWASM検証
- [x] 7.1 静的エクスポートの実行
  - `pnpm build` を実行してNext.js 16で静的エクスポートを生成
  - `output: 'export'` 設定が維持されていることを確認
  - Turbopackによる本番ビルドが正常に完了することを確認
  - ビルド時に警告やエラーが発生しないことを検証
  - _Requirements: 4, 11_

- [x] 7.2 ビルド成果物の検証
  - `out/` ディレクトリが正常に生成されたことを確認
  - 静的HTMLとJavaScriptファイルが出力されたことを検証
  - ビルドログで静的エクスポートモードが有効であることを確認
  - _Requirements: 4_

- [x] 7.3 WASMアセットコピーの検証
  - `out/ai.wasm` ファイルが正しくコピーされたことを確認
  - `out/ai.js` ファイルが正しくコピーされたことを確認
  - `/public` ディレクトリとのファイルサイズ一致を検証
  - Turbopackが `/public` ディレクトリを自動配信していることを確認
  - _Requirements: 4_

- [ ] 8. (P) パフォーマンス測定
  - Next.js 15とNext.js 16のビルド時間を比較測定
  - Turbopackによるビルド時間短縮（30-50%）を確認
  - Fast Refresh速度の体感確認
  - 初期ロード時間がsub-2-second（2秒未満）を維持していることを確認
  - Web WorkerによるAI処理の非ブロッキング動作を確認
  - _Requirements: 11_

## Phase 5: ドキュメント更新と最終検証

- [ ] 9. ステアリングドキュメントの更新
- [ ] 9.1 (P) tech.mdのバージョン番号更新: 以下をコンテキストに保持して `/kiro:steering` を実行
  - `.specify/steering/tech.md` のNext.jsバージョン番号を16.xに更新
  - `.specify/steering/tech.md` のReactバージョン番号を19.xに更新
  - Markdown構文が壊れていないことを確認
  - _Requirements: 10_

- [ ] 9.2 (P) 変更内容のコミット
  - Semantic Commit Message形式でコミットを作成
  - コミットメッセージに変更内容の概要を含める
  - 破壊的変更への対応内容を記載
  - 型: `chore(deps): upgrade Next.js 16.0.4 and React 19.2.x` の形式を使用
  - _Requirements: 9, 10_

- [ ] 10. 成功基準の最終検証
- [ ] 10.1 全パッケージバージョンの確認
  - package.jsonでNext.js 16.0.4とReact 19.2.xが記録されていることを確認
  - pnpm-lock.yamlで依存関係ツリーの整合性を確認
  - _Requirements: 12_

- [ ] 10.2 全検証項目の実行確認
  - `pnpm build` が成功していることを確認
  - `pnpm dev` が正常に起動していることを確認
  - `out/` ディレクトリが生成されていることを確認
  - `pnpm type-check` が成功していることを確認
  - `pnpm lint` が成功していることを確認
  - `pnpm format:check` が成功していることを確認
  - 全ユニットテストが成功していることを確認
  - 全統合テストが成功していることを確認
  - テストカバレッジ90%以上が維持されていることを確認
  - ブラウザコンソールでエラーが発生していないことを確認
  - _Requirements: 8, 12_

- [ ] 10.3 アップグレード完了の確認
  - 全10個の成功基準項目が満たされていることを最終確認
  - エラーや警告がないことを検証
  - 必要に応じてロールバック可能な状態を維持
  - _Requirements: 12_
