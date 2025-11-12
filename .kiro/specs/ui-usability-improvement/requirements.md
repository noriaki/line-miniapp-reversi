# Requirements Document

## Project Description (Input)

ユーザビリティ改善: 棋譜表示の視覚的非表示化とメッセージ表示体験の改善

## 概要

ゲームボードのユーザビリティを向上させるため、以下の2つの改善を実施する:

### 1. 棋譜表示の視覚的非表示化

- 盤面下部の棋譜 (例: 'c4f5e3') は現状デバッグ用のためユーザから見えないようにする
- 要素自体は残してPlaywrightからは読み取れるようにする (data-testid='move-history' を保持)
- 実装箇所: GameBoard.tsx の #history 要素 (484-495行目)

### 2. メッセージ表示体験の改善

盤面上部のパス通知メッセージ (GameBoard.tsx 321-325行目) について以下を改善:

#### 2.1 Cumulative Layout Shift (CLS) の防止

- メッセージの表示/非表示時に後続要素がズレることを防止
- 現状: メッセージ要素が条件付きレンダリングされるため、表示/非表示でレイアウトシフトが発生
- 目標: メッセージ領域の高さを固定し、opacity/visibility で表示切替を行う

#### 2.2 表示時間の最適化

- 現在の表示時間 (3秒) が短すぎるため、5秒に変更
- 最適な表示時間: 5秒 (Requirementsフェーズで意思決定済み)
- 実装箇所: useGameErrorHandler.ts の auto-clear timer (128行目)

## 技術的背景

- React + TypeScript プロジェクト
- Tailwind CSS でスタイリング
- 現在のメッセージ実装: useGameErrorHandler フック
- 現在の棋譜実装: move-history.ts ライブラリ

## Requirements

### Requirement 1: 棋譜表示の視覚的非表示化

**Objective:** デバッグ・テスト担当者として、E2Eテストで棋譜を検証できる状態を維持しながら、一般ユーザには棋譜を表示しないようにしたい。これにより、デバッグ用情報を一般ユーザから隠し、ゲーム画面のシンプルさを保つことができる。

#### Acceptance Criteria

1. WHERE GameBoard コンポーネントが描画される THE GameBoard コンポーネント SHALL 棋譜要素(data-testid='move-history')をDOM内に保持する
2. WHERE GameBoard コンポーネントが描画される THE GameBoard コンポーネント SHALL 棋譜要素にCSSスタイルを適用して視覚的に非表示にする
3. WHEN Playwright E2Eテストが棋譜要素にアクセスする THEN GameBoard コンポーネント SHALL data-testid='move-history'属性を通じて棋譜テキストを提供する
4. WHERE ブラウザに表示されている THE 棋譜要素 SHALL ユーザの視覚から完全に隠蔽される(画面外配置、透明度ゼロ、または視覚的に見えない状態)
5. WHERE スクリーンリーダーがページを読み上げる THE 棋譜要素 SHALL アクセシビリティツリーから除外される(aria-hidden="true"等)

### Requirement 2: メッセージ表示領域のレイアウトシフト防止

**Objective:** ゲームプレイヤーとして、パス通知メッセージが表示・非表示される際に、ゲームボードや他のUI要素が上下に移動せず、視覚的に安定した画面で快適にプレイしたい。これにより、Cumulative Layout Shift(CLS)を最小化し、ユーザ体験を向上させる。

#### Acceptance Criteria

1. WHERE GameBoard コンポーネントが初期化される THE GameBoard コンポーネント SHALL メッセージ表示領域の高さを固定サイズで確保する
2. WHEN メッセージが表示される THEN GameBoard コンポーネント SHALL opacity または visibility プロパティを使用してメッセージを表示する
3. WHEN メッセージが非表示になる THEN GameBoard コンポーネント SHALL opacity または visibility プロパティを使用してメッセージを非表示にする
4. WHILE メッセージ表示状態が変化する THE GameBoard コンポーネント SHALL メッセージ領域の高さを変更しない
5. WHILE メッセージ表示状態が変化する THE ゲームボード要素および後続のUI要素 SHALL 位置を移動させない
6. WHERE メッセージ表示領域が実装される THE GameBoard コンポーネント SHALL 固定高さの実装にTailwind CSSを使用する

### Requirement 3: メッセージ表示時間の最適化

**Objective:** ゲームプレイヤーとして、パス通知メッセージを十分な時間で読み取れるようにし、情報を見逃さずゲーム状況を理解したい。これにより、メッセージが短すぎて読めない問題を解消する。

#### Acceptance Criteria

1. WHERE useGameErrorHandler フックが実装される THE useGameErrorHandler フック SHALL メッセージ自動消去タイマーの時間を5秒に設定する
2. WHERE メッセージが表示される THE useGameErrorHandler フック SHALL 5秒経過後に自動的にメッセージをクリアする
3. IF ユーザが新しいメッセージが表示される前に別のアクションを実行した THEN useGameErrorHandler フック SHALL 前のメッセージタイマーをキャンセルし、新しいメッセージタイマーを開始する

### Requirement 4: 既存機能の保持

**Objective:** 開発者として、UI改善を実施する際に既存のゲーム機能、テスト、デバッグ機能が正常に動作し続けることを保証したい。これにより、リグレッション(機能退行)を防止する。

#### Acceptance Criteria

1. WHERE 棋譜表示の視覚的非表示化が実装される THE 棋譜生成ロジック(move-history.ts) SHALL 変更されない
2. WHERE メッセージ表示の改善が実装される THE メッセージ通知ロジック(useGameErrorHandler) SHALL エラーハンドリング機能を維持する
3. WHEN UI改善が完了する THEN 既存のPlaywright E2Eテスト SHALL すべて成功する
4. WHEN UI改善が完了する THEN 既存のJestユニットテスト SHALL すべて成功する
5. WHERE コンポーネントが変更される THE GameBoard コンポーネント SHALL data-testid属性を保持する
6. WHERE スタイリングが変更される THE GameBoard コンポーネント SHALL Tailwind CSSのみを使用する(CSS Modulesやインラインスタイルを追加しない)

### Requirement 5: クロスブラウザ互換性

**Objective:** 全てのユーザとして、使用するブラウザやデバイスに関わらず、改善されたUI体験を一貫して享受したい。

#### Acceptance Criteria

1. WHERE CSS視覚的非表示スタイルが適用される THE GameBoard コンポーネント SHALL モダンブラウザ(Chrome, Safari, Firefox, Edge)で一貫した非表示動作を提供する
2. WHERE opacity/visibility変更が実装される THE GameBoard コンポーネント SHALL モダンブラウザで一貫したメッセージ表示切替動作を提供する
3. WHEN LINEアプリ内ブラウザ(iOS WKWebView, Android WebView)で動作する THEN すべてのUI改善 SHALL 正常に機能する
4. WHERE Tailwind CSSクラスが使用される THE GameBoard コンポーネント SHALL ベンダープレフィックスを自動適用する(postcss/autoprefixer経由)
