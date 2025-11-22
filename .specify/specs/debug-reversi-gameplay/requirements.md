# Requirements Document

## Project Description (Input)

dev3000起動済みの状態でMCPを活用して「リバーシが1ゲーム正常に完璧にプレイできる」ようにデバッグします。
MCPから取得したUI状態から実際にブラウザを操作し、エラーメッセージを参考に臨機応変にデバッグします。まずは正常系を適切に最初から最後まで遊べることを目指します。

正常系としては、通常のリバーシのルールに基づいて1つのゲームプレイが最初から最後までエラー無く完了できることを目指します。
dev3000のMCPを活用した主要な流れは以下の通りです。

1. リバーシの盤面・ゲームの開始画面へアクセス
2. プレーヤーであるあなたとAIプレーヤーが交互に指しゲームを進める
3. 正常フローとして盤面がすべて石で埋まるまで進める
4. 両プレーヤーの石の数、勝敗、盤面のリセットが正常に表示される

今回のSpecでは、どのようなエラーが発生するのか、どのような挙動が起こるのか、といったことが予め予測できないため、詳細な事前設計よりも柔軟な対応方針を立てること、また試行錯誤したり多角的に仮説を立てて検証することを重視してRequirementやDesignを作成してください。

エラーや不正な挙動を発見するためには、dev3000のMCPが提供する統合されたLogとスクリーンショット撮影機能を活用し、必ず事実に基づいて判断します。
調査においても同様で、まずはMCPによる実際のログやデータを収集し、プロジェクトの実装コードなど事実を頼りにすることが最も大切です。またWeb検索も随時利用して構いません。
なお、AIプレーヤーの思考については、コンパイル済みのWebAssemblyである [ai.wasm](public/ai.wasm) およびそのGlueコードである [ai.js](public/ai.js) が担っています。
これらのファイルによるAIプレーヤーの挙動やインタフェースに関する情報は、 [WASMのソースコード解析ディレクトリ](.kiro/specs/line-reversi-miniapp/wasm-source-analysis) 内の解析レポートやインタフェース仕様ファイルや、実際の [ソースコードリポジトリの入ったディレクトリ](.analysis/egaroucid/src) 内のWebに関するファイルを確認してください。

エラーに際し、上記の情報収集の後、多角的に仮説を立て検証方法を考える際には高度な思考 ultrathink が必要になりますので、あなた(Claude Code)は `Opus` モデルを利活用しても構いません。
その後、実際に仮説を検証する行程など「仮説を立て検証方法を考える」以外では `Sonnet` モデルを利用します。

挙げた仮説については、本Specの `tasks.md` に検証手順を常に記載し、検証が済んだものについてはタスク完了のマークを付け必要十分でシンプルな結果サマリをタスク内に追記してください。これは別の検証過程で同一のバグを再発させるデグレーションを起こさないようにするリグレッションのためにも有用だと考えます。

また、一つの仮説を検証する毎に以下の情報を含むコミットを作成しコード変更のチェックポイントとしてください。

- どのようなエラーに遭遇したか
- 何を調査し、どのような要因だと仮説を立てたか
- 仮説に対する検証方法をどのように定義したか
- 実際に何を変更し、検証した結果はどうだったのか

## Requirements

### Introduction

本要件書は、dev3000を活用したリバーシゲームのデバッグ機能の要件を定義します。MCPを通じてゲームの状態を取得し、実際のブラウザを操作しながら、リバーシの1ゲームが正常に完遂できるようにデバッグを行うための要件を記載します。

本機能は探索的デバッグアプローチを重視し、事前に全てのバグを予測することなく、実際のゲームプレイを通じて問題を発見・修正していく柔軟な開発プロセスを実現します。

### Requirement 1: dev3000統合とMCP活用

**Objective:** As a 開発者, I want dev3000のMCPを通じてゲーム状態を監視できる, so that リアルタイムでゲームの動作を確認し問題を特定できる

#### Acceptance Criteria (Requirement 1)

1. WHEN dev3000が起動済み THEN Debug System SHALL MCPサーバーとの通信を確立する
2. WHEN ゲーム画面がアクセスされる THEN Debug System SHALL ブラウザのUI状態を取得する
3. WHEN エラーが発生する THEN Debug System SHALL 統合ログとスクリーンショットを自動的に記録する
4. WHILE デバッグセッションが進行中 THE Debug System SHALL タイムライン形式でイベントを記録し続ける
5. WHERE MCPインタフェースが利用可能 THE Debug System SHALL ブラウザのコンソールログ、ネットワークリクエスト、DOM状態を収集する

### Requirement 2: リバーシゲームプレイ完遂

**Objective:** As a 開発者, I want リバーシの1ゲームを正常に完遂させる, so that ゲームの正常系フローが問題なく動作することを確認できる

#### Acceptance Criteria (Requirement 2)

1. WHEN ゲーム開始画面にアクセスする THEN Game System SHALL 初期盤面（黒白各2石の配置）を正しく表示する
2. WHEN プレーヤーが有効な手を打つ THEN Game System SHALL 石を配置し適切に反転処理を実行する
3. WHEN AIの手番になる THEN AI System SHALL WebAssembly（ai.wasm）を使用して有効な手を計算し石を配置する
4. WHEN 石の配置により反転可能な石がある THEN Game System SHALL 全ての該当する石を正しく反転する
5. WHILE ゲームが進行中 THE Game System SHALL 現在の手番プレーヤーを明確に表示する
6. IF 有効な手が存在しない THEN Game System SHALL パスを実行し相手に手番を移す
7. WHEN 盤面が全て埋まる OR 両プレーヤーとも有効な手がない THEN Game System SHALL ゲームを終了する
8. WHERE ゲームが終了した THE Game System SHALL 両プレーヤーの石数、勝敗結果、盤面リセットオプションを表示する

### Requirement 3: エラー検出と仮説検証

**Objective:** As a 開発者, I want エラーを検出し仮説を立てて検証できる, so that 効率的にバグを特定し修正できる

#### Acceptance Criteria (Requirement 3)

1. WHEN エラーが検出される THEN Debug System SHALL エラーメッセージ、スタックトレース、発生箇所を記録する
2. WHEN エラーパターンが特定される THEN Debug System SHALL tasks.mdに仮説と検証手順を記載する
3. IF 仮説検証が必要 AND 複雑な思考が必要 THEN Debug System SHALL Opusモデルを活用して分析を行う
4. IF 仮説検証が実行段階 THEN Debug System SHALL Sonnetモデルを使用して検証を実施する
5. WHERE 仮説検証が完了した THE Debug System SHALL tasks.md内に検証結果のサマリーを追記する
6. WHEN コード変更が行われる THEN Debug System SHALL エラー内容、仮説、検証方法、変更内容を含むコミットを作成する

### Requirement 4: AIプレーヤー動作検証

**Objective:** As a 開発者, I want AIプレーヤーの動作を検証できる, so that WebAssemblyベースのAIが正しく機能することを確認できる

#### Acceptance Criteria (Requirement 4)

1. WHEN AIプレーヤーの手番になる THEN AI System SHALL ai.wasmを通じて有効な手を計算する
2. IF ai.wasmの処理に問題がある THEN Debug System SHALL ai.jsのGlueコードとのインタフェースを検証する
3. WHERE WebAssemblyのインタフェース情報が必要 THE Debug System SHALL wasm-source-analysisディレクトリの解析レポートを参照する
4. WHEN AIの計算結果が返される THEN Game System SHALL 返された手が有効であることを検証する
5. IF AIが無効な手を返す THEN Debug System SHALL エラーログを記録し詳細な分析を行う
6. WHERE Egaroucidソースコードの確認が必要 THE Debug System SHALL .analysis/egaroucid/srcディレクトリのWebファイルを参照する

### Requirement 5: デバッグプロセス追跡

**Objective:** As a 開発者, I want デバッグの進捗と履歴を追跡できる, so that リグレッション防止と知識の蓄積ができる

#### Acceptance Criteria (Requirement 5)

1. WHEN デバッグセッションが開始される THEN Debug System SHALL 新しいタスクをtasks.mdに作成する
2. WHILE 検証が進行中 THE Debug System SHALL 各検証手順の状態をtasks.md内で更新する
3. WHEN 検証が完了する THEN Debug System SHALL タスクを完了マークし、結果サマリーを追記する
4. WHERE 同じバグが再発する可能性がある THE Debug System SHALL 過去の検証履歴を参照してリグレッション防止を行う
5. WHEN 複数の仮説が存在する THEN Debug System SHALL 各仮説を独立したタスクとして管理する

### Requirement 6: 情報収集と分析

**Objective:** As a 開発者, I want 多角的な情報源から問題を分析できる, so that 根本原因を効率的に特定できる

#### Acceptance Criteria (Requirement 6)

1. WHEN 調査が必要になる THEN Debug System SHALL MCPによる実際のログとデータを最優先で収集する
2. WHERE プロジェクトの実装確認が必要 THE Debug System SHALL ソースコードを事実ベースで分析する
3. IF 外部情報が必要 THEN Debug System SHALL Web検索を活用して関連情報を収集する
4. WHEN dev3000のログが利用可能 THEN Debug System SHALL Timeline Dashboard (http://localhost:3684/logs)で統合イベントを確認する
5. WHERE ブラウザの詳細情報が必要 THE Debug System SHALL Playwrightによる自動監視データを活用する

### Requirement 7: コード変更管理

**Objective:** As a 開発者, I want コード変更を体系的に管理できる, so that デバッグの履歴と修正内容を追跡できる

#### Acceptance Criteria (Requirement 7)

1. WHEN 仮説検証が完了する THEN Debug System SHALL 検証結果を含むコミットを作成する
2. WHERE コミットメッセージが作成される THE Debug System SHALL エラー内容、仮説、検証方法、変更内容を含める
3. WHEN 複数の修正が行われる THEN Debug System SHALL 各検証のチェックポイントとして個別にコミットする
4. IF デグレーションのリスクがある THEN Debug System SHALL 過去の修正履歴を確認し影響を評価する
5. WHERE 修正が成功した THE Debug System SHALL 修正内容をtasks.mdに記録し将来の参照を可能にする

### Requirement 8: 探索的デバッグ戦略

**Objective:** As a 開発者, I want 柔軟な探索的デバッグアプローチを実践できる, so that 予測できない問題にも対応できる

#### Acceptance Criteria (Requirement 8)

1. WHEN 予期しないエラーが発生する THEN Debug System SHALL 詳細な事前設計より柔軟な対応を優先する
2. WHERE 問題の原因が不明 THE Debug System SHALL 試行錯誤と多角的な仮説立案を行う
3. WHEN 新しい問題パターンが発見される THEN Debug System SHALL 既存の仮説を更新し新たな検証方法を定義する
4. IF 複雑な問題分析が必要 THEN Debug System SHALL Opusモデル（ultrathink）を活用する
5. WHERE 初期調査が必要 THE Debug System SHALL MCPとスクリーンショットによる事実収集から開始する

## Summary

本要件書は、dev3000とMCPを活用したリバーシゲームの探索的デバッグプロセスを定義しています。柔軟な仮説検証アプローチ、体系的な進捗管理、多角的な情報収集を通じて、ゲームの正常系フローが完全に動作することを目指します。
