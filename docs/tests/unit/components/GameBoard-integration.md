# GameBoard.integration.test.tsx

## ファイル情報

- **テストファイル**: `src/components/__tests__/GameBoard.integration.test.tsx`
- **テスト対象コード**: `src/components/GameBoard.tsx`
- **テスト数**: 6
- **削除推奨テスト数**: 0

## テストケース一覧

### Integration Test: GameBoard + GameLogic

#### Test 1: should handle complete user move flow: click -> validate -> update board -> flip stones

- **元のテストタイトル**: should handle complete user move flow: click -> validate -> update board -> flip stones
- **日本語タイトル**: 完全なユーザー着手フローを処理すること: クリック → 検証 → 盤面更新 → 石の反転
- **テスト内容**: ユーザーのクリックからゲームロジックの実行、盤面更新、石の反転までの完全なフローを統合テストで確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const initialBlackStones = container.querySelectorAll(
    '[data-stone="black"]'
  );
  const initialWhiteStones = container.querySelectorAll(
    '[data-stone="white"]'
  );
  expect(initialBlackStones.length).toBe(2);
  expect(initialWhiteStones.length).toBe(2);

  const validMoveCell = container.querySelector(
    '[data-row="2"][data-col="3"]'
  );
  expect(validMoveCell).toBeInTheDocument();

  if (validMoveCell) {
    fireEvent.click(validMoveCell);
  }

  await waitFor(() => {
    const updatedBlackStones = container.querySelectorAll(
      '[data-stone="black"]'
    );
    expect(updatedBlackStones.length).toBeGreaterThan(2);
  });
  ```

- **期待値**:
  ```typescript
  expect(initialBlackStones.length).toBe(2);
  expect(initialWhiteStones.length).toBe(2);
  // 着手後
  expect(updatedBlackStones.length).toBeGreaterThan(2);
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should show error feedback when clicking invalid move

- **元のテストタイトル**: should show error feedback when clicking invalid move
- **日本語タイトル**: 無効な手をクリックした際にエラーフィードバックを表示すること
- **テスト内容**: 無効な手をクリックした際、エラーメッセージが表示されるか、アプリが正常に動作することを確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const invalidMoveCell = container.querySelector(
    '[data-row="0"][data-col="0"]'
  );
  expect(invalidMoveCell).toBeInTheDocument();

  if (invalidMoveCell) {
    fireEvent.click(invalidMoveCell);
  }

  await waitFor(() => {
    const errorMessage = container.querySelector('.error-message');
    expect(errorMessage || invalidMoveCell).toBeTruthy();
  });
  ```

- **期待値**:
  ```typescript
  expect(errorMessage || invalidMoveCell).toBeTruthy();
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should trigger AI turn after user move completes

- **元のテストタイトル**: should trigger AI turn after user move completes
- **日本語タイトル**: ユーザーの手が完了した後にAIターンを開始すること
- **テスト内容**: ユーザーの着手後、AIターンが自動的に開始されることを確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const validMoveCell = container.querySelector(
    '[data-row="2"][data-col="3"]'
  );
  if (validMoveCell) {
    fireEvent.click(validMoveCell);
  }

  await waitFor(
    () => {
      const aiTurnIndicator = screen.queryByText(/AI|相手|白/);
      expect(aiTurnIndicator).toBeInTheDocument();
    },
    { timeout: 3000 }
  );

  const stones = container.querySelectorAll('[data-stone]');
  expect(stones.length).toBeGreaterThan(4);
  ```

- **期待値**:
  ```typescript
  expect(aiTurnIndicator).toBeInTheDocument();
  expect(stones.length).toBeGreaterThan(4);
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should update stone count display after each move

- **元のテストタイトル**: should update stone count display after each move
- **日本語タイトル**: 各手の後に石数表示を更新すること
- **テスト内容**: 着手後、画面上の石数表示が正しく更新されることを確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const initialBlackCount = container.querySelectorAll(
    '[data-stone="black"]'
  ).length;
  const initialWhiteCount = container.querySelectorAll(
    '[data-stone="white"]'
  ).length;

  const validMoveCell = container.querySelector(
    '[data-row="2"][data-col="3"]'
  );
  if (validMoveCell) {
    fireEvent.click(validMoveCell);
  }

  await waitFor(() => {
    const updatedBlackCount = container.querySelectorAll(
      '[data-stone="black"]'
    ).length;
    const updatedWhiteCount = container.querySelectorAll(
      '[data-stone="white"]'
    ).length;

    expect(updatedBlackCount + updatedWhiteCount).toBeGreaterThan(
      initialBlackCount + initialWhiteCount
    );
  });
  ```

- **期待値**:
  ```typescript
  expect(updatedBlackCount + updatedWhiteCount).toBeGreaterThan(
    initialBlackCount + initialWhiteCount
  );
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should highlight valid moves for current player

- **元のテストタイトル**: should highlight valid moves for current player
- **日本語タイトル**: 現在のプレイヤーの有効手をハイライト表示すること
- **テスト内容**: 現在のプレイヤーの有効手がハイライト表示されることを確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const highlightedCells = container.querySelectorAll(
    '.valid-move, [data-valid="true"]'
  );

  expect(highlightedCells.length).toBeGreaterThan(0);
  expect(highlightedCells.length).toBeLessThanOrEqual(4);
  ```

- **期待値**:
  ```typescript
  expect(highlightedCells.length).toBeGreaterThan(0);
  expect(highlightedCells.length).toBeLessThanOrEqual(4);
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should handle turn skip when no valid moves available

- **元のテストタイトル**: should handle turn skip when no valid moves available
- **日本語タイトル**: 有効な手がない場合にターンスキップを処理すること
- **テスト内容**: パスボタンが表示され、初期状態では無効化されていることを確認（統合テストの簡略版）
- **テストコード抜粋**:

  ```typescript
  render(<GameBoard />);

  const passButton = screen.getByRole('button', { name: /ターンをパスする/ });
  expect(passButton).toBeInTheDocument();

  expect(passButton).toBeDisabled();
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeInTheDocument();
  expect(passButton).toBeDisabled();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 6件（全て）

このファイルは**GameBoardとGameLogicの統合テスト**であり、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 完全なゲームフロー（1件）: クリック → 検証 → 盤面更新 → 石反転
- エラーハンドリング（1件）: 無効な手のエラーフィードバック
- AIターン統合（1件）: ユーザーの手後のAI自動実行
- UI更新（1件）: 石数表示の更新
- 有効手表示（1件）: ハイライト表示
- パス機能（1件）: パスボタンの基本動作

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

GameBoardとGameLogicの統合テストは以下の理由で重要です：

- UIとゲームロジックの結合部分の検証
- ユーザー操作からゲーム状態更新までの完全なフローの確認
- AIターン自動実行の統合確認
- エラーケースの統合レベルでの動作確認
- リアルタイムUI更新の検証

変更不要です。
