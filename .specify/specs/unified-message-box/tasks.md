# 実装計画

## 実装タスク

- [ ] 1. Message型システムの実装
  - Discriminated unionによるMessage型定義（info/warning バリアント）
  - MessageBoxPropsインターフェース定義（message、testId プロパティ）
  - UseMessageQueueReturnインターフェース定義（currentMessage、addMessage、clearMessage）
  - TypeScript strict modeでの型安全性確保（`any`型の排除）
  - _Requirements: 3.1, 5.3, 6.4_

- [ ] 2. useMessageQueueフックの実装
- [ ] 2.1 メッセージキュー状態管理の実装
  - useStateで現在メッセージの状態管理（Message | null 型）
  - useRefによるタイマーID管理（NodeJS.Timeout | null 型）
  - useEffectでのコンポーネントアンマウント時タイマークリーンアップ実装
  - メッセージ不在時の null 状態の適切な処理
  - _Requirements: 1.2, 1.5, 6.4, 6.5_

- [ ] 2.2 メッセージ追加とタイマー制御の実装
  - addMessage関数の実装（既存タイマークリア、新メッセージ設定、5秒タイマー開始）
  - 5秒以内の新メッセージによる既存メッセージの即座置き換えロジック
  - clearMessage関数の実装（タイマークリア、メッセージnull設定）
  - useCallbackによる関数メモ化でパフォーマンス最適化
  - 空文字列メッセージの検証とconsole.warn処理
  - _Requirements: 1.3, 1.4, 4.5, 5.1, 5.2, 6.4_

- [ ] 3. MessageBoxコンポーネントの実装
- [ ] 3.1 固定高さレイアウトとopacity遷移の実装
  - 固定高さコンテナ（h-16 = 64px）の実装
  - message null時はopacity: 0、非null時はopacity: 1での表示制御
  - Tailwind CSS `transition-opacity duration-300` での滑らかなフェード遷移
  - メッセージ不在時も領域確保によるCLS（Cumulative Layout Shift）ゼロ保証
  - ページ上部の固定位置配置
  - 初期レンダリング時からの固定領域確保
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 6.1, 6.4, 6.6_

- [ ] 3.2 メッセージタイプ別スタイリングの実装
  - info typeの控えめな背景色と情報アイコン実装
  - warning typeの識別可能な背景色と警告アイコン実装
  - 派手な色を避けた低彩度カラーパレット使用（ゲーム盤面を主役として維持）
  - モバイルデバイスでの視認性確保（フォントサイズ、コントラスト比）
  - 長文テキストの切り詰め処理（line-clamp-2、text-overflow: ellipsis）
  - 日本語テキストの適切なレンダリング設定
  - Tailwind CSS主体のスタイリング、必要に応じてPlain CSSファイル使用
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 5.4, 5.5, 6.2, 6.3, 6.4_

- [ ] 4. GameBoard統合とメッセージ移行
- [ ] 4.1 useMessageQueueのGameBoard組み込み
  - GameBoardコンポーネントでuseMessageQueueフックを呼び出し
  - currentMessageとaddMessage関数の取得
  - MessageBoxコンポーネントをGameBoard JSX内のページ上部に配置
  - パス通知ロジックからのaddMessage呼び出し統合
  - _Requirements: 5.1, 6.4_

- [ ] 4.2 既存メッセージ表示のMessageBox置き換え
  - GameBoard内の既存3種類のメッセージ表示領域の削除
  - パス通知メッセージをaddMessage({ type: 'info', text: '...' })呼び出しに変更
  - 無効な手警告をaddMessage({ type: 'warning', text: '...' })呼び出しに変更
  - useGameErrorHandlerの機能統合または置き換え実施
  - 既存エラーハンドリングロジックの動作保証
  - _Requirements: 5.1, 5.2, 6.4_

- [ ] 5. テストスイートの実装
- [ ] 5.1 (P) useMessageQueueユニットテストの実装
  - addMessage実行後のcurrentMessage状態更新検証
  - 5秒後の自動クリア動作検証（jest.advanceTimersByTime使用）
  - 連続メッセージ追加時の既存タイマーキャンセル検証
  - コンポーネントアンマウント時のタイマークリーンアップ検証
  - 空文字列メッセージのconsole.warn呼び出し検証
  - _Requirements: 6.7_

- [ ] 5.2 (P) MessageBoxコンポーネントユニットテストの実装
  - info messageでのレンダリングとスタイル検証
  - warning messageでのレンダリングとスタイル検証
  - null messageでの非表示状態（opacity: 0）と領域確保検証
  - 全ケースでの固定高さ（64px）維持検証（getComputedStyle使用）
  - 長文テキスト（200文字）でのellipsis適用検証
  - _Requirements: 6.7_

- [ ] 5.3 GameBoard統合テストの実装
  - パス通知トリガー後のMessageBox表示検証
  - 無効な手トリガー後の警告メッセージ表示検証
  - 5秒後のメッセージ自動消去動作検証
  - 連続メッセージの置き換え動作検証
  - レイアウトシフト（CLS）ゼロの検証（getBoundingClientRect使用）
  - _Requirements: 6.7_
