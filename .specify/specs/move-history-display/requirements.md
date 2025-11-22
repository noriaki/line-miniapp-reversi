# Requirements Document

## Project Description (Input)

打った手の履歴(棋譜)をシンプルに表示する機能追加

指した手の表示方法(1手をどこに打ったかの表現)としては、 `[a-h][1-8]` のように、[a-h]が盤面の列、[1-8]が盤面の行を表します。
たとえば、 `c7` の表示は、3列目(c)の7行目(7)に打ったことを示します。

打った手の履歴(棋譜)は上記1手の表示を黒白黒・・・の順で1手目から単純に文字列連結します。
例えば、1手目 `e6` , 2手目 `f6` , 3手目 `f5` なら、ここまでの棋譜は `e6f6f5` です。

UIとしては凝った表現は不要で画面の下部に目立たないようにテキストそのまま表示でかまいません。
盤面が更新されたら棋譜も更新されます。このとき単一の同じ棋譜文字列を更新するようにします。
※1手指すと1行増えたりせず棋譜文字列が単に伸びていく

## Requirements

### Requirement 1: 着手記法変換

**Objective:** As a ゲームシステム, I want 盤面座標を棋譜記法に変換する, so that 着手履歴を標準的な形式で記録・表示できる

#### Acceptance Criteria

1. WHEN 着手位置(row, col)を受け取る THEN Game System SHALL その位置を`[a-h][1-8]`形式の文字列に変換する
2. IF 列インデックスが0の場合 THEN Game System SHALL 列を`a`に変換する
3. IF 列インデックスが7の場合 THEN Game System SHALL 列を`h`に変換する
4. IF 行インデックスが0の場合 THEN Game System SHALL 行を`1`に変換する
5. IF 行インデックスが7の場合 THEN Game System SHALL 行を`8`に変換する
6. WHEN 列インデックス2、行インデックス6の着手を変換する THEN Game System SHALL `c7`を返す

### Requirement 2: 棋譜履歴管理

**Objective:** As a ゲーム状態管理, I want 全ての着手を順番に記録する, so that ゲーム進行の完全な履歴を保持できる

#### Acceptance Criteria

1. WHEN 新しいゲームが開始される THEN Game State SHALL 空の棋譜履歴を初期化する
2. WHEN プレイヤーが有効な手を打つ THEN Game State SHALL その手を棋譜記法に変換して履歴に追加する
3. WHEN AIが有効な手を打つ THEN Game State SHALL その手を棋譜記法に変換して履歴に追加する
4. WHEN 棋譜履歴が更新される THEN Game State SHALL 全ての手を打った順序で保持する
5. IF ゲームが1手目`e6`, 2手目`f6`, 3手目`f5`と進行した場合 THEN Game State SHALL 棋譜履歴として`["e6", "f6", "f5"]`を保持する

### Requirement 3: 棋譜文字列生成

**Objective:** As a 棋譜表示機能, I want 履歴を連結した単一文字列を生成する, so that シンプルな形式で棋譜全体を表現できる

#### Acceptance Criteria

1. WHEN 棋譜履歴が空の場合 THEN Move History System SHALL 空文字列を返す
2. WHEN 棋譜履歴に1手以上含まれる場合 THEN Move History System SHALL 全ての手を順番に連結した文字列を生成する
3. IF 棋譜履歴が`["e6", "f6", "f5"]`の場合 THEN Move History System SHALL `e6f6f5`を返す
4. WHEN 新しい手が追加される THEN Move History System SHALL 既存の棋譜文字列に新しい手を追加した文字列を生成する
5. WHEN 棋譜文字列を生成する THEN Move History System SHALL 区切り文字やスペースを含めずに連結する

### Requirement 4: 棋譜表示UI

**Objective:** As a プレイヤー, I want 現在の棋譜を画面で確認できる, so that ゲーム進行を把握できる

#### Acceptance Criteria

1. WHERE ゲーム画面 THE Game Board Component SHALL 画面下部に棋譜表示領域を配置する
2. WHEN 棋譜表示領域を表示する THEN Game Board Component SHALL テキストのみのシンプルな表示を使用する
3. WHEN 棋譜表示領域を表示する THEN Game Board Component SHALL 目立たない控えめなスタイルを適用する
4. WHEN 新しい手が打たれる THEN Game Board Component SHALL 表示中の棋譜文字列を更新する
5. WHEN 棋譜文字列が更新される THEN Game Board Component SHALL 同じ表示領域のテキストを更新する(新しい行を追加しない)
6. WHEN 棋譜が長くなり表示領域を超える THEN Game Board Component SHALL 横スクロール可能にする
7. IF ゲームが進行中で棋譜が`e6f6f5d6`の場合 THEN Game Board Component SHALL 画面下部に`e6f6f5d6`をテキストとして表示する

### Requirement 5: ゲーム状態との統合

**Objective:** As a ゲームシステム, I want 棋譜管理をゲーム状態と統合する, so that 着手と棋譜が常に同期する

#### Acceptance Criteria

1. WHEN ゲーム状態が初期化される THEN Game State SHALL 棋譜履歴を空で初期化する
2. WHEN 有効な手が盤面に適用される THEN Game State SHALL その手を棋譜履歴に追加する
3. WHEN ゲームがリセットされる THEN Game State SHALL 棋譜履歴をクリアする
4. WHEN ゲーム状態が更新される THEN Game State SHALL 最新の棋譜文字列を提供する
5. IF 盤面の手数と棋譜履歴の手数が一致しない THEN Game State SHALL エラーを検出する

### Requirement 6: 型安全性とテスタビリティ

**Objective:** As a 開発者, I want 棋譜機能が型安全でテスト可能である, so that 保守性と品質を確保できる

#### Acceptance Criteria

1. WHEN 棋譜関連の関数を実装する THEN Move History System SHALL TypeScript strict modeに準拠する
2. WHEN Position型を受け取る THEN Move History System SHALL 型安全な変換関数を使用する
3. WHEN 棋譜履歴を扱う THEN Move History System SHALL immutableパターンで実装する
4. WHEN 棋譜変換ロジックを実装する THEN Move History System SHALL Pure Functionsとして実装する
5. WHEN 棋譜機能を実装する THEN Move History System SHALL 90%以上のテストカバレッジを達成する
6. WHEN 単体テストを作成する THEN Move History System SHALL 全ての座標変換パターンをテストする
