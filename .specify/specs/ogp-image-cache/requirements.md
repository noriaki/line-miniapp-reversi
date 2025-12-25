# Requirements Document

## Introduction

本仕様は、OGP画像のキャッシュ問題を解決するための要件を定義する。現在、OGP画像がVercel CDNでキャッシュされず、毎リクエスト11-17秒の生成時間がかかる問題が発生している。Cloudflare R2を永続ストレージとして活用し、2回目以降のアクセスで画像を即座に返却する仕組みを構築する。

仕様を作成する際には、[事前検討ドキュメント](./pre-prepared-guidance.md) `@.specify/specs/ogp-image-cache/pre-prepared-guidance.md` のPart 2 `## 2. 仕様 (Design)` も補足的に参照すること。

アーキテクチャの特徴:

- `generateMetadata()` は純粋関数として維持（副作用なし）
- API Route + クライアントサイド prefetch パターンで画像生成をトリガー
- `og:image` は R2 直接URL を使用（リダイレクトなし）
- R2 Public アクセスはカスタムドメイン経由（キャッシュは Cloudflare デフォルト設定を使用）

## Requirements

### Requirement 1: OGP画像の永続キャッシュ

**Objective:** As a ゲーム結果ページの訪問者, I want OGP画像が2回目以降のアクセスで即座に表示される, so that SNSでシェアされたリンクのプレビュー表示が高速になる

#### Acceptance Criteria (Req 1)

1. When 結果ページへの2回目以降のリクエストが発生した場合, the OGP画像配信システム shall R2に保存済みの画像を即座に返却する
2. When 結果ページへの初回リクエストが発生し、R2に対応する画像が存在しない場合, the OGP画像生成API shall 画像を生成してR2にアップロードし、ステータスを返却する
3. The OGP画像 shall `og/{side}/{encodedMoves}.png` 形式のキーでR2に保存される

### Requirement 2: OGP画像のリダイレクトなし直接URL

**Objective:** As a SNSクローラー（Facebook/Twitter/LINE）, I want og:imageがリダイレクトなしの直接URLである, so that 画像の取得に失敗せずプレビューを正しく表示できる

#### Acceptance Criteria (Req 2)

1. The ページメタデータ shall og:imageにR2の公開ドメインを使用した直接URLを指定する
2. The ページメタデータ shall twitter:imageにR2の公開ドメインを使用した直接URLを指定する
3. The OGP画像URL shall HTTPリダイレクトを経由せずに画像コンテンツを返却する

### Requirement 3: LINEシェア時のFlex Message画像URL

**Objective:** As a LINEでゲーム結果をシェアするユーザー, I want Flex Messageに表示される画像がキャッシュ済みのR2画像を参照する, so that シェア受信者が画像を即座に閲覧できる

#### Acceptance Criteria (Req 3)

1. When LINEシェアのFlex Messageを構築する場合, the Flex Messageビルダー shall 画像URLとしてR2の公開ドメインを使用した直接URLを指定する
2. The Flex Message画像URL shall og:imageと同一のR2 URLを参照する

### Requirement 4: R2ストレージ構成

**Objective:** As a システム運用者, I want R2ストレージが適切に構成されている, so that OGP画像を安定して配信できる

#### Acceptance Criteria (Req 4)

1. The R2クライアント shall 環境変数から認証情報（アカウントID、アクセスキー、シークレットキー）を取得する
2. The R2クライアント shall 環境変数からバケット名と公開ドメインを取得する
3. If R2への接続に失敗した場合, the OGP画像生成API shall エラーをログに記録し、適切なエラーレスポンスを返却する
4. The R2バケット shall カスタムドメイン経由のPublicアクセスで配信され、Cloudflareデフォルトのキャッシュ設定が適用される

### Requirement 5: 環境別R2構成

**Objective:** As a 開発者, I want 開発/Preview環境と本番環境で異なるR2バケットを使用する, so that 環境間のデータ分離と独立したテストが可能になる

#### Acceptance Criteria (Req 5)

1. The 開発/Preview環境 shall バケット名 `lineminiapp-reversi-images-dev` と公開ドメイン `dev.images.reversi.line-mini.dev` を使用する
2. The 本番環境 shall バケット名 `lineminiapp-reversi-images` と公開ドメイン `images.reversi.line-mini.dev` を使用する
3. The R2クライアント shall 環境変数 `R2_BUCKET` と `R2_PUBLIC_DOMAIN` により環境別の設定を取得する

### Requirement 6: 画像生成トリガー

**Objective:** As a 開発者, I want 画像生成が適切なタイミングでトリガーされる, so that generateMetadata()の純粋関数性を維持しつつ画像を事前生成できる

#### Acceptance Criteria (Req 6)

1. The generateMetadata() shall 副作用を持たず、R2のURLを直接参照するのみとする（画像生成・アップロードを行わない）
2. When 結果ページがクライアントサイドでレンダリングされた場合, the OGP画像プリフェッチコンポーネント shall API Routeを呼び出して画像生成をトリガーする
3. The OGP画像生成API shall R2に画像が存在する場合は生成をスキップし、存在確認結果のみを返却する
4. The OGP画像生成API shall R2に画像が存在しない場合は画像を生成してR2にアップロードする

### Requirement 7: 既存システムとの互換性

**Objective:** As a 開発者, I want 既存のリポジトリ構成とシステムアーキテクチャを維持する, so that 最小限の変更でキャッシュ問題を解決できる

#### Acceptance Criteria (Req 7)

1. The 実装 shall 既存のモノリポ構成を維持し、別リポジトリを作成しない
2. When R2連携が実装された場合, the 実装 shall 既存の`opengraph-image.tsx`規約ファイルを廃止する
3. The 実装 shall Next.js App Routerのルーティング規約に従い、API Routeでオンデマンド画像生成を行う

### Requirement 8: OGP画像の視覚的再現性

**Objective:** As a ユーザー, I want 新しいOGP画像が現行のopengraph-image.tsxと同一の内容を表示する, so that 移行後も一貫したビジュアル体験が維持される

#### Acceptance Criteria (Req 8)

1. The OGP画像生成ロジック shall 現行opengraph-image.tsxのCOLORS定数（盤面色、石色、テキスト色など）を再現する
2. The OGP画像生成ロジック shall 現行opengraph-image.tsxのrenderCell()、renderBoard()、renderScore()、renderBrand()を再現する
3. The OGP画像 shall サイズ1200x630（OGP標準）、フォーマットPNGで生成される
4. The OGP画像 shall レイアウト（左=盤面、右=スコア+ブランド）を現行実装と同一に維持する

### Requirement 9: 無効な棋譜のエラー処理

**Objective:** As a SNSクローラーおよびユーザー, I want 無効な棋譜が適切に処理される, so that エラー時に明確な挙動が得られる

#### Acceptance Criteria (Req 9)

1. When 棋譜のデコードまたはリプレイに失敗した場合, the generateMetadata() shall og:imageを含まないデフォルトメタデータを返却する
2. When 無効な棋譜でAPI Routeが呼び出された場合, the OGP画像生成API shall ステータス400のエラーレスポンスを返却する
3. The OGP画像生成API shall 無効な棋譜に対してR2への保存を行わない
