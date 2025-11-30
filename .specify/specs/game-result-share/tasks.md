# Implementation Plan

## Task Format Template

Use whichever pattern fits the work breakdown:

### Major task only

- [ ] {{NUMBER}}. {{TASK_DESCRIPTION}}{{PARALLEL_MARK}}
  - {{DETAIL_ITEM_1}} _(Include details only when needed. If the task stands alone, omit bullet items.)_
  - _Requirements: {{REQUIREMENT_IDS}}_

### Major + Sub-task structure

- [ ] {{MAJOR_NUMBER}}. {{MAJOR_TASK_SUMMARY}}
- [ ] {{MAJOR_NUMBER}}.{{SUB_NUMBER}} {{SUB_TASK_DESCRIPTION}}{{SUB_PARALLEL_MARK}}
  - {{DETAIL_ITEM_1}}
  - {{DETAIL_ITEM_2}}
  - _Requirements: {{REQUIREMENT_IDS}}_ _(IDs only; do not add descriptions or parentheses.)_

> **Parallel marker**: Append ` (P)` only to tasks that can be executed in parallel. Omit the marker when running in `--sequential` mode.
>
> **Optional test coverage**: When a sub-task is deferrable test work tied to acceptance criteria, mark the checkbox as `- [ ]*` and explain the referenced requirements in the detail bullets.

---

## Tasks

- [x] 1. 共有型定義とストレージ基盤の構築
- [x] 1.1 シェア機能用の型定義を作成する
  - GameResult、ShareState、ShareError型を定義する
  - PendingShareData型（盤面、スコア、勝者、タイムスタンプ）を定義する
  - ImageGenerationOptions型を定義する
  - _Requirements: 2.8, 4.1_

- [x] 1.2 PendingShareStorageを実装する
  - sessionStorageを使用したゲーム終了状態の保存機能を実装する
  - 保存データの読み出し機能を実装する
  - 保存データのクリア機能を実装する
  - 有効期限判定（1時間）ロジックを実装する
  - Storage Key「pendingShareGame」を定数として定義する
  - isAvailable()メソッドでsessionStorageの利用可否を判定する機能を実装する
  - _Requirements: 2.8, 2.9, 2.10_

- [x] 2. 画像生成とアップロード機能の構築
- [x] 2.1 ShareImagePreviewコンポーネントを実装する
  - 固定サイズ（1200x630px）のOGP比率レイアウトを構築する
  - 左側に盤面（560x560px、8x8グリッド）を配置する
  - 右側に勝敗テキスト、スコア、ブランド名を配置する
  - html2canvas互換のインラインスタイルを使用する
  - visibility: hiddenで画面には非表示にする
  - 勝敗テキストは第三者視点（「プレーヤーの勝ち!」「プレーヤーの負け...」「引き分け」）を使用する
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 2.2 ShareImageGeneratorを実装する
  - html2canvasでDOM要素からCanvas画像を生成する機能を実装する
  - CanvasをBlob（PNG形式）に変換する機能を実装する
  - 解像度スケール（デフォルト: 2）のオプションをサポートする
  - maxSizeBytesオプションで画像サイズ上限を指定し、超過時はエラーを返却する
  - _Requirements: 4.1, 8.1_

- [x] 2.3 画像アップロード機能を実装する
  - Presigned URL取得APIの呼び出しを実装する
  - 取得したURLへの画像PUTアップロードを実装する
  - 環境変数（NEXT_PUBLIC_SHARE_API_URL）による本番/開発切り替えをサポートする
  - アップロードエラー時のエラーハンドリングを実装する
  - _Requirements: 4.6, 8.2_

- [x] 3. モックAPIサーバーの構築
- [x] 3.1 ローカル開発用モックサーバーを実装する
  - packages/mock-share-api/にExpressまたはHonoで軽量サーバーを構築する
  - POST /api/upload/presignedエンドポイントでモックレスポンスを返却する
  - PUT /mock-upload/:idエンドポイントで画像データを受け取る
  - 静的ファイルサーバー機能で画像プレビューを提供する
  - pnpm dev:mockコマンドで起動できるようにする
  - _Requirements: 4.6, 8.2_

- [x] 4. シェアコンテンツ構築機能の実装
- [x] 4.1 シェアテキスト構築機能を実装する
  - 勝敗結果をテキストに含める
  - スコア情報（黒○個 vs 白○個）をテキストに含める
  - 招待文をテキストに含める
  - アプリURL（LIFFエンドポイント）をテキストに含める
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4.2 FlexMessageBuilderを実装する
  - Bubble形式のFlex Messageを構築する
  - Hero部分にシェア画像（aspectMode: fit）を配置する
  - Body部分に3カラム構成でスコアと勝者を王冠で表示する
  - Body部分に招待文「AIに勝てるかな？」を配置する
  - Footer部分に「かんたんリバーシをプレイ」URIアクションボタンを配置する
  - altTextを「リバーシの結果をシェア」に設定する
  - _Requirements: 2.4, 2.5, 2.6, 2.7_

- [x] 5. ShareServiceの実装
- [x] 5.1 ShareServiceコア機能を実装する
  - prepareShareImage関数で画像生成とアップロードを調整する
  - shareViaLine関数でFlex Message構築とshareTargetPicker呼び出しを実装する
  - shareViaWebShare関数でWeb Share API呼び出しを実装する
  - ShareServiceResult型で成功/失敗/キャンセルを統一的に返却する
  - liff.isApiAvailable("shareTargetPicker")で事前チェックする
  - navigator.canShare({ files })で事前チェックする
  - _Requirements: 2.1, 2.4, 3.1, 3.2, 3.3, 4.1, 4.6_

- [x] 6. useShareフックの実装
- [x] 6.1 シェア状態管理フックを実装する
  - isShareReady、isSharing、canWebShare、shareImageUrl状態を管理する
  - hasPendingShare状態でログインリダイレクト後の自動シェア待機を管理する
  - isSharingフラグで複数回シェア操作の排他制御を行う
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.4_

- [x] 6.2 シェア操作ハンドラを実装する
  - handleLineShare関数でLINEシェアフローを制御する
  - 未ログイン時は状態保存後にliff.login()を呼び出す
  - handleWebShare関数でWeb Share APIシェアを実行する
  - prepareShareImage関数でゲーム終了時の画像生成を開始する
  - _Requirements: 2.1, 2.2, 2.3, 3.1_

- [x] 6.3 ログイン後シェア継続機能を実装する
  - フック初期化時にPendingShareStorage.load()でペンディング状態を確認する
  - 有効な保存状態があれば自動でシェアフローを開始する
  - 有効期限切れの場合はクリアしてシェアフローを継続しない
  - シェア完了またはキャンセル時にPendingShareStorage.clear()を呼び出す
  - _Requirements: 2.3, 2.8, 2.9, 2.10_

- [x] 6.4 シェア結果通知機能を実装する
  - useMessageQueueを使用してトースト通知を表示する
  - シェア成功時は「シェアしました！」を表示する
  - エラー時はエラーメッセージを表示する
  - キャンセル時は通知を表示せず元の画面に戻る
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. UIコンポーネントの実装
- [x] 7.1 ShareButtonsコンポーネントを実装する
  - 「LINEでシェア」ボタンをLINEブランドカラー（#06C755）で表示する
  - 「その他でシェア」ボタンを表示する
  - Web Share API非対応時は「その他でシェア」ボタンを非表示にする
  - タップしやすいサイズ（最小44x44px）を確保する
  - isShareReady === false または isSharing === true 時にdisabled状態にする
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 3.4_

- [x] 7.2 GameResultPanelコンポーネントを実装する
  - ゲーム終了時（gameStatus.type === 'finished'）のみレンダリングする
  - 勝敗表示とスコア表示のUIを提供する
  - 勝敗テキストはユーザー視点（「あなたの勝ち!」「AIの勝ち!」「引き分け」）を使用する
  - 「新しいゲームを開始」ボタンとシェアボタンを横並びで配置する
  - useShareフックを使用しシェア状態をカプセル化する
  - useEffectでマウント時にprepareShareImageを自動呼び出しする
  - ShareButtons、ShareImagePreviewを子コンポーネントとして統合する
  - _Requirements: 1.1, 1.2, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 8.1_

- [x] 8. GameBoardへの統合
- [x] 8.1 GameBoardにGameResultPanelを統合する
  - gameStatus.type === 'finished' 条件でGameResultPanelをレンダリングする
  - 既存のゲーム終了画面のUIをGameResultPanelに移行する
  - GameResultPanelに必要なprops（board, blackCount, whiteCount, winner, onReset）を渡す
  - _Requirements: 1.1, 1.2, 7.1, 7.2, 7.3, 7.4_

- [x] 9. html2canvas依存関係の追加
- [x] 9.1 html2canvasパッケージをインストールする
  - pnpm add html2canvas でパッケージを追加する
  - 型定義が含まれているか確認し、必要であれば@types/html2canvasを追加する
  - _Requirements: 4.1_

- [ ] 10. テストの実装
- [ ] 10.1 PendingShareStorageのユニットテストを実装する
  - save/load/clear操作の正確性を検証する
  - isExpired関数の有効期限判定ロジックを検証する
  - sessionStorage非対応環境でのフォールバック動作を検証する
  - _Requirements: 2.8, 2.9, 2.10_

- [ ] 10.2 FlexMessageBuilderのユニットテストを実装する
  - buildShareFlexMessage関数が正しいFlex Message構造を生成することを検証する
  - 各勝敗パターン（黒勝利、白勝利、引き分け）でのメッセージ内容を検証する
  - _Requirements: 2.4, 2.5, 2.6, 2.7_

- [ ] 10.3 ShareServiceのユニットテストを実装する
  - buildShareText関数が勝敗・スコアに応じたテキストを生成することを検証する
  - 各シェア方法（LINE、Web Share）の呼び出しフローを検証する
  - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4_

- [x] 10.4 useShareフックのユニットテストを実装する
  - 状態遷移（idle → preparing → ready → sharing）を検証する
  - ログイン状態に応じたシェアフロー分岐を検証する
  - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3_

- [ ] 10.5 ShareImageGeneratorの統合テストを実装する
  - html2canvasによる画像生成が正常に動作することを検証する
  - _Requirements: 4.1, 8.1_

- [ ] 10.6 E2Eテスト状態注入ヘルパーを実装する
  - e2e/helpers/game-state-injection.ts を作成し、injectGameEndState() 関数を実装する
  - e2e/helpers/test-fixtures.ts にテスト用ゲーム状態定数（終了盤面、各勝敗パターン）を定義する
  - _Requirements: 8.1_

- [ ] 10.7 ゲーム終了状態E2Eテストを実装する
  - e2e/game-end-state.spec.ts を作成し、状態注入によるシェア機能テストを実装する
  - ゲーム終了（黒勝ち/白勝ち/引き分け）各パターンでシェアボタン表示を検証する
  - Web Share非対応環境で「その他でシェア」ボタンが非表示になることを検証する
  - シェアボタンのクリック動作を検証する
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4_

---

## Requirements Coverage

| Requirement | Task(s)                   |
| ----------- | ------------------------- |
| 1.1         | 7.1, 7.2, 8.1, 10.7       |
| 1.2         | 7.2, 8.1                  |
| 1.3         | 7.1                       |
| 1.4         | 7.1                       |
| 1.5         | 7.1, 10.7                 |
| 2.1         | 5.1, 6.1, 6.2, 10.4, 10.7 |
| 2.2         | 6.1, 6.2, 10.4, 10.7      |
| 2.3         | 6.2, 6.3, 10.4, 10.7      |
| 2.4         | 4.2, 5.1, 10.2            |
| 2.5         | 4.2, 10.2                 |
| 2.6         | 4.2, 10.2                 |
| 2.7         | 4.2, 10.2                 |
| 2.8         | 1.1, 1.2, 6.3, 10.1       |
| 2.9         | 1.2, 6.3, 10.1            |
| 2.10        | 1.2, 6.3, 10.1            |
| 3.1         | 5.1, 6.1, 6.2, 10.3       |
| 3.2         | 5.1, 10.3                 |
| 3.3         | 5.1, 10.3                 |
| 3.4         | 6.1, 7.1                  |
| 4.1         | 1.1, 2.2, 5.1, 9.1, 10.5  |
| 4.2         | 2.1, 7.2                  |
| 4.3         | 2.1, 7.2                  |
| 4.4         | 2.1, 7.2                  |
| 4.5         | 2.1, 7.2                  |
| 4.6         | 2.3, 3.1, 5.1             |
| 5.1         | 4.1, 10.3                 |
| 5.2         | 4.1, 10.3                 |
| 5.3         | 4.1, 10.3                 |
| 5.4         | 4.1, 10.3                 |
| 6.1         | 6.4, 7.2                  |
| 6.2         | 6.4, 7.2                  |
| 6.3         | 6.4, 7.2                  |
| 7.1         | 8.1, 10.7                 |
| 7.2         | 8.1, 10.7                 |
| 7.3         | 8.1, 10.7                 |
| 7.4         | 8.1, 10.7                 |
| 8.1         | 2.2, 7.2, 10.5, 10.6      |
| 8.2         | 2.3, 3.1                  |
