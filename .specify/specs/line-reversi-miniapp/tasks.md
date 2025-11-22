# 実装タスク

## 1. プロジェクト基盤のセットアップ

- [x] 1.1 Next.js プロジェクトの初期化とツール設定
  - Next.js 14+ (App Router) プロジェクトを作成し、TypeScript strict mode を有効化
  - pnpm をパッケージマネージャとして設定し、package.json を構成
  - `.node-version` ファイルに Node.js 24.x を指定し、nodenv による環境管理を構成
  - ESLint (eslint-config-next)、Prettier、TypeScript コンパイラを設定
  - _Requirements: 5.1, 5.4, 8.1_

- [x] 1.2 プロジェクト構造とディレクトリの確立
  - クライアント側とサーバ側を分離したディレクトリ構造を作成
  - `app/` (Server Components)、`src/components/` (Client Components)、`src/hooks/`、`src/lib/` を配置
  - `src/workers/` ディレクトリを作成し、Web Worker 用のファイルを準備
  - 静的アセット用 `public/` ディレクトリを構成し、ai.wasm を配置
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 1.3 スタイリングとUI基盤の構築
  - Tailwind CSS をインストールし、スマートフォン最適化の設定を追加
  - CSS Modules の設定を有効化し、グローバルスタイルを定義
  - レスポンシブデザイン用のブレークポイントとテーマカラーを設定
  - タッチ操作に最適化されたベース CSS を作成
  - _Requirements: 6.1, 6.2_

## 2. ゲームロジックの実装

- [x] 2.1 ボード状態とデータモデルの定義
  - Board、Cell、Position、Player、GameStatus の型定義を作成
  - 初期ボード状態 (中央4マスに黒白2個ずつ) を生成する関数を実装
  - ボードの Immutability を保証するヘルパー関数を実装
  - 石数カウント機能を実装
  - _Requirements: 1.2, 1.3, 2.6_

- [x] 2.2 手の有効性判定と反転ロジック
  - 8方向の探索により反転可能な石を検出する関数を実装
  - 特定の手が有効かを判定する validateMove 関数を実装
  - 全方向の反転対象石を収集する findAllFlips 関数を実装
  - 境界条件とエッジケース (ボード端、角) の処理を確実に実装
  - _Requirements: 2.1, 2.2_

- [x] 2.3 石の配置とゲーム状態更新
  - 石を配置し、反転処理を適用する applyMove 関数を実装
  - 元のボードを変更せず新しいボードを返す Immutable パターンを保証
  - プレイヤーの全有効手を計算する calculateValidMoves 関数を実装
  - 有効手がない場合の空配列返却を確実に処理
  - _Requirements: 2.1, 2.3_

- [x] 2.4 ゲーム終了判定と勝敗決定
  - ゲーム終了条件 (全マス埋まる、両者スキップ) を判定する checkGameEnd 関数を実装
  - 黒石と白石の数を比較し勝者を決定するロジックを実装
  - 引き分け判定を含む GameEndResult を返す処理を実装
  - ターンスキップ判定ロジックを実装
  - _Requirements: 2.4, 2.5, 2.6, 3.6_

## 3. WebAssembly AI エンジンの統合

- [x] 3.1 WASM モジュールのロードと初期化
  - ai.wasm ファイルをロードする loadWASM 関数を実装
  - Emscripten Runtime の初期化完了を待機する処理を実装
  - \_init_ai() 関数を呼び出し AI を初期化
  - WASM ロード失敗時のエラーハンドリングを実装
  - _Requirements: 4.1, 4.5, 9.1_

- [x] 3.2 ボード状態のエンコーディングとデコーディング
  - JavaScript の Board 状態を 256 bytes の Int32Array にエンコードする関数を実装
  - セル値 (-1=空, 0=黒, 1=白) のマッピングを正確に実装
  - WASM メモリへの書き込み処理 (\_malloc(256), HEAP32) を実装
  - WASM 応答 (1000\*(63-policy)+100+value 形式) を Position 型にデコードする関数を実装
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 3.3 WASM 関数呼び出しとエラーハンドリング
  - \_ai_js(boardPtr, level, ai_player) を呼び出し、最善手を計算する関数を実装
  - 返り値 (1000\*(63-policy)+100+value) を正しくデコードする処理を実装
  - 無効な応答 (範囲外の値) を検出するバリデーションを実装
  - メモリリークを防止するため、計算後に \_free() を確実に呼び出す処理を実装
  - _Requirements: 3.2, 3.3, 3.4, 4.4, 4.5_

- [x] 3.4 Web Worker による AI 計算の非同期化
  - ai-worker.ts を作成し、WASM 計算を Worker スレッドで実行
  - メインスレッドと Worker 間のメッセージング (AIWorkerRequest/Response) を実装
  - 3秒タイムアウトを設定し、超過時はランダムな有効手にフォールバックする処理を実装
  - Worker 内で WASM モジュールを再利用し、パフォーマンスを最適化
  - WASMBridgeの最新API (\_ai_js with level and ai_player parameters) を正しく使用
  - _Requirements: 3.5, 8.2, 8.3_

- [x] 3.5 AIEngine サービスの高レベル API 実装
  - AIEngine の initialize、calculateMove、isReady、dispose 関数を実装
  - WASMBridge を呼び出し、エラーを Result 型で返す処理を実装
  - AI 計算中の状態管理 (isAIThinking フラグ) を実装
  - エラー時の適切なフォールバック処理 (ランダム手選択) を実装
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

## 4. ゲーム UI とインタラクションの実装

- [x] 4.1 Server Component によるページ生成
  - app/page.tsx を Server Component として実装し、SSG を構成
  - メタデータ (title, description, viewport, themeColor) を設定
  - 静的 HTML を生成し、GameBoard Client Component をマウント
  - ビルド時の HTML 生成を確認
  - _Requirements: 1.4, 5.3, 8.1_

- [x] 4.2 GameBoard Client Component の実装
  - "use client" ディレクティブを付与し、Client Component として実装
  - useGameState フックでゲーム状態を管理 (board, currentPlayer, validMoves, gameStatus)
  - useGameLogic フックでゲームロジックを統合
  - useAIPlayer フックで AI 対戦ロジックを統合
  - _Requirements: 1.1, 2.1, 5.2, 5.4_

- [x] 4.3 ボードレンダリングと視覚的フィードバック
  - BoardRenderer コンポーネントを実装し、8×8 グリッドを表示
  - 黒石、白石、空きマスを視覚的に区別して描画
  - 有効手のハイライト表示機能を実装
  - タップ操作に即座に反応する視覚的フィードバックを実装
  - _Requirements: 1.1, 1.5, 2.3, 6.1, 6.2_

- [x] 4.4 石の配置とアニメーション
  - ユーザのマスタップを処理し、石を配置する機能を実装
  - 無効な手をタップした際のエラーフィードバック (赤ハイライト) を実装
  - 石配置時と反転時のアニメーション効果を CSS で実装
  - アニメーションのパフォーマンス最適化 (CSS transform, transition) を実施
  - _Requirements: 2.1, 2.2, 6.2, 6.3_

- [x] 4.5 ゲーム状態表示とターン管理 UI
  - 現在のターン (ユーザまたは AI) を明確に表示するコンポーネントを実装
  - 黒石と白石の現在の数をリアルタイムで表示
  - AI 思考中のローディングインジケーターを表示
  - ターンスキップ時のメッセージ表示機能を実装
  - _Requirements: 3.5, 6.4, 6.5_

- [x] 4.6 ゲーム終了と結果表示
  - ゲーム終了時の結果画面 (勝敗、最終スコア) を実装
  - 新しいゲームを開始するボタンを配置
  - ゲームリセット機能を実装し、全状態を初期化
  - 結果画面のアニメーション演出を実装
  - _Requirements: 2.5, 2.6, 6.6, 6.7_

## 5. WASM インテグレーションテスト

- [x] 5.1 Jest環境構成とWASMモジュールロード
  - Node.js環境でのJest設定 (@jest-environment node)
  - .kiro/specs/line-reversi-miniapp/resources/ai.js と ai.wasm を使用
  - EmscriptenモジュールのロードとonRuntimeInitialized待機
  - エクスポート関数の存在確認 (\_init_ai, \_ai_js, \_calc_value, \_stop, \_resume, \_malloc, \_free)
  - _Requirements: 3.1, 4.1_

- [x] 5.2 ボードエンコーディングと \_ai_js 関数の実動作検証
  - Int32Array (64要素、256 bytes) による実際のボードエンコード実装
  - セル値マッピング: -1 = empty, 0 = black, 1 = white
  - 実際の ai.wasm を使用した \_ai_js(boardPtr, level, ai_player) の呼び出し
  - 返り値のデコード: policy = 63 - Math.floor((result - 100) / 1000), index = 63 - policy
  - 初期配置、中盤、終盤の各ボード状態でのテスト
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 5.3 \_calc_value 関数による評価値計算の検証
  - \_calc_value(boardPtr, resPtr, level, ai_player) の実動作テスト
  - 返り値配列 (74要素) の検証: res[10-73] = ビット位置 63-0 の評価値
  - Level 0 のランダム性検証（複数回実行で異なる結果）
  - 非合法手の -1 判定確認
  - 評価値の正負による有利/不利の判定確認
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 5.4 メモリ管理の完全検証
  - \_malloc(256) によるボード用メモリ確保テスト
  - Module.HEAP32 を介したメモリ読み書き検証
  - \_free(ptr) による適切なメモリ解放テスト
  - 連続10回の AI 計算でメモリリークがないことを確認
  - 不正なポインタ (0) に対する \_free の安全性確認
  - _Requirements: 4.5, 8.2, 8.3_

- [x] 5.5 パフォーマンスとタイムアウトの検証
  - Level 0-5 での計算時間測定 (目標: 各3秒以内)
  - 初期ボード、中盤、終盤の各状態での計算時間計測
  - \_stop() と \_resume() の動作確認
  - 統合テストファイルとして wasm.integration.test.ts を作成
  - _Requirements: 3.5, 8.2, 8.3_

- [x] 5.6 エラーケースとエッジケースの検証
  - 不正なボードサイズ (63要素、65要素) に対するエラーハンドリング
  - 不正なセル値 (範囲外の整数) に対する挙動確認
  - \_malloc 失敗時 (return 0) のハンドリング
  - 返り値の範囲外チェック (< 0 or >= 64)
  - 初期化前の関数呼び出しに対するエラー処理
  - _Requirements: 4.5, 9.1, 9.3_

## 6. Emscripten WASM グルーコード統合

- [x] 6.1 Emscripten グルーコード (ai.js) の配置
  - .kiro/specs/line-reversi-miniapp/resources/ai.js を public/ ディレクトリにコピー
  - Next.js の静的アセット配信で ai.js が正しく提供されることを確認
  - ai.wasm と ai.js が同じディレクトリ (public/) に配置されることを確認
  - _Requirements: 3.1, 4.1_

- [x] 6.2 WASM ローダーの Emscripten 対応実装
  - wasm-loader.ts を修正し、WebAssembly.instantiate() の直接呼び出しを削除
  - Emscripten モジュールローダーを実装:
    - 動的スクリプトロード: `<script src="/ai.js">` をプログラマティックに追加
    - または importScripts() (Web Worker 内): `importScripts('/ai.js')`
  - Module.onRuntimeInitialized コールバックで初期化完了を待機
  - Module オブジェクトから WASM エクスポート関数にアクセス
  - _Requirements: 3.1, 4.1, 4.5_

- [x] 6.3 Web Worker での Emscripten 統合
  - ai-worker.ts で importScripts('/ai.js') を使用して Emscripten モジュールをロード
  - Worker スレッド内で Module.onRuntimeInitialized を待機
  - loadWASM() 関数を Emscripten 対応に修正
  - エラーハンドリング: Emscripten ロード失敗時の適切なエラーメッセージ
  - _Requirements: 3.4, 4.5, 9.1_

- [x] 6.4 Emscripten 統合テスト
  - wasm-loader.test.ts を Emscripten ロード方式に対応
  - ai-worker.test.ts で Emscripten モジュールのモックを実装
  - 統合テストで実際の ai.js 経由のロードを検証
  - エラーケース: ai.js が存在しない、ロードタイムアウト、初期化失敗
  - _Requirements: 3.1, 3.4, 9.1, 9.2_

## 7. エラーハンドリングとフォールバック

- [x] 7.1 Error Boundary の実装
  - React Error Boundary コンポーネントを実装
  - 予期しないエラーをキャッチし、ユーザフレンドリーなエラー画面を表示
  - エラーログをコンソールに出力 (ErrorLog 型でフォーマット)
  - リトライボタンとリロードボタンを配置
  - _Requirements: 9.2, 9.4, 9.5_

- [x] 7.2 WASM 関連のエラーハンドリング
  - WASM ロード失敗時のエラーメッセージとリロードボタンを表示
  - WASM 初期化失敗時の適切なフォールバック処理を実装
  - AI 計算タイムアウト時にランダム有効手を選択する処理を実装
  - WASM メモリアロケーション失敗時のエラーハンドリングを実装
  - _Requirements: 4.5, 9.1, 9.3_

- [x] 7.3 ユーザ入力とビジネスロジックのエラーハンドリング
  - 無効な手をタップした際の視覚的フィードバック (赤ハイライト、メッセージ) を実装
  - 有効手がない場合のターン自動スキップ処理を実装
  - ゲーム状態の不整合を検出し、ゲームリセットを提案する処理を実装
  - 全エラーを Result 型で返し、一貫したエラーハンドリングを実現
  - _Requirements: 2.2, 2.4, 9.2, 9.4_

- [x] 7.4 エラーハンドリングコンポーネントのメインアプリケーション統合
  - ErrorBoundary を app/layout.tsx でアプリ全体を wrap
  - WASMErrorHandler を AI Worker 初期化エラー時に表示するよう統合
  - useGameErrorHandler を GameBoard コンポーネントに統合
  - 無効な手の視覚的フィードバック (赤ハイライト、エラーメッセージ) を UI に反映
  - ターンスキップ通知とゲーム状態不整合メッセージを UI に表示
  - AI タイムアウト時の ai-fallback 処理を useAIPlayer に統合
  - エラーハンドリング統合後の動作確認テストを実施
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## 8. // [対象外] パフォーマンス最適化

- [ ] 8.1 React パフォーマンスの最適化
  - useMemo で有効手計算結果をメモ化
  - useCallback でコールバック関数を安定化し、不要な再レンダリングを防止
  - React.memo で BoardRenderer を最適化
  - React Profiler で再レンダリングのボトルネックを特定し改善
  - _Requirements: 8.2, 8.5_

- [ ] 8.2 バンドルサイズとコード分割の最適化
  - Next.js の自動コード分割を活用し、Client Component を分離
  - WASM ファイルを遅延ロードし、初回表示速度を向上
  - Tailwind CSS の Purge を有効化し、未使用 CSS を削除
  - Next.js Build Analyzer でバンドルサイズを確認し、500KB (gzip) 以下に抑制
  - _Requirements: 8.1_

- [ ] 8.3 静的サイト生成とキャッシュ戦略
  - SSG による静的 HTML 生成を確認し、ビルド最適化を実施
  - Cache-Control ヘッダーを設定し、静的アセットのキャッシュを有効化
  - WASM ファイルのキャッシュ戦略を構成
  - CDN 配信を想定した最適化を実施
  - _Requirements: 1.4, 8.1_

## 9. テストの実装

- [x] 9.1 ユニットテストの作成
  - GameLogic の全関数 (validateMove, applyMove, calculateValidMoves, checkGameEnd) をテスト
  - MoveValidator の findAllFlips を複雑な反転パターンでテスト
  - 境界条件とエッジケースを網羅的にテスト
  - カバレッジ 90% 以上を達成
  - _Requirements: All requirements (ゲームロジックの正確性保証)_

- [x] 9.2 統合テストの作成
  - GameBoard + GameLogic 統合テスト (ユーザ操作からUI更新までのフロー)
  - AIEngine + WASMBridge 統合テスト (WASM 初期化から AI 計算までのフロー)
  - Error Boundary 統合テスト (エラー発生時の UI 表示)
  - _Requirements: 3.1, 3.2, 4.1, 9.1_

- [x] 9.3 E2E テストの作成
  - ゲーム起動から終了までの完全プレイフローをテスト
  - 有効手ハイライト表示とターンスキップフローをテスト
  - WASM 初期化失敗シナリオをテスト
  - 各種スマートフォン画面サイズでのレスポンシブデザインをテスト
  - _Requirements: 1.1, 2.1, 3.1, 6.1, 8.4_

- [x] 9.4 AI 対戦の E2E テスト
  - Playwright のセットアップと e2e テストディレクトリ構成
  - ゲーム起動から AI 対戦完了までの完全フローをテスト
  - AI 計算中の UI 応答性とローディングインジケーター表示を検証
  - // [対象外] 連続プレイでのメモリリーク検証 (10ゲーム連続)
  - WASM エラーケース (ロード失敗、タイムアウト) のハンドリングをテスト
  - // [対象外] クロスブラウザテスト (Chrome, Firefox, Safari) の実施
  - // [対象外] CI/CD パイプラインでのヘッドレスブラウザ自動実行設定
  - package.json への Playwright テスト実行スクリプト追加
  - _Requirements: 3.1, 3.4, 3.5, 4.1, 8.3, 8.4_

- [ ] // [対象外] 9.5 パフォーマンステストの実施
  - Lighthouse で FCP (< 2秒)、TTI (< 3秒) を測定
  - Chrome DevTools で UI 応答速度 (< 100ms) を測定
  - AI 計算速度 (< 3秒) を様々なボード状態でテスト
  - 長時間プレイ後のメモリリーク検証 (10ゲーム連続)
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

## 10. // [対象外] セキュリティとデプロイ準備

- [ ] 10.1 Content Security Policy の設定
  - Next.js の CSP ヘッダーを設定 (script-src, style-src, connect-src)
  - WASM 実行に必要な許可を追加
  - CSP 設定をテスト環境で検証
  - _Requirements: 8.1, 9.1_

- [ ] 10.2 WASM ファイルの整合性検証
  - Subresource Integrity (SRI) ハッシュを生成し、ai.wasm の改ざん検証を実装
  - ハッシュ検証失敗時のエラーハンドリングを実装
  - HTTPS 経由での WASM 配信を確認
  - WASM ファイルの署名検証を検討
  - _Requirements: 4.1, 9.1_

- [ ] 10.3 本番環境向けビルドと最適化
  - Next.js の本番ビルド (next build) を実行し、静的エクスポートを生成
  - 環境変数を本番環境用に設定
  - Source Map の有効化/無効化を判断
  - ビルド成果物のサイズとパフォーマンスを最終確認
  - _Requirements: 8.1, 8.2_

- [ ] 10.4 デプロイメント検証とドキュメント作成
  - CDN 配信を想定した静的ファイルの検証
  - デプロイ手順書を作成 (ビルド、環境変数、CDN 設定)
  - 本番環境での動作確認チェックリストを作成
  - _Requirements: 8.1, 8.2_
