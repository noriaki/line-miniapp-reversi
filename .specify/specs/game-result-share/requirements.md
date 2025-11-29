# Requirements Document

## Introduction

本ドキュメントは、リバーシゲームの結果シェア機能に関する要件を定義する。ゲーム終了時に結果盤面の画像を生成し、LINEのShared Target PickerまたはOS標準のWeb Share APIを通じてシェアする機能を実現する。LINEミニアプリの特性を活かし、ユーザーがゲーム結果を友人と手軽に共有できる体験を提供する。

## Requirements

### Requirement 1: シェアボタン表示

**Objective:** プレイヤーとして、ゲーム終了後にシェアボタンを確認できるようにしたい。これにより、ゲーム結果を共有する機会を得ることができる。

#### Acceptance Criteria

1. When ゲームが終了状態になった, the Game Result Share shall 「LINEでシェア」ボタンと「その他でシェア」ボタンを表示する
2. The Game Result Share shall シェアボタンを「新しいゲームを開始」ボタンの隣に配置する
3. The Game Result Share shall 「LINEでシェア」ボタンをLINEブランドカラー（緑）で表示する
4. The Game Result Share shall シェアボタンを視認性が高く押しやすいサイズで表示する
5. If Web Share APIに非対応のブラウザである, then the Game Result Share shall 「その他でシェア」ボタンを非表示にする

### Requirement 2: LINEシェア機能

**Objective:** プレイヤーとして、LINEの友人やグループにゲーム結果をシェアしたい。これにより、友人をゲームに招待できる。

#### Acceptance Criteria

1. While ユーザーがLINEログイン済みである, when 「LINEでシェア」ボタンがタップされた, the Game Result Share shall LIFF SDK `liff.shareTargetPicker()`を起動する
2. While ユーザーがLINE非ログイン状態である, when 「LINEでシェア」ボタンがタップされた, the Game Result Share shall LINEログイン処理を実行する
3. When LINEログインが完了した, the Game Result Share shall シェアフローを継続してShared Target Pickerを起動する
4. The Game Result Share shall Flex Message形式でシェアコンテンツを送信する
5. The Game Result Share shall Flex Messageにシェア画像を含める
6. The Game Result Share shall Flex Messageに結果テキストと招待文を含める
7. The Game Result Share shall Flex Messageに「リバーシで遊ぶ」アプリ起動ボタンを含める
8. When 非ログイン状態で「LINEでシェア」ボタンがタップされた, the Game Result Share shall ゲーム終了状態（盤面・スコア・勝敗）をブラウザストレージに一時保存する
9. When LINEログイン完了後にページがリロードされた, the Game Result Share shall 保存済みのゲーム終了状態を復元し、シェアフローを自動継続する
10. The Game Result Share shall 保存されたゲーム状態が1時間以上経過している場合、無効化する

### Requirement 3: OS標準シェア機能

**Objective:** プレイヤーとして、LINE以外のアプリでもゲーム結果をシェアしたい。これにより、様々なSNSやメッセージアプリで結果を共有できる。

#### Acceptance Criteria

1. When 「その他でシェア」ボタンがタップされた, the Game Result Share shall Web Share API (`navigator.share()`)を呼び出す
2. The Game Result Share shall シェア画像ファイルをWeb Share APIに渡す
3. The Game Result Share shall シェアテキスト（結果＋招待文＋アプリURL）をWeb Share APIに渡す
4. The Game Result Share shall ログイン状態にかかわらずOS標準シェアを利用可能にする

### Requirement 4: シェア画像生成

**Objective:** プレイヤーとして、ゲーム結果を視覚的に伝える画像をシェアしたい。これにより、盤面状態と勝敗が一目でわかる。

#### Acceptance Criteria

1. When ゲームが終了した, the Game Result Share shall シェア用画像の生成を開始する
2. The Game Result Share shall 画像にゲーム終了時の盤面状態（8x8グリッド、黒白の石配置）を含める
3. The Game Result Share shall 画像にスコア表示（黒○個 vs 白○個）を含める
4. The Game Result Share shall 画像に勝敗結果テキスト（「あなたの勝ち！」「AIの勝ち！」「引き分け」）を含める
5. The Game Result Share shall 画像にアプリロゴまたはタイトル（ブランディング要素）を含める
6. The Game Result Share shall 生成した画像を外部ストレージにアップロードしてURLを取得する

### Requirement 5: シェアテキスト

**Objective:** プレイヤーとして、シェア時に結果と招待メッセージを伝えたい。これにより、受信者がゲームに興味を持つきっかけを作れる。

#### Acceptance Criteria

1. The Game Result Share shall シェアテキストにゲーム結果（勝敗）を含める
2. The Game Result Share shall シェアテキストにスコア情報を含める
3. The Game Result Share shall シェアテキストに招待文を含める
4. The Game Result Share shall シェアテキストにアプリURLを含める

### Requirement 6: シェア操作フィードバック

**Objective:** プレイヤーとして、シェア操作の結果を知りたい。これにより、シェアが成功したかどうかを確認できる。

#### Acceptance Criteria

1. When シェアが正常に完了した, the Game Result Share shall トースト通知で「シェアしました！」を一時表示する
2. If シェア処理が失敗した, then the Game Result Share shall トースト通知でエラーメッセージを表示する
3. When ユーザーがシェアをキャンセルした, the Game Result Share shall 通知を表示せずに元の画面に戻る

### Requirement 7: クロスプラットフォーム対応

**Objective:** プレイヤーとして、様々な環境でシェア機能を利用したい。これにより、使用デバイスや環境に関係なくシェアできる。

#### Acceptance Criteria

1. The Game Result Share shall LINEアプリ内ブラウザで動作する
2. The Game Result Share shall 外部ブラウザ（Safari、Chrome）で動作する
3. The Game Result Share shall iOS端末で動作する
4. The Game Result Share shall Android端末で動作する

### Requirement 8: パフォーマンス

**Objective:** プレイヤーとして、シェア操作が快適に行えるようにしたい。これにより、スムーズなユーザー体験を得られる。

#### Acceptance Criteria

1. When ゲームが終了した, the Game Result Share shall 速やかに画像生成を実行する
2. The Game Result Share shall 画像アップロードをユーザー体験を阻害しない方式で実行する
