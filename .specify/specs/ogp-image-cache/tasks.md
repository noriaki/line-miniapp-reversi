# Implementation Plan

## Tasks

- [x] 1. 依存パッケージのインストールと環境変数設定
  - AWS SDK S3クライアントパッケージをプロジェクトに追加
  - R2接続に必要な環境変数テンプレートを.env.exampleに追記（R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_DOMAIN）
  - _Requirements: 4.1, 4.2, 5.3_

- [x] 2. R2ストレージクライアント
- [x] 2.1 (P) R2クライアント初期化モジュールの実装
  - Cloudflare R2のS3互換エンドポイントに接続するクライアントを環境変数から構成
  - バケット名と公開ドメインを環境変数から取得して公開
  - 環境変数未設定時はランタイムエラーとして処理
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3_

- [x] 2.2 (P) R2操作ユーティリティの実装
  - オブジェクト存在確認機能（HeadObject）を実装し、存在時true/未存在時falseを返却
  - 画像アップロード機能（PutObject）を実装し、ContentType: image/pngで保存
  - R2公開URLビルダー関数を実装
  - R2接続エラー時はログ記録後に適切なエラーをthrow
  - _Requirements: 1.1, 1.3, 4.3, 4.4, 6.3, 6.4_

- [x] 2.3 R2モジュールの単体テスト
  - 存在確認機能のテスト（存在時true、404時false、接続エラー時throw）
  - アップロード機能のテスト（成功時void、失敗時throw）
  - URLビルダー関数のテスト（正しいURL形式の検証）
  - AWS SDKをモック化してテストを実行
  - _Requirements: 4.3_

- [x] 3. OG画像生成
- [x] 3.1 (P) OG画像生成ロジックの実装
  - 既存opengraph-image.tsxからCOLORS定数、セル描画、盤面描画、スコア表示、ブランド表示のロジックを抽出
  - 棋譜のデコードとリプレイにより最終盤面状態を再構築
  - ImageResponseを使用して1200x630 PNG形式の画像を生成
  - 無効な棋譜の場合はエラーをthrow
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3.2 OG画像生成の単体テスト
  - 有効な棋譜でBuffer形式の画像が返却されることを検証
  - 無効な棋譜でエラーがthrowされることを検証
  - 生成画像のサイズ（1200x630）を検証
  - _Requirements: 8.3_

- [ ] 4. OG画像生成APIルート
- [ ] 4.1 OG画像生成API Routeの実装
  - Dynamic route segmentsでsideとencodedMovesを受け取り
  - R2に画像が存在する場合はスキップしてexistsステータスを返却
  - R2に画像が存在しない場合は画像を生成してR2にアップロードし、createdステータスを返却
  - 無効なsideまたはencodedMovesの場合は400エラーを返却
  - R2接続エラーの場合は500エラーを返却しログ記録
  - _Requirements: 1.2, 6.3, 6.4, 9.2, 9.3_

- [ ] 4.2 API Routeの統合テスト
  - R2に画像存在時のexistsレスポンスを検証
  - R2に画像未存在時の生成・アップロード・createdレスポンスを検証
  - 無効な棋譜での400エラーレスポンスを検証
  - R2エラー時の500エラーとログ記録を検証
  - _Requirements: 9.2, 9.3_

- [ ] 5. クライアントサイドPrefetchコンポーネント
  - ページマウント時にAPI Routeを呼び出して画像生成をトリガーするClient Componentを実装
  - fire-and-forget方式でレスポンスを無視（ネットワークエラーもサイレントに処理）
  - 重複リクエストは許容（R2のHeadObjectチェックで重複アップロード防止済み）
  - _Requirements: 6.2_

- [ ] 6. 結果ページの統合
- [ ] 6.1 generateMetadataのR2 URL対応
  - og:imageとtwitter:imageにR2公開ドメインを使用した直接URLを設定
  - 既存のopengraph-image規約ファイルパスへの参照を削除
  - 無効な棋譜時はog:imageを含まないデフォルトメタデータを返却
  - Server Component内でR2_PUBLIC_DOMAIN環境変数を使用してURL構築
  - _Requirements: 2.1, 2.2, 2.3, 6.1, 9.1_

- [ ] 6.2 page.tsxのPrefetchとogImageUrl受渡し
  - Server ComponentでR2 URLを構築し、ogImageUrlとしてShareButtonsWrapperに渡す
  - OgImagePrefetchコンポーネントをページに配置
  - _Requirements: 3.1, 3.2, 6.2_

- [ ] 7. シェア機能のR2 URL対応
- [ ] 7.1 ShareButtonsWrapperのogImageUrl prop追加
  - ogImageUrl propを追加で受け取り、ShareButtonsに伝播
  - 既存のserverBaseUrlパターンを踏襲
  - _Requirements: 3.1, 3.2_

- [ ] 7.2 ShareButtonsのogImageUrl prop追加
  - ogImageUrl propを受け取り、FlexMessageBuilderに渡す
  - _Requirements: 3.1, 3.2_

- [ ] 7.3 FlexMessageBuilderの画像URL更新
  - 画像URLにprops経由で受け取ったR2 URLを使用
  - og:imageと同一のR2 URLを参照することを確認
  - _Requirements: 3.1, 3.2_

- [ ] 8. 既存opengraph-image.tsx規約ファイルの削除
  - opengraph-image.tsx規約ファイルを削除
  - 関連するインポートや参照がないことを確認
  - _Requirements: 7.2_

- [ ] 9. 全体統合の検証
  - 結果ページアクセス時にPrefetchが発火し、R2に画像が保存されることを検証
  - generateMetadataが返却するog:image URLがR2直接URLであることを検証
  - LINEシェア時のFlex Messageがog:imageと同一のR2 URLを参照することを検証
  - 開発環境とPreview環境で異なるバケット設定が適用されることを検証
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 5.1, 5.2, 7.1, 7.3_

## Requirements Coverage

| Requirement | Task(s)               |
| ----------- | --------------------- |
| 1.1         | 2.2, 9                |
| 1.2         | 4.1, 9                |
| 1.3         | 2.2, 9                |
| 2.1         | 6.1, 9                |
| 2.2         | 6.1, 9                |
| 2.3         | 6.1, 9                |
| 3.1         | 6.2, 7.1, 7.2, 7.3, 9 |
| 3.2         | 6.2, 7.1, 7.2, 7.3, 9 |
| 4.1         | 1, 2.1                |
| 4.2         | 1, 2.1                |
| 4.3         | 2.2, 2.3              |
| 4.4         | 2.2                   |
| 5.1         | 2.1, 9                |
| 5.2         | 2.1, 9                |
| 5.3         | 1, 2.1                |
| 6.1         | 6.1                   |
| 6.2         | 5, 6.2                |
| 6.3         | 2.2, 4.1              |
| 6.4         | 2.2, 4.1              |
| 7.1         | (全体設計で充足)      |
| 7.2         | 8                     |
| 7.3         | 4.1                   |
| 8.1         | 3.1                   |
| 8.2         | 3.1                   |
| 8.3         | 3.1, 3.2              |
| 8.4         | 3.1                   |
| 9.1         | 6.1                   |
| 9.2         | 4.1, 4.2              |
| 9.3         | 4.1, 4.2              |
