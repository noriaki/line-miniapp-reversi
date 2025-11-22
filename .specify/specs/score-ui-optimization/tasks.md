# Implementation Plan

## Task Format Template

Use this structure for all implementation tasks:

- [ ] {{MAJOR_NUMBER}}. {{MAJOR_TASK_DESCRIPTION}}
  - {{DETAIL_ITEM_1}}
  - {{DETAIL_ITEM_2}}
  - {{DETAIL_ITEM_3}}
  - _Requirements: {{REQUIREMENT_IDS}}_

- [ ] {{MAJOR_NUMBER}}.{{SUB_NUMBER}} {{SUB_TASK_DESCRIPTION}}
  - {{DETAIL_ITEM_1}}
  - {{DETAIL_ITEM_2}}
  - _Requirements: {{REQUIREMENT_IDS}}_

## Implementation Tasks

- [x] 1. スコア表示UIのJSX構造を最適化する
- [x] 1.1 displayNameテキスト要素をGameBoard.tsxから削除する
  - GameBoard.tsx lines 410-414のdisplayName表示要素を完全に削除する
  - profile.displayNameへの参照をJSXから除去する
  - displayName表示用のdivコンテナ要素も削除する
  - スコア表示が黒石アイコンと石数のみで構成されることを確認する
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 スコア要素の並び順を「黒石アイコン→黒石数→vs→白石数→白石アイコン」に変更する
  - 黒石セクションのJSX構造を水平配置(flex-row)に変更する
  - 黒石アイコンを左側、黒石数を右側に配置する
  - 白石セクションのJSX構造を水平配置(flex-row-reverse)に変更する
  - 白石数を左側、白石アイコンを右側に配置する
  - vsディバイダーを中央に維持する
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 1.3 プロフィールアイコンと石アイコンの表示ロジックを維持する
  - 黒石側でprofile.pictureUrlが利用可能な場合はプロフィールアイコンを表示する
  - imageError stateがtrueの場合はデフォルト石アイコンにフォールバックする
  - 白石側は常に石アイコンを表示する(プロフィールアイコン不使用)
  - 画像読み込み失敗時のonErrorハンドラを維持する
  - _Requirements: 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4_

- [x] 2. スコア表示のCSSスタイリングを調整する
- [x] 2.1 stone-count-itemクラスをflexbox水平配置に変更する
  - GameBoard.css lines 29-33のstone-count-itemをflex-rowベースに変更する
  - 既存のgap値(0.75rem)を維持して適切なスペーシングを確保する
  - align-items: centerを維持してアイコンと数値の垂直中央揃えを保持する
  - displayプロパティはflexのまま維持する
  - _Requirements: 3.1, 3.4_

- [x] 2.2 白石用の順序反転CSSクラスを追加する
  - 新規CSSクラス.stone-count-item--reversedを定義する
  - flex-direction: row-reverseを設定してアイコンを右側に配置する
  - 既存のstone-count-itemスタイルを継承する
  - 白石セクションのJSXに新しいクラスを適用する
  - _Requirements: 2.1, 3.1_

- [x] 2.3 レスポンシブブレークポイントでのスタイル調整を行う
  - 既存のブレークポイント(@media max-width: 640px, 375px)を維持する
  - スマートフォン画面での視覚的スペーシングを検証する
  - gap値が小画面でも適切に表示されることを確認する
  - タッチ操作に干渉しない配置を保持する
  - _Requirements: 3.2, 3.4_

- [x] 3. 既存機能とアクセシビリティを保持する
- [x] 3.1 スコア更新機能とゲームロジックの動作を確認する
  - 石配置時にblackCountとwhiteCountがリアルタイム更新されることを検証する
  - ゲーム終了時に最終スコアが正確に表示されることを確認する
  - ゲームリセット時に初期スコア(黒:2、白:2)が表示されることを確認する
  - useGameStateフックとの統合が破壊されていないことを検証する
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3.2 LIFF統合とエラーハンドリングを保持する
  - useLiffフックからのprofileデータ取得が正常に動作することを確認する
  - LIFF初期化失敗時にprofile: nullとして処理されることを検証する
  - 既存のErrorBoundaryコンポーネントとの統合を維持する
  - エラーバウンダリ内でスコアUIが正常にレンダリングされることを確認する
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.4_

- [x] 3.3 アクセシビリティ属性を追加する
  - スコア数値要素に適切なaria-label属性を設定する
  - 黒石数に"Black score: {count}"形式のラベルを追加する
  - 白石数に"White score: {count}"形式のラベルを追加する
  - スクリーンリーダーでスコア情報が読み上げられることを確認する
  - _Requirements: 非機能要件-アクセシビリティ1, 非機能要件-アクセシビリティ2_

- [x] 4. ユニットテストを追加・更新する
- [x] 4.1 displayName非表示のテストケースを追加する
  - GameBoard-liff.test.tsxに新規テストケースを追加する
  - profileにdisplayNameが含まれていてもテキスト表示されないことを検証する
  - screen.queryByTextでdisplayNameが存在しないことを確認する
  - LIFF環境と非LIFF環境の両方でテストする
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4.2 スコア要素の表示順序テストを追加する
  - GameBoard.test.tsxに要素順序検証テストを追加する
  - DOMツリーから.stone-countの子要素を取得する
  - 左から順に「黒石セクション→vsディバイダー→白石セクション」の順序を検証する
  - 各セクション内のアイコンと数値の配置を確認する
  - _Requirements: 2.1_

- [x] 4.3 プロフィールアイコン表示ロジックのテストを追加する
  - GameBoard-liff.test.tsxにアイコン表示テストを追加する
  - profile.pictureUrlが存在する場合にプロフィールアイコンが表示されることを検証する
  - imageError状態でデフォルト石アイコンにフォールバックすることを確認する
  - 白石側で常に石アイコンが表示されることを検証する
  - 非LIFF環境で両サイドとも石アイコンが表示されることを確認する
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.4 CSSスタイリングのスナップショットテストを更新する
  - GameBoard.test.tsxの既存スナップショットテストを更新する
  - 新しいスコアUI構造のスナップショットを生成する
  - レスポンシブレイアウトのスナップショットを確認する
  - ビジュアルリグレッションが意図的な変更であることを検証する
  - _Requirements: 3.1, 3.4_

- [ ] 5. 統合テストとE2Eテストを更新する
- [ ] 5.1 統合テストでLIFF統合とスコア更新を検証する
  - GameBoard.integration.test.tsxの既存テストを更新する
  - LIFF環境でプロフィールアイコンが正しく表示されることを確認する
  - 石配置後のスコア更新がUI要素に反映されることを検証する
  - 複数回の石配置でスコアが正確にカウントされることを確認する
  - _Requirements: 5.1, 5.2_

- [ ] 5.2 E2Eテストでスコア表示の視覚的検証を行う
  - e2e/game-flow.spec.tsに新規テストケースを追加する
  - ページロード後にスコアUIが最適化されたレイアウトで表示されることを確認する
  - DOMセレクタで要素順序を検証する
  - displayNameテキストが表示されないことを確認する
  - スクリーンショット比較でビジュアルリグレッションを検証する
  - _Requirements: 1.1, 1.2, 2.1, 3.4_

- [ ] 5.3 モバイルビューポートでのレスポンシブ表示を検証する
  - e2e/responsive.spec.tsの既存テストを更新する
  - Mobile Chrome/Safariビューポートでスコア表示を確認する
  - 小画面(375px)でのスペーシングと配置を検証する
  - タッチ操作領域がゲーム盤面と干渉しないことを確認する
  - 異なる画面幅でのレスポンシブ調整を検証する
  - _Requirements: 3.2, 3.4_

- [ ] 6. パフォーマンステストとテストカバレッジを検証する
- [ ] 6.1 スコアUI再レンダリングのパフォーマンスを計測する
  - GameBoard-pass-performance.test.tsxパターンに従い新規テストを追加する
  - スコア更新時の再レンダリング時間を計測する
  - performance.now()を使用して16ms以内(60fps)を検証する
  - 複数回の更新で平均レンダリング時間を計算する
  - _Requirements: 非機能要件-パフォーマンス1_

- [ ] 6.2 テストカバレッジを検証して90%以上を確保する
  - pnpm run test:coverageでカバレッジレポートを生成する
  - GameBoard.tsxのスコア表示関連コードが90%以上カバーされていることを確認する
  - カバレッジ不足の箇所を特定して追加テストを作成する
  - すべてのエッジケース(画像読み込み失敗、LIFF初期化失敗)をカバーする
  - _Requirements: 非機能要件-互換性2_

- [x] 7. 既存のテストスイートが全てパスすることを確認する
- [x] 7.1 全てのユニットテストと統合テストを実行する
  - pnpm run testで全テストスイートを実行する
  - 既存のGameBoard関連テストがすべてパスすることを確認する
  - LIFF関連テスト、ゲームロジックテストへの影響がないことを検証する
  - 回帰テストで既存機能が破壊されていないことを確認する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 非機能要件-互換性1_

- [x] 7.2 E2Eテストスイートを全デバイスで実行する
  - pnpm run test:e2eで全E2Eテストを実行する
  - Desktop Chrome、Mobile Chrome、Mobile Safariでテストする
  - game-flow、ai-game、responsive、wasm-errorテストがすべてパスすることを確認する
  - 既存のE2Eテストへの影響がないことを検証する
  - _Requirements: 非機能要件-互換性1_
