# Requirements Document

## Project Description (Input)

E2Eテスト再構築 - Playwrightを使用したLINE miniappリバーシゲームの基本動作・表示確認テスト。スコープ: (1)初期盤面表示 (2)石配置・反転 (3)ターン切替 (4)無効な手への対応 (5)AI対戦(2往復)。対象外: VRT、LINE連携、パス機能、ゲーム終了・リセット。環境: モバイルのみ、GitHub Actions CI対応、AIエージェント向けレポーター形式(line/github)。ファイル構成: 単一ファイル(game-basic.spec.ts)に集約。

事前に準備した[初期的な要求・要件ドキュメント](pre-prepared-requirements.md)を参考にしてください。

## Introduction

本ドキュメントは、LINE miniappリバーシゲームのE2Eテスト再構築に関する要件を定義する。Playwrightを使用してゲームの基本動作と表示を検証し、品質保証の基盤を確立することを目的とする。対象はモバイルデバイスのみとし、GitHub Actions CIでの自動実行に対応する。

### スコープ

**対象（IN）:**

- Playwrightを使用したE2Eテスト
- モバイルデバイス（Chrome・Safari）
- ゲーム体験の基本動作・表示確認
- GitHub Actions CI対応
- AIコーディングエージェントが結果確認可能なレポーター形式

**対象外（OUT）:**

- VRT（Visual Regression Testing）
- LINE連携（LIFF）テスト
- デスクトップブラウザ
- パス機能
- ゲーム終了・リセット機能

## Requirements

### Requirement 1: 初期盤面表示

**Objective:** As a テストエンジニア, I want ゲーム開始時に正しい初期盤面が表示されることを検証する, so that 初期状態の品質を保証できる

#### Acceptance Criteria

1. When ユーザーがアプリを開く, the E2Eテスト shall 8x8のゲームボードが表示されることを検証する
2. When ゲームが初期化される, the E2Eテスト shall 初期4石（黒2、白2）が中央の正しい位置に配置されていることを検証する
3. When ゲームが開始される, the E2Eテスト shall 有効な手のヒント（黄色パルス）が表示されることを検証する
4. When ゲームが開始される, the E2Eテスト shall ターン表示が「あなたのターン」になっていることを検証する

### Requirement 2: 石配置・反転

**Objective:** As a テストエンジニア, I want 有効なマスへの石配置と相手石の反転が正常に動作することを検証する, so that コアゲームロジックの品質を保証できる

#### Acceptance Criteria

1. When ユーザーが有効な手のマスをタップする, the E2Eテスト shall 選択したマスに石が配置されることを検証する
2. When 石が配置される, the E2Eテスト shall 挟まれた相手の石が自分の色に反転することを検証する
3. When 石が配置される, the E2Eテスト shall 石数カウント表示が正しく更新されることを検証する

### Requirement 3: ターン切替

**Objective:** As a テストエンジニア, I want プレイヤーとAI間のターン切替が正常に動作することを検証する, so that ゲームフローの品質を保証できる

#### Acceptance Criteria

1. When プレイヤーが石を置く, the E2Eテスト shall ターン表示が「AIのターン」に変わることを検証する
2. When AIが応手を完了する, the E2Eテスト shall ターン表示が「あなたのターン」に戻ることを検証する
3. While プレイヤーのターン中, the E2Eテスト shall 有効な手のヒントが表示されていることを検証する
4. While AIのターン中, the E2Eテスト shall 有効な手のヒントが非表示であることを検証する

### Requirement 4: 無効な手への対応

**Objective:** As a テストエンジニア, I want 無効なマスをタップした際のエラー処理が正常に動作することを検証する, so that ユーザーへの適切なフィードバックの品質を保証できる

#### Acceptance Criteria

1. If 既に石があるマスをタップする, then the E2Eテスト shall エラーメッセージが表示されることを検証する
2. If 石を反転できないマスをタップする, then the E2Eテスト shall エラーメッセージが表示されることを検証する
3. When 無効な手のエラーが表示された後, the E2Eテスト shall ゲームが継続可能であること（有効な手が打てること）を検証する

### Requirement 5: AI対戦（2往復）

**Objective:** As a テストエンジニア, I want プレイヤーとAIの交互対戦が正常に動作することを検証する, so that ゲーム進行の品質を保証できる

#### Acceptance Criteria

1. When プレイヤーが1手目を打つ, the E2Eテスト shall AIが応手することを検証する
2. When AIが1手目の応手を完了する, the E2Eテスト shall プレイヤーが2手目を打てることを検証する
3. When プレイヤーが2手目を打つ, the E2Eテスト shall AIが2手目の応手を完了することを検証する
4. While AIが思考中, the E2Eテスト shall AI思考中表示が表示されることを検証する
5. When AIが応手する, the E2Eテスト shall 3秒以内に応手が完了することを検証する

### Requirement 6: テスト実行環境

**Objective:** As a 開発者, I want テストが適切な環境で実行されることを確認する, so that 安定した品質ゲートを運用できる

#### Acceptance Criteria

1. The Playwrightテスト shall モバイルデバイスプロファイル（Chrome・Safari）でのみ実行される
2. The Playwrightテスト shall data-testid属性を使用して要素を安定的に特定する
3. While ローカル環境で実行する場合, the Playwrightテスト shall lineレポーター形式で結果を出力する
4. While GitHub Actions CI環境で実行する場合, the Playwrightテスト shall githubレポーター形式で結果を出力する
5. If テストが失敗した場合, then the Playwrightテスト shall スクリーンショットをアーティファクトとして保存する
6. The Playwrightテスト shall 単一ファイル（game-basic.spec.ts）に全テストを集約する

### Requirement 7: 既存テストのクリーンアップ

**Objective:** As a 開発者, I want 既存のE2Eテストを削除して新構成に移行する, so that シンプルで保守しやすいテスト構成を実現できる

#### Acceptance Criteria

1. The E2Eテスト再構築 shall e2eディレクトリ内の既存specファイルを全て削除する
2. The playwright.config.ts shall モバイルプロジェクトのみの設定に更新される
3. The playwright.config.ts shall デスクトッププロジェクト設定を削除する
