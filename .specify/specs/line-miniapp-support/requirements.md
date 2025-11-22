# Requirements Document

## Introduction

本仕様書は、既存のリバーシWebアプリケーションに対してLINEミニアプリ対応を追加するための要求仕様を定義する。LIFF SDK統合により、LINEアプリ内でのシームレスなゲーム体験と、LINEプロフィール情報を活用したパーソナライズ機能を実現する。

## Requirements

### Requirement 1: LIFF SDK統合とバージョン管理

**Objective:** As a 開発者, I want LIFF SDKを最新バージョンで導入・管理したい, so that LINE APIの最新機能とセキュリティパッチを活用できる

#### Acceptance Criteria

1. WHEN プロジェクトに依存パッケージを追加する THEN Package Manager SHALL `@liff/liff-sdk` を `@latest` バージョン指定でインストールする
2. WHEN package.jsonファイルを確認する THEN Package Manager SHALL `@liff/liff-sdk` のバージョン指定が `^` または固定バージョンではなく、最新を追跡可能な形式で記録されている
3. WHEN LIFF SDKモジュールをインポートする THEN Application SHALL TypeScript型定義を含む正しいパッケージインポートを使用する

### Requirement 2: LIFF ID環境変数管理

**Objective:** As a 開発者, I want LIFF IDを環境ごとに適切に管理したい, so that 開発環境と本番環境で異なるLIFFアプリケーションを使い分けられる

#### Acceptance Criteria

1. WHEN ローカル開発環境でアプリケーションを起動する THEN Application SHALL `.env.local` ファイルから `NEXT_PUBLIC_LIFF_ID` 環境変数を読み込む
2. IF `.env.local` に `NEXT_PUBLIC_LIFF_ID` が定義されていない THEN Application SHALL 適切なエラーメッセージまたは警告を表示する
3. WHEN Vercelプロダクション環境にデプロイする THEN Application SHALL Vercelの環境変数設定から `NEXT_PUBLIC_LIFF_ID` を取得する
4. WHERE 環境変数が必要な全てのクライアントコンポーネント THE Application SHALL `process.env.NEXT_PUBLIC_LIFF_ID` を使用してLIFF IDにアクセスする
5. WHEN `.env.local` ファイルをリポジトリに追加する THEN Version Control SHALL `.gitignore` によってコミット対象から除外する

### Requirement 3: LIFF SDK初期化とエラーハンドリング

**Objective:** As a ユーザー, I want LIFF SDKが確実に初期化されたい, so that LINEミニアプリとして正常に動作する

#### Acceptance Criteria

1. WHEN アプリケーションが起動する AND LIFF IDが環境変数に設定されている THEN LIFF Module SHALL `liff.init()` を環境変数のLIFF IDで実行する
2. IF `liff.init()` が成功する THEN Application SHALL LIFF初期化完了状態を保持する
3. IF `liff.init()` が失敗する THEN Application SHALL エラーメッセージをユーザーに表示し、LIFF機能なしでゲームプレイ継続を許可する
4. WHEN LIFF初期化が完了する THEN Application SHALL 初期化完了のログを開発者コンソールに出力する
5. WHERE LIFF初期化中のローディング状態 THE Application SHALL ユーザーに初期化中であることを視覚的に示す

### Requirement 4: LINEアプリ内外の実行環境判定

**Objective:** As a アプリケーション, I want 実行環境がLINEアプリ内かブラウザかを判定したい, so that 適切なログインフローを提供できる

#### Acceptance Criteria

1. WHEN LIFF初期化が完了する THEN LIFF Module SHALL `liff.isInClient()` を呼び出して実行環境を判定する
2. IF `liff.isInClient()` が `true` を返す THEN Application SHALL LINEアプリ内実行モードとして認識する
3. IF `liff.isInClient()` が `false` を返す THEN Application SHALL 外部ブラウザ実行モードとして認識する
4. WHEN 実行環境判定が完了する THEN Application SHALL 判定結果を内部状態として保持する

### Requirement 5: LINEアプリ内での自動ログイン

**Objective:** As a LINEアプリユーザー, I want LINEミニアプリ起動時に自動的にログインしたい, so that 手動操作なしでゲームを開始できる

#### Acceptance Criteria

1. WHEN `liff.isInClient()` が `true` を返す AND LIFF初期化が完了している THEN Application SHALL 即座に `liff.init()` を実行する
2. WHEN LINEアプリ内で `liff.init()` が成功する THEN LIFF Module SHALL 自動的にユーザー認証を完了する
3. IF LINEアプリ内での自動ログインが成功する THEN Application SHALL ログイン状態を内部状態として保持する
4. WHEN 自動ログインが完了する THEN Application SHALL ユーザープロフィール情報を取得可能な状態にする

### Requirement 6: 外部ブラウザでの任意ログイン機能

**Objective:** As a 外部ブラウザユーザー, I want 任意でLINEログインできるボタンを使いたい, so that LINEプロフィール情報を活用するかを選択できる

#### Acceptance Criteria

1. WHEN `liff.isInClient()` が `false` を返す THEN Application SHALL ページ内にLINEログインボタンを表示する
2. WHEN ユーザーがLINEログインボタンをクリックする THEN Application SHALL `liff.login()` を呼び出してLIFFログインフローを開始する
3. IF ユーザーがログインせずにゲームを開始する THEN Application SHALL ログインなしでゲームプレイを許可する
4. WHERE 外部ブラウザでログインしていない状態 THE Application SHALL デフォルトアイコンまたはプレースホルダーをプロフィール画像位置に表示する
5. WHEN 外部ブラウザでログインが成功する THEN Application SHALL ログイン状態を内部状態として保持し、プロフィール情報を取得する

### Requirement 7: LINEプロフィールアイコン表示

**Objective:** As a ログイン済みユーザー, I want 自分のLINEプロフィールアイコンがゲーム画面に表示されたい, so that パーソナライズされたゲーム体験を得られる

#### Acceptance Criteria

1. WHEN ユーザーがLIFFログイン済み状態である THEN Application SHALL `liff.getProfile()` を呼び出してプロフィール情報を取得する
2. WHEN プロフィール情報取得が成功する THEN Application SHALL `pictureUrl` フィールドからプロフィール画像URLを抽出する
3. WHERE プレーヤースコア表示部分 THE Application SHALL 取得したプロフィール画像を表示する
4. IF プロフィール画像URLが取得できない THEN Application SHALL デフォルトアイコンまたはプレースホルダーを表示する
5. WHEN プロフィール画像を表示する THEN Application SHALL 画像を円形またはゲームUIに適した形状でレンダリングする
6. IF プロフィール画像の読み込みが失敗する THEN Application SHALL フォールバック画像を表示し、ゲームプレイを継続可能にする

### Requirement 8: ログイン状態管理とUI反映

**Objective:** As a アプリケーション, I want ログイン状態を一元管理したい, so that UIとゲームロジック全体で一貫した状態を維持できる

#### Acceptance Criteria

1. WHEN アプリケーションが起動する THEN Application SHALL ログイン状態管理用のReact Stateを初期化する
2. WHEN ログイン状態が変化する THEN Application SHALL 全ての関連UIコンポーネントを更新する
3. WHERE ログイン済み状態 THE Application SHALL プロフィール情報（アイコン、表示名）を表示する
4. WHERE 未ログイン状態 THE Application SHALL デフォルトUI要素（プレースホルダーアイコン）を表示する
5. WHEN ユーザーがログアウトする THEN Application SHALL ログイン状態とプロフィール情報をクリアし、UIを未ログイン状態に戻す

### Requirement 9: LIFF機能のテスト除外

**Objective:** As a 開発者, I want LIFF SDK動作のテストを書かない, so that リバーシゲームロジックのテストに集中できる

#### Acceptance Criteria

1. WHERE JestまたはPlaywrightテストスイート THE Testing Framework SHALL LIFF SDKのモック実装を使用する
2. WHEN LIFF関連モジュールをテストする THEN Testing Framework SHALL `liff.init()`, `liff.isInClient()`, `liff.getProfile()` をモック関数として扱う
3. WHERE テストケース作成時 THE Development Team SHALL LIFF ID検証、LIFF初期化エラーハンドリング、LIFF API呼び出し成功/失敗のテストを省略する
4. WHEN テストカバレッジを測定する THEN Testing Framework SHALL LIFF統合コードをカバレッジ計算から除外する、またはカバレッジ目標の対象外とする

### Requirement 10: エラーハンドリングとフォールバック動作

**Objective:** As a ユーザー, I want LIFF機能が失敗してもゲームをプレイしたい, so that LINE統合の問題がゲーム体験を妨げない

#### Acceptance Criteria

1. IF LIFF初期化が失敗する THEN Application SHALL エラーメッセージを表示し、LIFF機能なしでゲーム起動を継続する
2. IF プロフィール情報取得が失敗する THEN Application SHALL デフォルトアイコンを使用し、ゲームプレイを継続可能にする
3. WHERE LIFF SDK APIエラー発生時 THE Application SHALL エラー内容を開発者コンソールにログ出力し、ユーザーにはフレンドリーなメッセージを表示する
4. WHEN ネットワークエラーでLIFFログインが失敗する THEN Application SHALL リトライオプションをユーザーに提供する、または未ログイン状態でプレイ継続を許可する
5. WHERE LIFF IDが未設定または無効 THE Application SHALL 警告メッセージを表示し、LIFF機能を無効化してゲーム本体を動作させる

### Requirement 11: TypeScript型安全性

**Objective:** As a 開発者, I want LIFF SDKの型定義を活用したい, so that コンパイル時に型エラーを検出できる

#### Acceptance Criteria

1. WHEN LIFF SDKモジュールをインポートする THEN TypeScript SHALL `@liff/liff-sdk` パッケージの型定義を認識する
2. WHERE LIFF API呼び出しコード THE TypeScript Compiler SHALL `liff.getProfile()` の返り値型を `Profile` として推論する
3. WHEN LIFF関連の状態を定義する THEN Application SHALL `Profile | null` または適切なUnion型を使用してログイン状態を型安全に管理する
4. IF 型エラーが存在する THEN TypeScript Compiler SHALL ビルド前に型チェックで検出し、エラーを報告する

### Requirement 12: Next.js Static Export対応

**Objective:** As a 開発者, I want LIFF統合がStatic Exportと互換性を持つようにしたい, so that 既存のSSG最適化を維持できる

#### Acceptance Criteria

1. WHERE LIFF SDK初期化コード THE Application SHALL クライアントサイドのみで実行されるよう `"use client"` ディレクティブを使用する
2. WHEN Next.jsビルドプロセスを実行する THEN Build System SHALL LIFF SDKコードをクライアントバンドルにのみ含める
3. IF Server ComponentsでLIFF SDKを参照する THEN TypeScript Compiler SHALL コンパイルエラーを発生させる
4. WHEN `next build` コマンドでStatic Exportを生成する THEN Build System SHALL LIFF統合を含む静的HTMLファイルを正常に生成する

## Appendix

### 用語定義

- **LIFF SDK**: LINE Front-end Framework Software Development Kit
- **LIFF ID**: LINE Developers Consoleで発行されるLIFFアプリケーションの一意識別子
- **LINEアプリ内実行**: LINE公式アプリのWebViewでLIFFアプリが動作している状態
- **外部ブラウザ実行**: Chrome、Safari等の通常ブラウザでLIFFアプリが動作している状態
- **プロフィールアイコン**: LINEユーザーのプロフィール画像（`pictureUrl`）

### 関連仕様

- [LIFF SDK公式ドキュメント](https://developers.line.biz/ja/docs/liff/)
- `.kiro/steering/tech.md`: Technology Stack
- `.kiro/steering/structure.md`: Project Structure
- `.kiro/steering/product.md`: Product Overview

### ギャップ分析サマリー

**実装アプローチ**: Option B (新規コンポーネント作成)

既存コードベースとの統合分析により、以下の方針が決定されました：

**新規作成ファイル**:

- `/src/lib/liff/liff-client.ts` - LIFF SDK APIラッパー
- `/src/lib/liff/types.ts` - LIFF関連型定義（全型を集約）
- `/src/contexts/LiffContext.tsx` - React Context定義
- `/src/contexts/LiffProvider.tsx` - Provider コンポーネント
- `/src/hooks/useLiff.ts` - カスタムフック

**既存ファイルの変更**:

- `app/layout.tsx` - LiffProvider追加
- `src/components/GameBoard.tsx` - useLiff フック使用、UI拡張（最小変更）
- `jest.config.js` - LIFF統合コードをカバレッジ除外

**実装複雑性**:

- **工数見積もり**: M (4-6日)
- **リスク評価**: Medium
- **主要リスク**: Context API新規導入（学習コスト小）

**設計上の主要決定**:

1. **型定義の集約**: `/src/lib/liff/types.ts`に全LIFF関連型を配置し、循環依存を回避
2. **エラーハンドリング分離**: LIFF関連エラーは`useLiff`内部で完結、`useGameErrorHandler`とは分離
3. **プロフィール取得エラー対応**: エラー状態に記録しつつ、デフォルトアイコン表示を保証

詳細は `.kiro/specs/line-miniapp-support/design.md` を参照してください。
