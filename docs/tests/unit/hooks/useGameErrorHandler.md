# useGameErrorHandler Tests

## ファイル情報

- **テストファイル**:
  - `src/hooks/__tests__/useGameErrorHandler.test.ts` (6テスト)
  - `src/hooks/__tests__/useGameErrorHandler-pass.test.ts` (9テスト)
- **テスト対象コード**: `src/hooks/useGameErrorHandler.ts`
- **テスト数**: 15
- **削除推奨テスト数**: 0

## 概要

このファイルは**useGameErrorHandlerフック**をテストしています。

useGameErrorHandlerフックは、ゲーム中のエラーハンドリングと通知管理を提供します:

- 無効な手のフィードバック（invalidMovePosition, invalidMoveReason）
- ゲーム状態の不整合検出（hasInconsistency, inconsistencyReason）
- パス通知（passNotification）
- タイマーベースの自動クリア機能

## テストケース一覧

### useGameErrorHandler.test.ts - Invalid move feedback (Task 7.3)（3件）

#### Test 1: should set invalid move position when invalid move is attempted

- **元のテストタイトル**: should set invalid move position when invalid move is attempted
- **日本語タイトル**: 無効な手が試みられた際、位置と理由が設定されること
- **テスト内容**: handleInvalidMove()を呼び出すと、invalidMovePositionに位置、invalidMoveReasonに理由が設定されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should set invalid move position when invalid move is attempted', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.handleInvalidMove({ row: 2, col: 3 }, 'occupied');
    });

    expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });
    expect(result.current.invalidMoveReason).toBe('occupied');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });
  expect(result.current.invalidMoveReason).toBe('occupied');
  ```
- **削除判定**: [ ] 不要
- **備考**: 無効な手の理由には'occupied'（既に石が置かれている）、'no_flips'（石を反転できない）、'out_of_bounds'（範囲外）がある

---

#### Test 2: should clear invalid move feedback after timeout

- **元のテストタイトル**: should clear invalid move feedback after timeout
- **日本語タイトル**: 2秒後に無効な手のフィードバックが自動クリアされること
- **テスト内容**: handleInvalidMove()を呼び出した後、2秒経過するとinvalidMovePositionとinvalidMoveReasonがnullに戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should clear invalid move feedback after timeout', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.handleInvalidMove({ row: 2, col: 3 }, 'no_flips');
    });

    expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });

    // Fast-forward time by 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.invalidMovePosition).toBeNull();
    expect(result.current.invalidMoveReason).toBeNull();

    jest.useRealTimers();
  });
  ```

- **期待値**:

  ```typescript
  // Immediately after handleInvalidMove
  expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });

  // After 2 seconds
  expect(result.current.invalidMovePosition).toBeNull();
  expect(result.current.invalidMoveReason).toBeNull();
  ```

- **削除判定**: [ ] 不要
- **備考**: タイマーは2秒後に自動的にフィードバックをクリアする

---

#### Test 3: should provide user-friendly error message for each reason

- **元のテストタイトル**: should provide user-friendly error message for each reason
- **日本語タイトル**: 各エラー理由に対してユーザーフレンドリーなメッセージを提供すること
- **テスト内容**: 各無効理由（'occupied', 'no_flips', 'out_of_bounds'）に対して、getErrorMessage()が適切な日本語メッセージを返すことを確認
- **テストコード抜粋**:

  ```typescript
  it('should provide user-friendly error message for each reason', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.handleInvalidMove({ row: 0, col: 0 }, 'occupied');
    });
    expect(result.current.getErrorMessage()).toBe(
      'そのマスには既に石が置かれています'
    );

    act(() => {
      result.current.handleInvalidMove({ row: 0, col: 0 }, 'no_flips');
    });
    expect(result.current.getErrorMessage()).toBe(
      'そのマスに置いても石を反転できません'
    );

    act(() => {
      result.current.handleInvalidMove({ row: 0, col: 0 }, 'out_of_bounds');
    });
    expect(result.current.getErrorMessage()).toBe('無効な位置です');
  });
  ```

- **期待値**:

  ```typescript
  // For 'occupied'
  expect(result.current.getErrorMessage()).toBe(
    'そのマスには既に石が置かれています'
  );

  // For 'no_flips'
  expect(result.current.getErrorMessage()).toBe(
    'そのマスに置いても石を反転できません'
  );

  // For 'out_of_bounds'
  expect(result.current.getErrorMessage()).toBe('無効な位置です');
  ```

- **削除判定**: [ ] 不要
- **備考**: ユーザーフレンドリーな日本語メッセージを提供することで、UXを向上

---

### useGameErrorHandler.test.ts - Game state inconsistency detection (Task 7.3)（3件）

#### Test 4: should detect invalid board state

- **元のテストタイトル**: should detect invalid board state
- **日本語タイトル**: 無効な盤面状態を検出できること
- **テスト内容**: detectInconsistency()を呼び出すと、hasInconsistencyがtrue、inconsistencyReasonに理由が設定されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should detect invalid board state', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.detectInconsistency('invalid_board_size');
    });

    expect(result.current.hasInconsistency).toBe(true);
    expect(result.current.inconsistencyReason).toBe('invalid_board_size');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.hasInconsistency).toBe(true);
  expect(result.current.inconsistencyReason).toBe('invalid_board_size');
  ```
- **削除判定**: [ ] 不要
- **備考**: ゲーム状態の不整合検出（例: 'invalid_board_size', 'corrupted_state'）

---

#### Test 5: should provide reset suggestion message

- **元のテストタイトル**: should provide reset suggestion message
- **日本語タイトル**: 不整合検出時にリセット提案メッセージを提供すること
- **テスト内容**: detectInconsistency()を呼び出すと、getInconsistencyMessage()が「ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。」を返すことを確認
- **テストコード抜粋**:

  ```typescript
  it('should provide reset suggestion message', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.detectInconsistency('corrupted_state');
    });

    expect(result.current.getInconsistencyMessage()).toBe(
      'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。'
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.getInconsistencyMessage()).toBe(
    'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。'
  );
  ```
- **削除判定**: [ ] 不要
- **備考**: ユーザーにゲームリセットを提案する明確なメッセージ

---

#### Test 6: should allow clearing inconsistency flag

- **元のテストタイトル**: should allow clearing inconsistency flag
- **日本語タイトル**: 不整合フラグをクリアできること
- **テスト内容**: detectInconsistency()で不整合を設定した後、clearInconsistency()を呼び出すとhasInconsistencyがfalse、inconsistencyReasonがnullに戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should allow clearing inconsistency flag', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.detectInconsistency('invalid_board_size');
    });

    expect(result.current.hasInconsistency).toBe(true);

    act(() => {
      result.current.clearInconsistency();
    });

    expect(result.current.hasInconsistency).toBe(false);
    expect(result.current.inconsistencyReason).toBeNull();
  });
  ```

- **期待値**:

  ```typescript
  // After detectInconsistency
  expect(result.current.hasInconsistency).toBe(true);

  // After clearInconsistency
  expect(result.current.hasInconsistency).toBe(false);
  expect(result.current.inconsistencyReason).toBeNull();
  ```

- **削除判定**: [ ] 不要
- **備考**: 不整合フラグを手動でクリアする機能（例: ゲームリセット後）

---

### useGameErrorHandler-pass.test.ts - Pass notification functionality (Task 1.2)（6件）

#### Test 7: should set pass notification when player passes

- **元のテストタイトル**: should set pass notification when player passes
- **日本語タイトル**: プレイヤーがパスした際にパス通知が設定されること
- **テスト内容**: notifyPass('black')を呼び出すと、passNotificationに'black'が設定されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should set pass notification when player passes', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.notifyPass('black');
    });

    expect(result.current.passNotification).toBe('black');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.passNotification).toBe('black');
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should clear pass notification after timeout

- **元のテストタイトル**: should clear pass notification after timeout
- **日本語タイトル**: 3秒後にパス通知が自動クリアされること
- **テスト内容**: notifyPass('white')を呼び出した後、3秒経過するとpassNotificationがnullに戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should clear pass notification after timeout', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.notifyPass('white');
    });

    expect(result.current.passNotification).toBe('white');

    // Fast-forward time by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.passNotification).toBeNull();

    jest.useRealTimers();
  });
  ```

- **期待値**:

  ```typescript
  // Immediately after notifyPass
  expect(result.current.passNotification).toBe('white');

  // After 3 seconds
  expect(result.current.passNotification).toBeNull();
  ```

- **削除判定**: [ ] 不要
- **備考**: パス通知は3秒後に自動的にクリアされる（無効な手のフィードバックは2秒）

---

#### Test 9: should provide pass message for user (black player)

- **元のテストタイトル**: should provide pass message for user (black player)
- **日本語タイトル**: ユーザー（黒）のパスメッセージが正しく提供されること
- **テスト内容**: notifyPass('black')を呼び出すと、getPassMessage()が「有効な手がありません。パスしました。」を返すことを確認
- **テストコード抜粋**:

  ```typescript
  it('should provide pass message for user (black player)', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.notifyPass('black');
    });

    expect(result.current.getPassMessage()).toBe(
      '有効な手がありません。パスしました。'
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.getPassMessage()).toBe(
    '有効な手がありません。パスしました。'
  );
  ```
- **削除判定**: [ ] 不要
- **備考**: ユーザー（黒プレイヤー）向けのパスメッセージ

---

#### Test 10: should provide pass message for AI (white player)

- **元のテストタイトル**: should provide pass message for AI (white player)
- **日本語タイトル**: AI（白）のパスメッセージが正しく提供されること
- **テスト内容**: notifyPass('white')を呼び出すと、getPassMessage()が「AIに有効な手がありません。AIがパスしました。」を返すことを確認
- **テストコード抜粋**:

  ```typescript
  it('should provide pass message for AI (white player)', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    act(() => {
      result.current.notifyPass('white');
    });

    expect(result.current.getPassMessage()).toBe(
      'AIに有効な手がありません。AIがパスしました。'
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.getPassMessage()).toBe(
    'AIに有効な手がありません。AIがパスしました。'
  );
  ```
- **削除判定**: [ ] 不要
- **備考**: AI（白プレイヤー）向けのパスメッセージ

---

#### Test 11: should return null when no pass notification is active

- **元のテストタイトル**: should return null when no pass notification is active
- **日本語タイトル**: パス通知が未設定の場合nullを返すこと
- **テスト内容**: パス通知が設定されていない状態でgetPassMessage()を呼び出すと、nullを返すことを確認
- **テストコード抜粋**:

  ```typescript
  it('should return null when no pass notification is active', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    expect(result.current.getPassMessage()).toBeNull();
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.getPassMessage()).toBeNull();
  ```
- **削除判定**: [ ] 不要
- **備考**: パス通知がない場合はnullを返す（メッセージを表示しない）

---

#### Test 12: should clear existing timer when new pass notification is set

- **元のテストタイトル**: should clear existing timer when new pass notification is set
- **日本語タイトル**: 新しいパス通知が設定された際、既存のタイマーがクリアされること
- **テスト内容**: 最初の通知のタイマーが完了する前に新しい通知を設定すると、最初のタイマーがクリアされ、新しいタイマーのみが有効になることを確認
- **テストコード抜粋**:

  ```typescript
  it('should clear existing timer when new pass notification is set', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useGameErrorHandler());

    // First notification
    act(() => {
      result.current.notifyPass('black');
    });

    expect(result.current.passNotification).toBe('black');

    // Advance time partially
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Second notification before first timer expires
    act(() => {
      result.current.notifyPass('white');
    });

    expect(result.current.passNotification).toBe('white');

    // Advance time by remaining 1.5 seconds (total 3 seconds from first)
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // First timer should have been cleared, second notification still active
    expect(result.current.passNotification).toBe('white');

    // Advance another 1.5 seconds to clear second notification
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(result.current.passNotification).toBeNull();

    jest.useRealTimers();
  });
  ```

- **期待値**:

  ```typescript
  // After first notification
  expect(result.current.passNotification).toBe('black');

  // After 1.5 seconds, then second notification
  expect(result.current.passNotification).toBe('white');

  // After another 1.5 seconds (total 3 seconds from first notification)
  // First timer cleared, second notification still active
  expect(result.current.passNotification).toBe('white');

  // After another 1.5 seconds (total 3 seconds from second notification)
  expect(result.current.passNotification).toBeNull();
  ```

- **削除判定**: [ ] 不要
- **備考**: 新しいパス通知が設定されると、古いタイマーは自動的にクリアされる（メモリリーク防止）

---

### useGameErrorHandler-pass.test.ts - Skip notification should be removed (Task 1.2)（3件）

#### Test 13: should not have skipNotification property

- **元のテストタイトル**: should not have skipNotification property
- **日本語タイトル**: skipNotificationプロパティが存在しないこと（パス機能への移行）
- **テスト内容**: useGameErrorHandlerフックがskipNotificationプロパティを持たないことを確認（旧機能からの移行検証）
- **テストコード抜粋**:

  ```typescript
  it('should not have skipNotification property', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    // @ts-expect-error - skipNotification should not exist after migration
    expect(result.current.skipNotification).toBeUndefined();
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.skipNotification).toBeUndefined();
  ```
- **削除判定**: [ ] 不要
- **備考**: スキップ通知からパス通知への移行を検証する重要なテスト（Task 1.2: Replace skip notification with pass notification）

---

#### Test 14: should not have notifyTurnSkip method

- **元のテストタイトル**: should not have notifyTurnSkip method
- **日本語タイトル**: notifyTurnSkipメソッドが存在しないこと（パス機能への移行）
- **テスト内容**: useGameErrorHandlerフックがnotifyTurnSkipメソッドを持たないことを確認（旧機能からの移行検証）
- **テストコード抜粋**:

  ```typescript
  it('should not have notifyTurnSkip method', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    // @ts-expect-error - notifyTurnSkip should not exist after migration
    expect(result.current.notifyTurnSkip).toBeUndefined();
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.notifyTurnSkip).toBeUndefined();
  ```
- **削除判定**: [ ] 不要
- **備考**: 旧メソッド（notifyTurnSkip）が削除され、新メソッド（notifyPass）に置き換えられたことを確認

---

#### Test 15: should not have getSkipMessage method

- **元のテストタイトル**: should not have getSkipMessage method
- **日本語タイトル**: getSkipMessageメソッドが存在しないこと（パス機能への移行）
- **テスト内容**: useGameErrorHandlerフックがgetSkipMessageメソッドを持たないことを確認（旧機能からの移行検証）
- **テストコード抜粋**:

  ```typescript
  it('should not have getSkipMessage method', () => {
    const { result } = renderHook(() => useGameErrorHandler());

    // @ts-expect-error - getSkipMessage should not exist after migration
    expect(result.current.getSkipMessage).toBeUndefined();
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.getSkipMessage).toBeUndefined();
  ```
- **削除判定**: [ ] 不要
- **備考**: 旧メソッド（getSkipMessage）が削除され、新メソッド（getPassMessage）に置き換えられたことを確認

---

## サマリー

### 保持推奨テスト: 15件（全て）

このファイルは**useGameErrorHandlerフック**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 無効な手のフィードバック（3件）: 位置・理由の設定、2秒後の自動クリア、エラーメッセージ
- ゲーム状態不整合検出（3件）: 検出、リセット提案メッセージ、クリア
- パス通知機能（6件）: 設定、3秒後の自動クリア、ユーザー/AIメッセージ、nullケース、タイマー管理
- スキップ通知削除（3件）: 旧機能の非存在確認（移行検証）

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

useGameErrorHandlerのテストは以下の理由で重要です：

- パス通知機能の正確な動作検証（Task 1.2: Replace skip notification with pass notification）
- 無効な手の適切なフィードバック（UX向上）
- ゲーム状態不整合の検出（データ整合性）
- タイマーベースの自動クリア機能（2秒/3秒の適切な管理）
- スキップ通知からパス通知への移行検証（リグレッション防止）
- ユーザーフレンドリーな日本語メッセージ（アクセシビリティ）

変更不要です。

**備考**:

- Task 1.2: Replace skip notification with pass notification（スキップ通知からパス通知への移行）
- Task 7.3: ユーザ入力とビジネスロジックのエラーハンドリング
- 2つのテストファイルを統合したドキュメント（useGameErrorHandler.test.ts: 6テスト、useGameErrorHandler-pass.test.ts: 9テスト）
- 無効な手のフィードバックは2秒後にクリア、パス通知は3秒後にクリア
- 新しいパス通知が設定されると、既存のタイマーは自動的にクリアされる
- @ts-expect-errorを使用して、旧プロパティ/メソッドの非存在を検証
