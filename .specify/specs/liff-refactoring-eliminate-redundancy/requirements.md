# Requirements Document

## Introduction

本仕様書は、LINE LIFF統合に関するプロジェクト全体のリファクタリング要件を定義する。最新のステアリングファイル（`.kiro/steering/line-liff.md`）に基づき、公式に提供されている機能や型定義を信頼し、冗長な型ラッピング、ラッパー関数、不要なテストコードを徹底的に排除する。公式ライブラリ（`@line/liff`パッケージと`line/liff-mock`）を最大限活用し、Next.js/React対応のために必要な最小限のコードのみを維持する。

対象範囲: プロジェクト全体のファイル（実装コード、テストコード、ドキュメント）

## Requirements

### Requirement 1: 公式型定義の直接利用

**Objective:** As a 開発者, I want 公式パッケージの型定義を直接利用する, so that 型の冗長なラッピングを排除し保守性を向上させる

#### Acceptance Criteria

1. WHEN プロジェクト内でLIFF関連の型が必要な場合 THEN システムは `@line/liff` パッケージに含まれる公式型定義を直接importして使用する SHALL
2. IF プロジェクト内にLIFF公式型をラップする独自型定義が存在する場合 THEN システムはそれらの冗長な型定義を削除し公式型へ置き換える SHALL
3. WHERE LIFF APIレスポンス型を扱うコード THE システムは `@line/liff` の型定義（`Profile`, `Context`, `GetOSResponse`など）を直接使用する SHALL
4. WHEN 型のre-exportが必要な場合 THEN システムは公式型を型エイリアスなしでそのままre-exportする SHALL

### Requirement 2: 冗長なラッパー関数の削除

**Objective:** As a 開発者, I want LIFF SDKの公式APIを直接呼び出す, so that 不要な抽象化層を排除しコードの複雑性を低減させる

#### Acceptance Criteria

1. WHEN LIFF APIを呼び出す必要がある場合 THEN システムは `liff.init()`, `liff.getProfile()` などの公式メソッドを直接呼び出す SHALL
2. IF プロジェクト内にLIFF公式APIをラップするだけの関数が存在する場合 THEN システムはそれらの冗長なラッパー関数を削除する SHALL
3. WHERE React/Next.js統合のために必要な最小限のロジック（初期化フロー、エラーハンドリング、状態管理）以外 THE システムはラッパー関数を作成しない SHALL
4. WHEN 既存のラッパー関数を削除する場合 THEN システムは呼び出し元のコードを公式API直接呼び出しに書き換える SHALL

### Requirement 3: 公式Mockライブラリの活用

**Objective:** As a 開発者, I want 公式Mockライブラリを使用してテストを記述する, so that パッケージの動作を検証する不要なテストを排除し必要なビジネスロジックのみをテストする

#### Acceptance Criteria

1. WHEN LIFF機能のユニットテストを実装する場合 THEN システムは `line/liff-mock` 公式ライブラリを使用する SHALL
2. IF プロジェクト内にLIFF SDKの基本動作を検証するテストが存在する場合 THEN システムはそれらの不要なテストを削除する SHALL
3. WHERE LIFFとの統合部分をテストする必要がある箇所 THE システムは `@line/liff-mock` を使用してLIFF APIをモックする SHALL
4. WHEN テストコードを記述する場合 THEN システムはビジネスロジック（初期化フロー、エラーハンドリング、状態管理）のみをテスト対象とする SHALL

### Requirement 4: Next.js/React対応の最小化

**Objective:** As a 開発者, I want Next.js/React統合に必要な最小限のコードのみを保持する, so that 不要な複雑性とコード量を削減する

#### Acceptance Criteria

1. WHEN LIFF初期化をReactコンポーネントで実装する場合 THEN システムは `useEffect` フックによる初期化処理のみを実装する SHALL
2. IF プロジェクト内にSSR対応以外の目的で追加されたラッパーコンポーネントが存在する場合 THEN システムはそれらの冗長なコンポーネントを削除する SHALL
3. WHERE SSR環境でのLIFF初期化 THE システムは `typeof window !== 'undefined'` チェックのみを使用する SHALL
4. WHEN React Context/Providerを使用する場合 THEN システムはLIFF状態の共有に必要な最小限の実装のみを維持する SHALL

### Requirement 5: ドキュメント・コメントの整合性確保

**Objective:** As a 開発者, I want ドキュメントとコメントを最新のステアリング内容と一致させる, so that プロジェクトの情報が正確で保守性が高い状態を保つ

#### Acceptance Criteria

1. WHEN ドキュメントやコード内コメントにLIFF実装の説明が含まれる場合 THEN システムは `.kiro/steering/line-liff.md` の内容と整合性を取る SHALL
2. IF 古い実装方針や削除された機能への言及が存在する場合 THEN システムはそれらの記述を削除または更新する SHALL
3. WHERE LIFF公式ドキュメントへの参照が必要な箇所 THE システムは `.kiro/steering/line-liff.md` に記載された公式リソースへのリンクを使用する SHALL
4. WHEN リファクタリング完了後 THEN システムはREADMEや関連ドキュメントに変更内容を反映する SHALL

### Requirement 6: 実装ファイルの整理

**Objective:** As a 開発者, I want 不要なファイルを削除し必要なファイルのみを保持する, so that プロジェクト構造をシンプルで理解しやすくする

#### Acceptance Criteria

1. WHEN 冗長な型定義ファイルやラッパーモジュールが特定された場合 THEN システムはそれらのファイルを削除する SHALL
2. IF 削除するファイルが他のモジュールから参照されている場合 THEN システムは参照元を公式APIまたは公式型への直接参照に書き換える SHALL
3. WHERE LIFF統合に関する実装が複数ファイルに分散している場合 THE システムは必要最小限のファイル構成（Context/Provider、Hookなど）に集約する SHALL
4. WHEN ファイル削除が完了した場合 THEN システムはimport/exportパスの整合性を確認しビルドエラーが発生しないことを検証する SHALL

### Requirement 7: テストコードの最適化

**Objective:** As a 開発者, I want 公式ライブラリの動作を検証するテストを削除し必要なテストのみを保持する, so that テストの実行時間を短縮しメンテナンスコストを低減させる

#### Acceptance Criteria

1. WHEN LIFF SDKの基本機能（`getProfile()`, `init()` の戻り値など）を検証するテストが存在する場合 THEN システムはそれらの不要なテストを削除する SHALL
2. IF プロジェクト固有のビジネスロジック（初期化エラーハンドリング、フォールバック処理など）をテストする必要がある場合 THEN システムはそれらのテストを `@line/liff-mock` を使用して実装する SHALL
3. WHERE テストで複雑なLIFFモックセットアップが必要な箇所 THE システムは公式Mockライブラリの提供する機能を最大限活用する SHALL
4. WHEN テスト最適化が完了した場合 THEN システムはテストカバレッジが品質目標（90%以上）を維持していることを確認する SHALL

### Requirement 8: コード品質の検証

**Objective:** As a 開発者, I want リファクタリング後のコードが品質基準を満たすことを確認する, so that プロジェクトの品質と信頼性を保証する

#### Acceptance Criteria

1. WHEN リファクタリングが完了した場合 THEN システムは `pnpm run lint` でESLintエラーが発生しないことを検証する SHALL
2. WHEN リファクタリングが完了した場合 THEN システムは `pnpm run type-check` でTypeScriptエラーが発生しないことを検証する SHALL
3. WHEN リファクタリングが完了した場合 THEN システムは `pnpm run test` で全テストがパスすることを検証する SHALL
4. WHEN リファクタリングが完了した場合 THEN システムは `pnpm run build` でビルドが成功することを検証する SHALL
5. IF E2Eテストが存在する場合 THEN システムは `pnpm run test:e2e` でE2Eテストがパスすることを検証する SHALL

### Requirement 9: 変更の影響範囲の文書化

**Objective:** As a 開発者, I want リファクタリングの変更内容と影響範囲を明確に記録する, so that レビューと将来の保守を容易にする

#### Acceptance Criteria

1. WHEN リファクタリングが完了した場合 THEN システムは削除されたファイルのリストを文書化する SHALL
2. WHEN リファクタリングが完了した場合 THEN システムは変更されたファイルと主な変更内容を文書化する SHALL
3. WHEN リファクタリングが完了した場合 THEN システムは削除されたテストケースとその理由を文書化する SHALL
4. WHEN 変更がステアリングファイルに影響する場合 THEN システムは該当するステアリングファイルを更新する SHALL
