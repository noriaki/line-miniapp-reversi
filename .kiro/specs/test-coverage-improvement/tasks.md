# 実装タスク

## タスク概要

本タスクリストは、Phase 1として高優先度3ファイル(`useAIPlayer.ts`, `WASMErrorHandler.tsx`, `wasm-loader.ts`)のテストカバレッジを90%以上に向上させるための実装計画である。全ての実装は既存コードに変更を加えず、テストコード追加のみで実施する。

**目標**:

- 各ファイルのカバレッジを90%以上に到達
- 全プロジェクト指標(Statements, Branches, Functions, Lines)で90%以上達成
- Web Worker・WebAssembly統合コンポーネントの信頼性保証

### 参考ドキュメント

- [01-priority-high.md](docs/test-coverage/01-priority-high.md)
- [04-implementation.md](docs/test-coverage/04-implementation.md)

本タスクのそれぞれが完了しチェックを付けるとき、上記の `04-implementation.md` の関連するチェックボックスにもチェックを付ける。

## 実装タスク

- [x] 1. テストインフラストラクチャの準備
  - Mock Workerクラスの実装準備として必要な型定義とユーティリティを設計
  - Jest環境でWeb Worker APIを模倣するための基本構造を構築
  - `postMessage`, `addEventListener`, `removeEventListener`, `terminate`メソッドの実装方針を確立
  - テストヘルパーメソッド(`simulateMessage`, `simulateDelay`, `simulateError`)の設計
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 1.1 Mock Workerクラスの実装
  - `__mocks__/worker-factory.ts`にMock Worker作成関数を実装
  - メッセージキューとイベントリスナー管理機能を実装
  - Worker終了状態のトラッキング機能を追加
  - テストシナリオごとにWorker挙動をカスタマイズ可能な構造を構築
  - _Requirements: 4.1, 4.2, 4.3, 4.7_

- [x] 1.2 Mock Emscripten Module setupの実装
  - Worker初期化ロジックを`worker-factory.ts`に分離してテスト可能性を確保
  - `import.meta.url`問題を回避するための設計実装
  - テスト環境でのモック化可能な構造を確立
  - `beforeEach`/`afterEach`でのモッククリーンアップパターンを確立
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 1.3 テストユーティリティの準備
  - 共通テストフィクスチャデータの定義(validBoard, emptyBoard, fullBoard)
  - エラーフィクスチャの準備(WASMLoadError, InitializationError各種)
  - Worker メッセージフィクスチャの作成(calculateBlack, calculateWhite, success, error)
  - タイミング制御用のJest fake timers設定パターンの確立
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. useAIPlayer.tsのテスト実装
  - フック初期化からクリーンアップまでの全ライフサイクルをテスト
  - Worker通信の正常系・異常系・タイムアウトパスを網羅
  - 非同期処理と状態遷移の正確性を検証
  - 並行操作とメモリリーク防止を確認
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2.1 Worker初期化とクリーンアップのテスト
  - Worker作成成功時の`workerRef.current`設定を検証
  - テスト環境(`NODE_ENV === 'test'`)での早期リターンを確認
  - Worker作成失敗時のcatchブロックとエラーログを検証
  - アンマウント時の`terminate()`呼び出しを確認
  - _Requirements: 1.1, 1.5_

- [x] 2.2 AI計算成功パスのテスト
  - `calculateMove`呼び出しでWorkerへのメッセージ送信を検証
  - Worker成功レスポンス受信時のPromise解決を確認
  - 正しいAI手(Position)の返却を検証
  - loading状態の適切な管理(true → false遷移)を確認
  - _Requirements: 1.2, 1.3, 1.8_

- [x] 2.3 タイムアウト処理のテスト
  - 3秒タイムアウト時のフォールバック実行を検証
  - `jest.advanceTimersByTime(3000)`でタイマー進行をシミュレート
  - タイムアウト時のイベントリスナークリアを確認
  - フォールバックAIによるランダム手の返却を検証
  - _Requirements: 1.7, 7.1_

- [x] 2.4 エラーハンドリングのテスト
  - Workerエラーレスポンス(`type: 'error'`)受信時のフォールバック実行を検証
  - Worker未初期化(`!workerRef.current`)時の即座フォールバック実行を確認
  - フォールバック失敗時のPromise rejectを検証
  - エラー状態の適切な伝搬とメッセージ設定を確認
  - _Requirements: 1.4, 6.1, 6.5, 7.5_

- [x] 2.5 並行処理と非同期制御のテスト
  - 複数の`calculateMove`連続呼び出し時の独立したPromise解決を検証
  - 競合状態(race condition)ハンドリングを確認
  - コンポーネントアンマウント前後の非同期処理完了タイミングを検証
  - メモリリーク防止(イベントリスナークリーンアップ)を確認
  - _Requirements: 1.6, 7.2, 7.3, 7.4_

- [x] 3. WASMErrorHandler.tsxのテスト実装
  - 全エラー種別に対する適切なメッセージ表示を検証
  - UI要素の存在確認とユーザー操作のハンドリングを確認
  - アクセシビリティ属性とレスポンシブデザインの適用を検証
  - エラー詳細情報の正確な表示を確認
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 3.1 エラーメッセージ表示のテスト
  - `fetch_failed`エラーで"インターネット接続を確認"メッセージ表示を検証
  - `instantiation_failed`エラーで"ブラウザがWebAssemblyに対応していない"メッセージを確認
  - `initialization_timeout`エラーで"読み込みに時間がかかっています"メッセージを検証
  - `wasm_instantiation_failed`エラーで初期化失敗メッセージを確認
  - `test_call_failed`エラーでテスト呼び出し失敗メッセージを検証
  - デフォルトメッセージ(エラー情報未提供時)の表示を確認
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 3.2 UI要素とユーザー操作のテスト
  - リロードボタンの存在確認(`screen.getByRole('button', {name: 'リロード'})`)
  - リロードボタンクリック時の`window.location.reload()`呼び出しを検証
  - 技術詳細セクション(`<details>`要素)の存在とJSON表示を確認
  - 技術詳細の展開・折りたたみ動作を検証
  - _Requirements: 2.2, 2.5_

- [x] 3.3 エラータイプ別ハンドリングのテスト
  - `WASMLoadError`型の各種エラー(`fetch_failed`, `instantiation_failed`, `initialization_timeout`)を検証
  - `InitializationError`型の各種エラー(`wasm_load_failed`, `wasm_instantiation_failed`, `test_call_failed`)を確認
  - 複数エラー連続発生時の最新エラー優先表示を検証
  - エラータイプに応じた適切なメッセージマッピングを確認
  - _Requirements: 2.3, 2.6_

- [x] 3.4 アクセシビリティとレスポンシブのテスト
  - ARIA属性(`role`, `aria-label`)の適切な設定を検証
  - キーボードナビゲーション対応を確認
  - レスポンシブデザインの適用(Tailwind CSSクラス)を検証
  - スクリーンリーダー対応要素の存在を確認
  - _Requirements: 2.7, 2.8_

- [x] 4. wasm-loader.tsのテスト実装
  - WASM正常ロードからランタイム初期化までの完全なフローを検証
  - 各種エラーシナリオに対する適切なエラーハンドリングを確認
  - Result型パターンによる成功・失敗の返却を検証
  - パス解決ロジックの正確性を確認
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 4.1 WASM正常ロードのテスト
  - `importScripts`呼び出しの実行を検証
  - `global.Module`オブジェクトの設定を確認
  - `onRuntimeInitialized`コールバック待機と実行を検証
  - `_init_ai()`呼び出しの実行を確認
  - `Result.success(Module)`の返却を検証
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.2 エラーハンドリングのテスト
  - `importScripts`未定義時(`typeof importScripts === 'undefined'`)の`WASMLoadError`返却を検証
  - `importScripts`例外スロー時のcatchブロックと`fetch_failed`エラーを確認
  - `global.Module`未定義時の`instantiation_failed`エラーを検証
  - ランタイム初期化失敗時のエラーハンドリングを確認
  - _Requirements: 3.4, 3.5, 3.6_

- [x] 4.3 非同期処理とタイミング制御のテスト
  - `setTimeout()`による`onRuntimeInitialized`コールバックタイミングの制御を検証
  - 非同期初期化完了待機のPromise解決を確認
  - タイムアウト処理の実行を検証
  - プログレス状態管理のロジックを確認
  - _Requirements: 3.8, 3.9, 7.1_

- [x] 4.4 パス解決とResult型のテスト
  - `.wasm`を`.js`に置換するパス変換ロジックを検証
  - 絶対パスと相対パスの適切な処理を確認
  - `Result.success`構造(`{success: true, value: Module}`)を検証
  - `Result.error`構造(`{success: false, error: {type, reason, message}}`)を確認
  - _Requirements: 3.1, 3.4_

- [ ] 5. エラーハンドリング統合テスト
  - 全コンポーネント横断でのエラー伝搬と回復を検証
  - 複数エラー同時発生時の優先度管理を確認
  - リトライメカニズムの動作を検証
  - フォールバック機能の統合的な動作を確認
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 5.1 Worker-WASM エラー連鎖のテスト
  - WASM初期化失敗がWorkerエラーとして伝搬される流れを検証
  - Workerエラーがフックのフォールバックをトリガーする動作を確認
  - エラーメッセージの適切な変換と伝達を検証
  - エラーバウンダリによる最終的なキャッチを確認
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 5.2 ネットワーク・タイムアウトエラーのテスト
  - ネットワークタイムアウト発生時のエラーハンドリングを検証
  - タイムアウト後のリカバリメカニズムの動作を確認
  - メモリ不足エラーのgracefulなハンドリングを検証
  - 予期しないエラーの適切なキャッチと報告を確認
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 5.3 複数エラー管理とリトライのテスト
  - 複数エラー同時発生時の優先度管理ロジックを検証
  - リトライメカニズムの実行回数と間隔を確認
  - リトライ成功時のエラー状態クリアを検証
  - リトライ失敗時の最終エラー表示を確認
  - _Requirements: 6.6, 6.7_

- [ ] 6. 非同期処理検証とカバレッジ最終確認
  - 全非同期処理のタイミングと状態遷移を包括的に検証
  - メモリリークとクリーンアップの完全性を確認
  - 全カバレッジ指標が90%以上に到達していることを確認
  - CI/CDパイプラインでのカバレッジチェック通過を検証
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 6.1 非同期処理の包括的検証
  - Promise解決タイミングの正確性をすべての非同期操作で検証
  - 並行実行時の状態一貫性を確認
  - コンポーネントライフサイクルと非同期処理の整合性を検証
  - AbortControllerによるキャンセル機能の動作を確認
  - _Requirements: 7.1, 7.2, 7.3, 7.7_

- [ ] 6.2 メモリリーク防止の最終確認
  - アンマウント後の非同期処理完了時のメモリリーク防止を検証
  - イベントリスナーの完全なクリーンアップを確認
  - Workerの適切な終了処理を検証
  - グローバル変数の確実なクリーンアップを確認
  - _Requirements: 7.4, 7.6_

- [ ] 6.3 カバレッジ目標達成の検証
  - `jest --coverage`実行でStatements 90%以上を確認
  - Branches カバレッジ90%以上を確認
  - Functions カバレッジ90%以上を確認
  - Lines カバレッジ90%以上を確認
  - 未カバー箇所の詳細レポート確認と必要に応じた追加テスト実装
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6.4 CI/CD統合とレポート生成
  - GitHub Actions CIパイプラインでのカバレッジ閾値チェック実行を確認
  - HTML形式カバレッジレポート生成を検証
  - カバレッジレポートのコミット・PR連携を確認
  - CI失敗時のエラーメッセージ明確性を検証
  - _Requirements: 8.6, 8.7_

## タスク完了条件

- 全テストケースが実装され`pnpm test`で全パスする
- カバレッジレポートで全指標(Statements, Branches, Functions, Lines)が90%以上を達成
- CIパイプライン(`pnpm run test:coverage`)が成功する
- 既存実装コードに変更がない(テストコードのみ追加)
- コードレビューで承認を得る
