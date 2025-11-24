# 実装計画

## 実装タスク

- [x] 1. Message型システムの実装
  - Discriminated unionによるMessage型定義（info/warning バリアント）
  - MessageBoxPropsインターフェース定義（message、testId プロパティ）
  - UseMessageQueueReturnインターフェース定義（currentMessage、addMessage、clearMessage）
  - timeout プロパティの追加（目的別タイムアウト戦略に対応）
  - TypeScript strict modeでの型安全性確保（`any`型の排除）
  - _Requirements: 3.1, 5.3, 6.4_

- [x] 2. (P) useMessageQueueフックの実装
- [x] 2.1 メッセージキュー状態管理の実装
  - useStateで現在メッセージの状態管理（Message | null 型）
  - useRefによるタイマーID管理（NodeJS.Timeout | null 型）
  - useRefによる最終メッセージ時刻の追跡（レート制御用）
  - useEffectでのコンポーネントアンマウント時タイマークリーンアップ実装
  - メッセージ不在時の null 状態の適切な処理
  - _Requirements: 1.2, 1.5, 6.4, 6.5_

- [x] 2.2 メッセージ追加とタイマー制御の実装
  - addMessage関数の実装（既存タイマークリア、新メッセージ設定、message.timeout値でタイマー開始）
  - 目的別タイムアウト期間内の新メッセージによる既存メッセージの即座置き換えロジック
  - clearMessage関数の実装（タイマークリア、メッセージnull設定）
  - useCallbackによる関数メモ化でパフォーマンス最適化
  - 空文字列メッセージの検証とconsole.warn処理
  - timeout値の正数チェックと検証
  - _Requirements: 1.3, 1.4, 4.5, 5.1, 5.2, 6.4_

- [x] 2.3 メッセージレート制御の実装
  - 最小メッセージ間隔（100ms）の監視ロジック実装
  - Date.now()による最終メッセージ時刻の追跡
  - 100ms以内の高頻度発行時のconsole.warn出力
  - 最新メッセージ優先戦略（警告出力後も処理継続）
  - デバウンス/スロットルなしの即時置き換え方式
  - _Requirements: 1.3, 6.4_

- [x] 3. (P) MessageBoxコンポーネントの実装
- [x] 3.1 固定高さレイアウトとopacity遷移の実装
  - 固定高さコンテナ（h-16 = 64px）の実装
  - message null時はopacity: 0、非null時はopacity: 1での表示制御
  - Tailwind CSS `transition-opacity duration-300` での滑らかなフェード遷移（0.3秒以下）
  - メッセージ不在時も領域確保によるCLS（Cumulative Layout Shift）ゼロ保証
  - ページ上部の固定位置配置
  - 初期レンダリング時からの固定領域確保
  - React 18のクライアントコンポーネントとして実装（'use client' directive）
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.6_

- [x] 3.2 メッセージタイプ別スタイリングの実装
  - info typeの控えめな背景色と情報アイコン実装
  - warning typeの識別可能な背景色と警告アイコン実装
  - 派手な色を避けた低彩度カラーパレット使用（ゲーム盤面を主役として維持）
  - モバイルデバイスでの視認性確保（フォントサイズ、コントラスト比）
  - 長文テキストの切り詰め処理（line-clamp-2、text-overflow: ellipsis）
  - Tailwind CSS主体のスタイリング、必要に応じてPlain CSSファイル使用
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 5.5, 6.2, 6.3, 6.4_

- [x] 3.3 日本語テキストハンドリングの実装
  - font-family設定（-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif）
  - line-height: 1.5の適用
  - -webkit-box, -webkit-line-clamp: 2, -webkit-box-orient: verticalの設定
  - word-break: break-allによる日本語の適切な折り返し
  - HTMLコンテナへのlang="ja"属性追加
  - line-clamp非サポートブラウザ向けフォールバック（max-height: 3rem; overflow: hidden;）
  - _Requirements: 3.5, 5.4, 6.2, 6.3_

- [x] 4. Phase 1統合: useMessageQueueのGameBoard組み込み
- [x] 4.1 useMessageQueueの初期統合
  - GameBoardコンポーネントでuseMessageQueueフックを呼び出し
  - currentMessageとaddMessage関数の取得
  - MessageBoxコンポーネントをGameBoard JSX内のページ上部に配置
  - MessageBoxへのcurrentMessage propsの渡し
  - _Requirements: 5.1, 5.2, 6.4_

- [x] 4.2 目的別タイムアウト戦略の実装
  - パス通知メッセージのaddMessage呼び出し統合（type: 'info', timeout: 3000）
  - 無効な手警告のaddMessage呼び出し統合（type: 'warning', timeout: 2000）
  - 既存のパス通知ロジックからの移行
  - 既存の無効な手警告ロジックからの移行
  - hasInconsistencyは後続フェーズ対応のため現状維持
  - _Requirements: 1.3, 1.4, 5.1, 5.2_

- [ ] 5. Phase 2移行: 既存メッセージ表示の置き換え
- [ ] 5.1 GameBoard内メッセージ表示の移行
  - GameBoard内の既存3種類のメッセージ表示領域の削除
  - パス通知用の独立表示領域の削除
  - 無効な手警告用の独立表示領域の削除
  - 全メッセージ表示をMessageBoxに一元化
  - レイアウトシフト（CLS）ゼロの維持確認
  - _Requirements: 2.2, 5.1, 5.2_

- [ ] 5.2 useGameErrorHandler併用動作の検証
  - useMessageQueueとuseGameErrorHandlerの並行運用確認
  - useMessageQueueがhandleInvalidMoveとnotifyPassを処理
  - useGameErrorHandlerがhasInconsistency検出のみに縮小
  - 機能重複のない責務分離の確認
  - Phase 3への移行準備
  - _Requirements: 5.1, 5.2_

- [ ] 6. Phase 3最終化: useGameInconsistencyDetector分離
- [ ] 6.1 useGameInconsistencyDetectorの抽出
  - 新規フック作成（/src/hooks/useGameInconsistencyDetector.ts）
  - hasInconsistency検出ロジックの移行
  - resetGame関数の提供
  - インターフェース定義（hasInconsistency: boolean, resetGame: () => void）
  - ゲーム状態整合性検証のみに特化した責務
  - 不整合メッセージUIはGameBoard内独立表示として維持（MessageBox統合対象外）
  - _Requirements: 6.4, 6.5_

- [ ] 6.2 useGameErrorHandlerの削除
  - useGameErrorHandlerフックファイルの完全削除
  - GameBoardからのuseGameErrorHandler呼び出し削除
  - useMessageQueueとuseGameInconsistencyDetectorへの完全移行確認
  - テストスイートの更新（useGameErrorHandler関連テスト削除）
  - 型定義の整理とクリーンアップ
  - _Requirements: 6.4_

- [ ] 7. テストスイート実装
- [x] 7.1 (P) useMessageQueueユニットテストの実装
  - addMessage実行後のcurrentMessage状態更新検証
  - 目的別タイムアウト動作検証（パス通知3秒、無効な手警告2秒、jest.advanceTimersByTime使用）
  - 連続メッセージ追加時の既存タイマーキャンセル検証
  - コンポーネントアンマウント時のタイマークリーンアップ検証
  - 空文字列メッセージのconsole.warn呼び出し検証
  - timeout値の正数チェック検証
  - メッセージレート制御（100ms間隔）のconsole.warn出力検証
  - 高頻度発行時の最新メッセージ優先処理検証
  - _Requirements: 6.7_

- [x] 7.2 (P) MessageBoxコンポーネントユニットテストの実装
  - info messageでのレンダリングとスタイル検証
  - warning messageでのレンダリングとスタイル検証
  - null messageでの非表示状態（opacity: 0）と領域確保検証
  - 全ケースでの固定高さ（64px）維持検証（getComputedStyle使用）
  - 長文テキスト（200文字）でのellipsis適用検証
  - 日本語テキストの適切なレンダリング検証（lang="ja"属性確認）
  - line-clampによる2行制限の検証
  - _Requirements: 6.7_

- [x] 7.3 GameBoard統合テストの実装
  - パス通知トリガー後のMessageBox表示検証（3秒タイムアウト）
  - 無効な手トリガー後の警告メッセージ表示検証（2秒タイムアウト）
  - 目的別タイムアウト後のメッセージ自動消去動作検証
  - 連続メッセージの即座置き換え動作検証
  - レイアウトシフト（CLS）ゼロの検証（h-16クラス使用）
  - メッセージレート制御監視の動作検証（高頻度発行時のログ出力）
  - hasInconsistency独立UI表示の検証（MessageBox統合対象外であることの確認）
  - _Requirements: 6.7_
