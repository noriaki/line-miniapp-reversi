/**
 * Message type system for unified message box
 * Implements discriminated union pattern for type-safe message handling
 */

/**
 * Message type discriminated union
 * Supports two variants: info (通常メッセージ) and warning (警告メッセージ)
 */
export type Message =
  | {
      type: 'info';
      text: string;
      timeout: number; // タイムアウト時間（ミリ秒）
    }
  | {
      type: 'warning';
      text: string;
      timeout: number; // タイムアウト時間（ミリ秒）
    };

/**
 * MessageBox component props
 * Defines the interface for MessageBox presentational component
 */
export interface MessageBoxProps {
  /**
   * 現在表示するメッセージ
   * nullの場合は非表示状態（opacity: 0だが領域は確保）
   */
  message: Message | null;

  /**
   * テスト用のdata-testid属性
   * @default 'message-box'
   */
  testId?: string;
}

/**
 * useMessageQueue hook return type
 * Defines the interface for message queue state management hook
 */
export interface UseMessageQueueReturn {
  /**
   * 現在表示中のメッセージ（nullの場合は非表示）
   */
  currentMessage: Message | null;

  /**
   * 新しいメッセージを追加
   * 既存メッセージがある場合は即座に置き換える
   * @param message - 表示するメッセージ（timeout値を含む）
   */
  addMessage: (message: Message) => void;

  /**
   * 現在のメッセージをクリア（手動クリア用、通常は自動消去）
   */
  clearMessage: () => void;
}
