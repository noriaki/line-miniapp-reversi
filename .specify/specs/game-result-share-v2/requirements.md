# Requirements Document

## Introduction

本ドキュメントは、リバーシゲーム終了時にプレイ結果をLINEやその他のプラットフォームにシェアする機能「ゲーム結果シェア機能（OG画像生成方式）」の要件を定義する。ゲーム終了時に自動的に結果ページへ遷移し、手順履歴をBase64URL直接エンコード方式でエンコードしたシェア専用URLを生成する。サーバーサイドでOG画像をオンデマンド生成することで、外部ストレージ不要でリッチなシェア体験を提供する。手順ベースのエンコードにより、将来の棋譜機能拡張への対応も容易となる。

## Requirements

### Requirement 1: ゲーム終了時の自動遷移

**Objective:** As a プレイヤー, I want ゲーム終了時に自動的に結果ページへ遷移すること, so that ゲームページはプレイに集中でき、結果確認とシェアは専用ページで行える

#### Acceptance Criteria (Req1)

1. When ゲームが終了状態（勝利/敗北/引き分け）になった, the ゲームページ shall 自動的に結果ページ `/r/[side]/[encodedMoves]` へ遷移する（side: player's side b=先攻/黒, w=後攻/白）
2. When 結果ページへ遷移する, the システム shall 現在のmoveHistoryをBase64URL直接エンコード方式でエンコードしてURLに含める
3. When 結果ページへ遷移する, the システム shall プレイヤーの手番情報（先攻/後攻）をURLのsideパラメータに含める
4. The 遷移 shall ゲーム終了から500ミリ秒以内に開始される
5. The ゲームページ shall ゲームプレイのみに集中し、結果表示やシェア機能を含まない

### Requirement 2: 手順履歴のエンコーディング

**Objective:** As a システム, I want 手順履歴をBase64URL直接エンコード方式でエンコードすること, so that シェアURLが短く将来の棋譜機能拡張にも対応できる

#### Acceptance Criteria (Req2)

1. When 結果ページへの遷移が開始される, the MoveHistoryEncoder shall moveHistoryをBase64URL直接エンコード方式でエンコードする
2. When 各手をエンコードする, the MoveHistoryEncoder shall Position(row, col)をインデックス（row \* 8 + col、0-63の範囲）に変換し、Base64URL文字（ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-\_）に直接マッピングする
3. The エンコード結果 shall 1手あたり1文字で構成される（例: f5(row=4, col=5)はインデックス37で'l'、a3(row=2, col=0)はインデックス16で'Q'）
4. The エンコードされたURL shall 最大60手の手順を含むことができる（最大60文字）
5. When エンコードされたURLがデコードされる, the MoveHistoryDecoder shall 元の手順履歴を完全に復元する

### Requirement 3: 手順からの盤面復元

**Objective:** As a システム, I want 手順履歴から最終盤面を復元すること, so that URLから正確な対戦結果を再現できる

#### Acceptance Criteria (Req3)

1. When 結果ページがencodedMovesを受け取る, the 盤面復元ロジック shall 初期盤面から手順を順番に適用して最終盤面を計算する
2. When 手順を適用する, the 盤面復元ロジック shall 既存のゲームロジック（makeMove関数等）を再利用する
3. When パス（手番スキップ）が発生した手順, the 盤面復元ロジック shall パスを正しく処理して次の手に進む
4. If 手順の途中で不正な手（無効な位置への配置）が検出された, then the 盤面復元ロジック shall エラーを返す

### Requirement 4: 結果ページの表示

**Objective:** As a プレイヤーまたはシェア受信者, I want 結果ページで盤面状態とスコアを確認できること, so that 対戦結果を理解しシェアやゲーム開始の行動を取れる

#### Acceptance Criteria (Req4)

1. When ユーザーが `/r/[side]/[encodedMoves]` にアクセスする, the 結果ページ shall エンコードされた手順から盤面を復元して表示する
2. The 結果ページ shall 最終盤面、スコア（黒/白の石数）、勝敗結果を表示する
3. When sideパラメータが `b`（先攻/黒）の場合, the 結果ページ shall プレイヤーを上部（黒側）、AIを下部（白側）に表示する
4. When sideパラメータが `w`（後攻/白）の場合, the 結果ページ shall プレイヤーを下部（白側）、AIを上部（黒側）に表示する
5. The 結果ページ shall スコア表示において、プレイヤー側に「プレーヤー」、AI側に「AI」というラベルを表示する
6. The 結果ページ shall 「LINEでシェア」ボタン（LINE緑色）と「その他でシェア」ボタンを表示する
7. If Web Share API が利用不可能な環境, then the 結果ページ shall 「その他でシェア」ボタンを非表示にする
8. The 結果ページ shall 「もう一度遊ぶ」ボタン（ゲーム開始へのCTA）を表示する
9. When ユーザーが「もう一度遊ぶ」ボタンをタップする, the 結果ページ shall ゲームページに遷移する
10. If 不正なエンコード文字列またはsideパラメータでアクセスされた, then the 結果ページ shall エラーメッセージと共にゲームページへの導線を表示する

### Requirement 5: LINEシェアフロー

**Objective:** As a LINEユーザー, I want LINEの友だちやグループに結果をシェアすること, so that LINE上で直接シェアを完了できる

#### Acceptance Criteria (Req5)

1. The Share Service shall LINEログイン済みかつ `shareTargetPicker` が利用可能なすべてのユーザーにシェア機能を提供する（ゲームをプレイした本人に限定しない）
2. When ユーザーが「LINEでシェア」ボタンをタップする, the Share Service shall `liff.shareTargetPicker()` を呼び出す
3. When `liff.shareTargetPicker()` が呼び出される, the Share Service shall Flex Message形式でシェアコンテンツを送信する
4. When シェアが正常に完了した, the Share Service shall 成功トーストを表示する
5. If ユーザーがシェアをキャンセルした, then the Share Service shall 元の結果ページに戻る（エラー表示なし）
6. If `liff.shareTargetPicker()` がエラーを返した, then the Share Service shall エラートーストを表示する

### Requirement 6: Flex Message構造

**Objective:** As a システム, I want Flex Messageを標準LINE Mini App形式で構成すること, so that LINEユーザーに見慣れたUIで情報を伝えリッチなエンゲージメントを促進できる

#### Acceptance Criteria (Req6)

1. The Flex Message shall bubble形式で構成される
2. The Flex Message hero section shall OG画像（1200:630のアスペクト比）を表示する
3. The Flex Message body section shall プレイヤーとAIのスコアを横並びで表示する（プレイヤー側には石マーク、AI側には勝者の場合王冠を表示）
4. The Flex Message body section shall セパレーターの後に「対局結果を見る」ボタン（primary style、#06C755）を表示し、タップするとpermalinkUrlへ遷移する
5. The Flex Message body section shall 「対局結果を見る」ボタンの下に「新しく対局する ● vs ○」ボタン（link style、#06C755）を表示し、タップするとhomeUrlへ遷移する
6. The Flex Message body section shall 両ボタンの下に「AIに勝てるかな？」というテキストを表示する
7. The Flex Message footer section shall アプリブランディングを表示する（アプリアイコン画像、アプリ名「かんたんリバーシ」、矢印アイコン）
8. When ユーザーがfooterの矢印アイコンをタップする, the Flex Message shall homeUrlへ遷移する
9. The homeUrl shall `https://miniapp.line.me/{liffId}` 形式で構成される（LIFF Mini Appホーム URL）
10. The permalinkUrl shall `https://miniapp.line.me/{liffId}/r/{side}/{encodedMoves}` 形式で構成される

### Requirement 7: Web Shareフロー

**Objective:** As a プレイヤー, I want LINE以外のアプリにもシェアできること, so that Twitter、Facebook等のプラットフォームにも共有できる

#### Acceptance Criteria (Req7)

1. When ユーザーが「その他でシェア」ボタンをタップする, the Share Service shall `navigator.share()` を呼び出す
2. When `navigator.share()` が呼び出される, the Share Service shall URLとテキストのみを渡す（画像Blobは使用しない）
3. The シェアテキスト shall ゲーム結果とスコアを含む
4. When シェアが正常に完了した, the Share Service shall 成功トーストを表示する
5. If ユーザーがシェアをキャンセルした, then the Share Service shall 元の結果ページに戻る（エラー表示なし）
6. If `navigator.share()` がエラーを返した, then the Share Service shall エラートーストを表示する

### Requirement 8: OGP画像のサーバーサイド生成

**Objective:** As a システム, I want OG画像をサーバーサイドでオンデマンド生成すること, so that 外部ストレージ不要でリッチなプレビューを提供できる

#### Acceptance Criteria (Req8)

1. When クローラーまたはクライアントが `/r/[side]/[encodedMoves]` のOG画像にアクセスする, the Image Generator shall 手順から盤面を復元し、Next.js `ImageResponse` を使用して画像を生成する
2. The OG画像 shall 1200x630ピクセル（OGP標準）のサイズで生成される
3. The OG画像 shall 最終盤面のビジュアル、スコア、勝敗結果、アプリブランドを含む
4. The OG画像 shall プレイヤー情報（side）を含まない（盤面とスコアのみで構成される汎用画像とする）
5. The OG画像生成 shall 3秒以内に完了する
6. The 結果ページ shall 適切なOGPメタタグ（og:image, og:title, og:description）を含む

### Requirement 9: クロスプラットフォーム互換性

**Objective:** As a プレイヤー, I want 様々な環境でシェア機能を利用できること, so that デバイスやブラウザに関係なく機能を使える

#### Acceptance Criteria (Req9)

1. The シェア機能 shall LINEアプリ内ブラウザ（iOS/Android）で正常に動作する
2. The 結果ページ shall 外部ブラウザ（Safari、Chrome）で正常に表示される
3. The 結果ページ shall iOS/Android両方で正常に動作する
4. While LINEアプリ内で結果ページが表示される, the 結果ページ shall LINEの戻るボタンに対応する

## Non-Goals (Scope Exclusions)

以下は本機能のスコープ外とする:

- シェアテキストのユーザーカスタマイズ機能
- シェア履歴の保存・表示機能
- シェア回数のトラッキング・分析機能
- 対人戦時の対戦相手情報表示
- ローカルへの画像ダウンロード機能
- ログインリダイレクト後のシェア自動継続（PendingShareStorage）
- LINEプロフィールアイコンの表示（戦歴機能で実装予定）
- 棋譜の再生機能（手順データを保持するが、本機能では最終盤面のみ表示）
