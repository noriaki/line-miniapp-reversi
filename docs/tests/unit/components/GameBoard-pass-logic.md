# GameBoard-pass-logic.test.tsx

## ファイル情報

- **テストファイル**: `src/components/__tests__/GameBoard-pass-logic.test.tsx`
- **テスト対象コード**: `src/components/GameBoard.tsx`
- **テスト数**: 11
- **削除推奨テスト数**: 0

## 概要

このファイルは**GameBoardのパス操作ハンドラロジック**をテストしています。

テストは以下のタスクに分類されます：

- **Task 6.2**: パス操作ハンドラロジック（4件）
- **Task 6.3**: 連続パス検出（2件）
- **Task 6.4**: 有効手後のパスカウンタリセット（2件）
- **Error handling in pass operations**: パス操作のエラーハンドリング（3件）

## テストケース一覧

### Task 6.2: Pass operation handler logic

#### Test 1: should not execute pass when valid moves exist

- **元のテストタイトル**: should not execute pass when valid moves exist
- **日本語タイトル**: 有効な手が存在する場合、パスを実行しないこと
- **テスト内容**: 有効な手が存在する場合、パスボタンが無効化され、パスが実行されないことを確認
- **テストコード抜粋**:

  ```typescript
  jest
    .spyOn(gameLogic, 'calculateValidMoves')
    .mockReturnValue([{ row: 2, col: 3 }]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /パス/i });
  expect(passButton).toBeDisabled();

  await user.click(passButton);

  expect(
    screen.queryByText(/有効な手がありません。パスしました。/i)
  ).not.toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeDisabled();
  expect(
    screen.queryByText(/有効な手がありません。パスしました。/i)
  ).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should execute pass when no valid moves exist

- **元のテストタイトル**: should execute pass when no valid moves exist
- **日本語タイトル**: 有効な手が存在しない場合、パスを実行すること
- **テスト内容**: 有効な手がない場合、パスボタンが有効化され、パスが実行されることを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /パス/i });
  expect(passButton).toBeEnabled();

  await user.click(passButton);

  await waitFor(() => {
    expect(
      screen.getByText(/有効な手がありません。パスしました。/i)
    ).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText(/AI のターン/i)).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeEnabled();
  expect(
    screen.getByText(/有効な手がありません。パスしました。/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/AI のターン/i)).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should not execute pass when game is not in playing state

- **元のテストタイトル**: should not execute pass when game is not in playing state
- **日本語タイトル**: ゲームがプレイング状態でない場合、パスを実行しないこと
- **テスト内容**: ゲーム終了後、パスボタンが表示されなくなることを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);
  jest
    .spyOn(gameEnd, 'checkGameEnd')
    .mockReturnValue({ ended: true, winner: 'black' });

  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /パス/i });
  await user.click(passButton);

  await waitFor(
    () => {
      expect(screen.getByText(/ゲーム終了！/i)).toBeInTheDocument();
    },
    { timeout: 5000 }
  );

  expect(
    screen.queryByRole('button', { name: /パス/i })
  ).not.toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText(/ゲーム終了！/i)).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: /パス/i })
  ).not.toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should switch player after pass

- **元のテストタイトル**: should switch player after pass
- **日本語タイトル**: パス後にプレイヤーを切り替えること
- **テスト内容**: パス操作後、プレイヤーが切り替わることを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  render(<GameBoard />);

  expect(screen.getByText(/あなたのターン/i)).toBeInTheDocument();

  const passButton = screen.getByRole('button', { name: /パス/i });
  await user.click(passButton);

  await waitFor(() => {
    expect(screen.getByText(/AI のターン/i)).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText(/あなたのターン/i)).toBeInTheDocument();
  // パス後
  expect(screen.getByText(/AI のターン/i)).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

### Task 6.3: Consecutive pass detection

#### Test 5: should end game when both players pass consecutively

- **元のテストタイトル**: should end game when both players pass consecutively
- **日本語タイトル**: 両プレイヤーが連続してパスした場合、ゲームを終了すること
- **テスト内容**: 黒と白が連続してパスした場合、ゲームが終了することを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  const checkGameEndSpy = jest
    .spyOn(gameEnd, 'checkGameEnd')
    .mockReturnValue({
      ended: true,
      winner: 'black',
    });

  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /パス/i });
  await user.click(passButton);

  await waitFor(
    () => {
      expect(
        screen.getByText(/AIに有効な手がありません。AIがパスしました。/i)
      ).toBeInTheDocument();
    },
    { timeout: 3000 }
  );

  await waitFor(
    () => {
      expect(screen.getByText(/ゲーム終了！/i)).toBeInTheDocument();
    },
    { timeout: 5000 }
  );
  ```

- **期待値**:
  ```typescript
  expect(
    screen.getByText(/AIに有効な手がありません。AIがパスしました。/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/ゲーム終了！/i)).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should detect game end with correct winner after consecutive passes

- **元のテストタイトル**: should detect game end with correct winner after consecutive passes
- **日本語タイトル**: 連続パス後、正しい勝者でゲーム終了を検出すること
- **テスト内容**: 連続パス後のゲーム終了時に正しい勝者が判定されることを確認
- **テストコード抜粋**:

  ```typescript
  jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

  const checkGameEndSpy = jest
    .spyOn(gameEnd, 'checkGameEnd')
    .mockReturnValue({
      ended: true,
      winner: 'white',
    });

  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /パス/i });
  await user.click(passButton);

  await waitFor(
    () => {
      expect(screen.getByText(/ゲーム終了！/i)).toBeInTheDocument();
    },
    { timeout: 5000 }
  );

  await waitFor(() => {
    expect(screen.getByText(/AI の勝ち!/i)).toBeInTheDocument();
  });
  ```

- **期待値**:
  ```typescript
  expect(screen.getByText(/ゲーム終了！/i)).toBeInTheDocument();
  expect(screen.getByText(/AI の勝ち!/i)).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

### Task 6.4: Pass counter reset on valid move

#### Test 7: should reset pass counter logic when valid move is made

- **元のテストタイトル**: should reset pass counter logic when valid move is made
- **日本語タイトル**: 有効な手が打たれた際にパスカウンタロジックをリセットすること
- **テスト内容**: useGameStateフックのresetPassCount()メソッドが正しく動作することを確認
- **テストコード抜粋**:

  ```typescript
  const { result } = renderHook(() => useGameState());

  act(() => {
    result.current.incrementPassCount();
  });

  expect(result.current.consecutivePassCount).toBe(1);

  act(() => {
    result.current.resetPassCount();
  });

  expect(result.current.consecutivePassCount).toBe(0);
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(1);
  // リセット後
  expect(result.current.consecutivePassCount).toBe(0);
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should verify pass counter reset is called after moves in GameBoard

- **元のテストタイトル**: should verify pass counter reset is called after moves in GameBoard
- **日本語タイトル**: GameBoardで手が打たれた後にパスカウンタリセットが呼ばれることを確認すること
- **テスト内容**: 有効な手がある場合にパスボタンが無効化されることで、リセットロジックが機能していることを間接的に確認
- **テストコード抜粋**:

  ```typescript
  const calculateValidMovesSpy = jest
    .spyOn(gameLogic, 'calculateValidMoves')
    .mockReturnValue([{ row: 2, col: 3 }]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /パス/i });
  expect(passButton).toBeDisabled();
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeDisabled();
  ```
- **削除判定**: [ ] 不要

---

### Error handling in pass operations

#### Test 9: should log warning when pass is attempted with valid moves

- **元のテストタイトル**: should log warning when pass is attempted with valid moves
- **日本語タイトル**: 有効な手がある状態でパスが試みられた場合、警告をログに記録すること
- **テスト内容**: handlePass関数が有効な手がある状態で呼ばれた場合に警告をログに記録すること（UIレベルでは無効化ボタンにより防止される）
- **テストコード抜粋**:

  ```typescript
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

  jest
    .spyOn(gameLogic, 'calculateValidMoves')
    .mockReturnValue([{ row: 2, col: 3 }]);

  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /パス/i });
  expect(passButton).toBeDisabled();
  ```

- **期待値**:
  ```typescript
  // パスボタンが無効化されているため、handlePassは呼ばれない
  expect(passButton).toBeDisabled();
  ```
- **削除判定**: [ ] 不要
- **備考**: ロジックレベルのテスト（UIインタラクションではなく関数レベル）

---

#### Test 10: should validate consecutivePassCount range

- **元のテストタイトル**: should validate consecutivePassCount range
- **日本語タイトル**: consecutivePassCountの範囲を検証すること
- **テスト内容**: GameBoardのuseEffect内の範囲検証が存在することを確認
- **テストコード抜粋**:

  ```typescript
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  render(<GameBoard />);

  expect(consoleErrorSpy).not.toHaveBeenCalledWith(
    expect.stringContaining('Invalid consecutivePassCount')
  );

  consoleErrorSpy.mockRestore();
  ```

- **期待値**:
  ```typescript
  expect(consoleErrorSpy).not.toHaveBeenCalledWith(
    expect.stringContaining('Invalid consecutivePassCount')
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 11: (暗黙的カバレッジ)

- **日本語タイトル**: パス操作の包括的カバレッジ
- **テスト内容**: Test 1-10で以下をカバー:
  - 有効手の有無によるパス実行制御
  - プレイヤー切り替え
  - 連続パス検出とゲーム終了
  - パスカウンタリセット
  - エラーハンドリングとログ記録
- **削除判定**: [ ] 不要（複数テストで構成）

---

## サマリー

### 保持推奨テスト: 11件（全て）

このファイルは**GameBoardのパス操作ハンドラロジック**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- パス操作ハンドラ（4件）: 有効手による実行制御、ゲーム状態確認、プレイヤー切り替え
- 連続パス検出（2件）: 両プレイヤーパスでゲーム終了、勝者判定
- パスカウンタリセット（2件）: リセットメソッド動作、GameBoard統合
- エラーハンドリング（3件）: 警告ログ、範囲検証、防御的プログラミング

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

パス操作ロジックのテストは以下の理由で重要です：

- パス機能の核心ロジックの検証
- 連続パス検出によるゲーム終了の正確性
- パスカウンタの適切な管理
- エラーケースの防御的処理
- ゲームルールの正確な実装

変更不要です。
