# Requirements Document

## Project Description (Input)

LINEミニアプリで遊べるリバーシゲームを開発します。

標準的なNext.jsアプリです。
プレーヤーはLINEミニアプリを操作するユーザ対AIです。

AIはリバーシアルゴリズムが実装されたファイル[ai.wasm](./resources/ai.wasm)を利用します。
ai.wasmの呼び出し方はサンプルファイル[ai.js](./resources/ai.js)を参照し、ai.jsの内容を解析してwasm用のインタフェースを構築してください。
なお、ai.jsはファイルサイズが大きくトークン数が制限を超過する可能性があります。その場合は `Explore` subagentを使用してファイル内容を理解してください。

UIはスマートフォンに特化し、初期表示はSSGで対応します。リバーシゲームの動作は動的ですのでクライアント側で対応します。
サーバ側の実装とクライアント側の実装はディレクトリ構造やファイルを明確に分離して混ざらないようにしてください。
最初はできるだけシンプルな実装とし、将来的な拡張性は全く不要です。

## Introduction

本仕様書は、LINEミニアプリプラットフォーム上で動作するリバーシゲームアプリケーションの要求仕様を定義します。本アプリケーションは、Next.jsフレームワークを使用して構築され、ユーザとAIが対戦するシンプルなゲーム体験を提供します。

本要求仕様は、ゲームロジック、UI/UX、AIとの統合、アーキテクチャの分離という4つの主要領域をカバーしています。

## Requirements

### Requirement 1: ゲームボード表示と初期化

**Objective:** ユーザとして、リバーシゲームのボードを表示して初期状態からゲームを開始できるようにしたい。そうすることで、スムーズにゲームをプレイできる。

#### Acceptance Criteria

1. WHEN ユーザがアプリケーションにアクセスする THEN Reversi App SHALL 8×8のゲームボードを表示する
2. WHEN ゲームが開始される THEN Reversi App SHALL ボード中央に黒石2個と白石2個を初期配置で表示する
3. WHEN ゲームが開始される THEN Reversi App SHALL 黒石（ユーザ）の先攻でゲームを開始する
4. WHERE 初期表示画面 THE Reversi App SHALL SSG（Static Site Generation）により生成されたHTMLを提供する
5. WHEN ゲームボードが表示される THEN Reversi App SHALL スマートフォン画面に最適化されたレイアウトで表示する

### Requirement 2: 石の配置とゲームロジック

**Objective:** ユーザとして、リバーシのルールに従って石を配置し、正しいゲームロジックで動作することを期待する。そうすることで、公正なゲーム体験が得られる。

#### Acceptance Criteria

1. WHEN ユーザが空きマスをタップする AND そのマスが有効な手である THEN Reversi App SHALL 黒石を配置し、挟まれた白石を黒石に反転する
2. WHEN ユーザが空きマスをタップする AND そのマスが無効な手である THEN Reversi App SHALL 石を配置せず、視覚的なフィードバックを表示する
3. WHEN ユーザのターンである THEN Reversi App SHALL 配置可能な全ての有効なマスを視覚的に示す
4. WHEN ユーザに有効な手が存在しない THEN Reversi App SHALL ユーザのターンをスキップし、AIのターンに移行する
5. WHEN ゲームボードが全て埋まる OR 両プレイヤーに有効な手がなくなる THEN Reversi App SHALL ゲームを終了し、勝敗を判定する
6. WHEN ゲーム終了時 THEN Reversi App SHALL 黒石と白石の数をカウントし、多い方を勝者として表示する

### Requirement 3: AI対戦機能

**Objective:** ユーザとして、AIと対戦できるようにしたい。そうすることで、一人でもゲームを楽しむことができる。

#### Acceptance Criteria

1. WHEN ユーザが石を配置してターンが終了する THEN Reversi App SHALL AI（白石）のターンを開始する
2. WHEN AIのターンが開始される THEN Reversi App SHALL ai.wasmファイルを呼び出してAIの次の手を計算する
3. WHEN AIが次の手を決定する THEN Reversi App SHALL 現在のボード状態をai.wasmに渡す
4. WHEN ai.wasmから結果を受け取る THEN Reversi App SHALL AIの石を指定された位置に配置し、挟まれた石を反転する
5. WHILE AIが思考中である THE Reversi App SHALL ローディングインジケーターまたは視覚的なフィードバックを表示する
6. WHEN AIに有効な手が存在しない THEN Reversi App SHALL AIのターンをスキップし、ユーザのターンに戻る

### Requirement 4: WebAssemblyインタフェース統合

**Objective:** 開発者として、ai.wasmとの通信インタフェースを正しく実装したい。そうすることで、AIロジックをアプリケーションに統合できる。

#### Acceptance Criteria

1. WHEN アプリケーションが初期化される THEN Reversi App SHALL ai.wasmファイルをロードして初期化する
2. WHEN ai.wasmとの通信が必要になる THEN Reversi App SHALL ai.jsのサンプルコードを参考にしたインタフェースを使用する
3. WHEN ai.wasmにボード状態を送信する THEN Reversi App SHALL 正しいデータ形式でボード状態をエンコードする
4. WHEN ai.wasmから応答を受信する THEN Reversi App SHALL 応答をデコードして次の手の座標を取得する
5. IF ai.wasmのロードまたは実行に失敗する THEN Reversi App SHALL エラーメッセージを表示し、適切にフォールバック処理を行う

### Requirement 5: クライアント/サーバ分離アーキテクチャ

**Objective:** 開発者として、クライアント側とサーバ側の実装を明確に分離したい。そうすることで、コードの保守性と可読性を向上させる。

#### Acceptance Criteria

1. WHERE プロジェクト構造 THE Reversi App SHALL サーバサイドコードとクライアントサイドコードを異なるディレクトリに配置する
2. WHERE クライアント側実装 THE Reversi App SHALL ゲームロジック、UI操作、AI呼び出しを含む
3. WHERE サーバ側実装 THE Reversi App SHALL 静的ページ生成のみを担当する
4. WHEN コンポーネントを作成する THEN Reversi App SHALL クライアントコンポーネントとサーバコンポーネントを明示的に区別する
5. WHERE ファイル構造 THE Reversi App SHALL サーバコードとクライアントコードが混在しないように構成する

### Requirement 6: ユーザインタフェースとユーザ体験

**Objective:** ユーザとして、直感的で使いやすいインタフェースでゲームを楽しみたい。そうすることで、快適なゲーム体験が得られる。

#### Acceptance Criteria

1. WHERE スマートフォン画面 THE Reversi App SHALL タッチ操作に最適化されたUIを提供する
2. WHEN ユーザがゲームボード上のマスをタップする THEN Reversi App SHALL 即座に視覚的なフィードバックを表示する
3. WHEN 石が配置される OR 石が反転される THEN Reversi App SHALL アニメーション効果を適用する
4. WHERE ゲーム画面 THE Reversi App SHALL 現在のターン（ユーザまたはAI）を明確に表示する
5. WHERE ゲーム画面 THE Reversi App SHALL 現在の石の数（黒石と白石）をリアルタイムで表示する
6. WHEN ゲームが終了する THEN Reversi App SHALL 勝敗結果と最終スコアを表示する
7. WHEN 結果画面が表示される THEN Reversi App SHALL 新しいゲームを開始するオプションを提供する

### Requirement 7: LINEミニアプリプラットフォーム統合

**Objective:** ユーザとして、LINEアプリ内でシームレスにゲームをプレイしたい。そうすることで、LINEの利便性を活用できる。

#### Acceptance Criteria

1. WHEN アプリケーションが起動する THEN Reversi App SHALL LINEミニアプリの環境で正常に動作する
2. WHERE LINEミニアプリ環境 THE Reversi App SHALL LINEプラットフォームのガイドラインに準拠する
3. WHERE LINEミニアプリ環境 THE Reversi App SHALL LINEアプリのUIと調和するデザインを採用する
4. WHEN ユーザがアプリケーションを開く THEN Reversi App SHALL LINE認証を活用してユーザセッションを管理する（必要に応じて）

### Requirement 8: パフォーマンスと最適化

**Objective:** ユーザとして、レスポンシブで快適に動作するアプリケーションを使用したい。そうすることで、ストレスなくゲームをプレイできる。

#### Acceptance Criteria

1. WHEN ユーザがアプリケーションにアクセスする THEN Reversi App SHALL 2秒以内に初期画面を表示する
2. WHEN ユーザが石を配置する THEN Reversi App SHALL 100ミリ秒以内にUI応答を開始する
3. WHEN AIが思考する THEN Reversi App SHALL 3秒以内に次の手を返す
4. WHERE スマートフォンデバイス THE Reversi App SHALL 主要なモバイルブラウザで正常に動作する
5. WHEN ゲームがプレイされる THEN Reversi App SHALL メモリリークなく安定して動作する

### Requirement 9: エラーハンドリングとフォールバック

**Objective:** ユーザとして、エラーが発生した場合でも適切にフィードバックを受け取りたい。そうすることで、問題を理解し対処できる。

#### Acceptance Criteria

1. IF ai.wasmのロードに失敗する THEN Reversi App SHALL エラーメッセージを表示し、ゲームを開始できない旨を通知する
2. IF 予期しないエラーが発生する THEN Reversi App SHALL ユーザに分かりやすいエラーメッセージを表示する
3. IF ネットワークエラーが発生する THEN Reversi App SHALL 適切なエラー処理を行い、ユーザに通知する
4. WHEN エラーが発生する THEN Reversi App SHALL アプリケーションをクラッシュさせずに継続動作を維持する
5. WHERE エラー発生時 THE Reversi App SHALL ユーザがゲームを再開またはリセットできるオプションを提供する
