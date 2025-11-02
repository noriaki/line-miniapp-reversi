# Move History Display E2E Tests

## ファイル情報

- **テストファイル**: `e2e/move-history.spec.ts`
- **テスト対象**: 着手履歴表示機能
- **テスト数**: 11
- **削除推奨テスト数**: 0

## 概要

このファイルは**着手履歴表示機能**をE2Eテストしています。

テストの目的:

- Task 5: 基本的な着手履歴表示
- Task 5.1: 長い履歴の水平スクロール
- Task 5.2: ゲームリセット時の履歴クリア
- 着手後の履歴更新確認
- 複数着手の記録確認
- モバイルデバイスでのスクロール対応

## テストケース一覧（カテゴリ別）

### Task 5: Basic Move History Display（4件）

#### Test 1: should display move history area at bottom of game board

- **元のテストタイトル**: should display move history area at bottom of game board
- **日本語タイトル**: ゲームボードの下部に着手履歴エリアを表示すること
- **テスト内容**: ゲームボードが表示され、初期状態では着手履歴が表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Verify game board is visible
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

  // Initially, move history should not be visible (no moves yet)
  const moveHistory = page.locator('[data-testid="move-history"]');
  await expect(moveHistory).not.toBeVisible();
  ```

- **期待値**:
  ```typescript
  expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  expect(moveHistory).not.toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should update move history after user makes a move

- **元のテストタイトル**: should update move history after user makes a move
- **日本語タイトル**: ユーザーが着手した後に着手履歴を更新すること
- **テスト内容**: ユーザー着手後、履歴が表示され、正しい棋譜（d3）が含まれることを確認（座標マッピング: data-row=2, data-col=3 → d3）
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Make user's first move (black player)
  // data-row="2", data-col="3" converts to "d3"
  //   - colIndex=3 → column 'd'
  //   - rowIndex=2 → row '3'
  const validMoveCell = page.locator('[data-row="2"][data-col="3"]');
  await validMoveCell.click();

  await page.waitForTimeout(500);

  // Move history should now be visible
  const moveHistory = page.locator('[data-testid="move-history"]');
  await expect(moveHistory).toBeVisible();

  // Should contain the notation for the move (d3)
  const notationText = moveHistory.locator('div').first();
  await expect(notationText).toContainText('d3');
  ```

- **期待値**:
  ```typescript
  expect(moveHistory).toBeVisible();
  expect(notationText).toContainText('d3');
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should update move history after AI makes a move

- **元のテストタイトル**: should update move history after AI makes a move
- **日本語タイトル**: AIが着手した後に着手履歴を更新すること
- **テスト内容**: ユーザーとAIの着手後、履歴が両方の手を含み、最低4文字（2手=4文字）以上であることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Make user's first move
  const validMoveCell = page.locator('[data-row="2"][data-col="3"]');
  await validMoveCell.click();

  // Wait for AI turn
  await expect(page.getByText(/AI|相手|白/)).toBeVisible({
    timeout: 5000,
  });

  // Wait for AI to complete its move
  await page.waitForTimeout(3000);

  // Move history should contain both moves (user + AI)
  const moveHistory = page.locator('[data-testid="move-history"]');
  const notationText = moveHistory.locator('div').first();
  const text = await notationText.textContent();

  // Should contain at least 4 characters (2 moves = 4 chars minimum)
  expect(text).not.toBeNull();
  expect(text!.length).toBeGreaterThanOrEqual(4);
  ```

- **期待値**:
  ```typescript
  expect(text).not.toBeNull();
  expect(text!.length).toBeGreaterThanOrEqual(4);
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should display expected notation string after 3 moves

- **元のテストタイトル**: should display expected notation string after 3 moves
- **日本語タイトル**: 3手後に期待される棋譜文字列を表示すること
- **テスト内容**: 3手プレイ後、履歴が最低6文字（3手=6文字）以上で、棋譜形式（[a-h][1-8]の繰り返し）に従うことを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Move 1: User (black) plays d3
  await page.locator('[data-row="2"][data-col="3"]').click();
  await page.waitForTimeout(500);

  // Wait for AI move (Move 2)
  await page.waitForTimeout(3000);

  // Check if game is still playing (not ended)
  const gameResult = page.locator('[data-testid="game-result"]');
  const isGameOver = await gameResult.isVisible();
  if (isGameOver) {
    console.log('Game ended before 3 moves');
    return;
  }

  // Move 3: User (black) plays again
  const validMoves = page.locator('[data-valid="true"]');
  const count = await validMoves.count();
  if (count > 0) {
    await validMoves.first().click();
    await page.waitForTimeout(500);
  }

  // Move history should contain 3 moves (6 characters total)
  const moveHistory = page.locator('[data-testid="move-history"]');
  const notationText = moveHistory.locator('div').first();
  const text = await notationText.textContent();

  expect(text).not.toBeNull();
  expect(text!.length).toBeGreaterThanOrEqual(6);
  expect(text).toMatch(/^([a-h][1-8])+$/);
  ```

- **期待値**:
  ```typescript
  expect(text).not.toBeNull();
  expect(text!.length).toBeGreaterThanOrEqual(6);
  expect(text).toMatch(/^([a-h][1-8])+$/);
  ```
- **削除判定**: [ ] 不要

---

### Task 5.1: Long Move History Horizontal Scrolling（3件）

#### Test 5: should support horizontal scrolling for long move history (40+ moves)

- **元のテストタイトル**: should support horizontal scrolling for long move history (40+ moves)
- **日本語タイトル**: 長い着手履歴（40手以上）の水平スクロールをサポートすること
- **テスト内容**: 40手プレイ後、履歴にoverflow-x: autoが適用され、長い文字列（20文字以上）が表示されることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Play multiple moves to generate long history
  await playMultipleMoves(page, 40);

  const moveHistory = page.locator('[data-testid="move-history"]');
  const gameResult = page.locator('[data-testid="game-result"]');
  const isGameOver = await gameResult.isVisible();

  if (isGameOver) {
    console.log('Game ended before 40 moves, skipping long scroll test');
    return;
  }

  await expect(moveHistory).toBeVisible();

  // Check that overflow-x: auto is applied (scroll capability)
  const overflowX = await moveHistory.evaluate((el) => {
    return window.getComputedStyle(el).overflowX;
  });
  expect(overflowX).toBe('auto');

  // Get the notation text
  const notationText = moveHistory.locator('div').first();
  const text = await notationText.textContent();

  // Should be a long string
  expect(text).not.toBeNull();
  expect(text!.length).toBeGreaterThan(20); // At least 10+ moves
  ```

- **期待値**:
  ```typescript
  expect(moveHistory).toBeVisible();
  expect(overflowX).toBe('auto');
  expect(text).not.toBeNull();
  expect(text!.length).toBeGreaterThan(20);
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should display complete text without truncation in scrollable area

- **元のテストタイトル**: should display complete text without truncation in scrollable area
- **日本語タイトル**: スクロール可能エリアで切り詰めなしに完全なテキストを表示すること
- **テスト内容**: 30手プレイ後、whitespace: nowrapが適用され、テキストが省略記号なしで完全に表示され、棋譜形式に従うことを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Play multiple moves
  await playMultipleMoves(page, 30);

  const moveHistory = page.locator('[data-testid="move-history"]');
  const notationText = moveHistory.locator('div').first();

  // Check whitespace-nowrap is applied
  const whiteSpace = await notationText.evaluate((el) => {
    return window.getComputedStyle(el).whiteSpace;
  });
  expect(whiteSpace).toBe('nowrap');

  // Text should not be truncated (no ellipsis)
  const text = await notationText.textContent();
  expect(text).not.toBeNull();
  expect(text).not.toContain('...');
  expect(text).toMatch(/^([a-h][1-8])+$/);
  ```

- **期待値**:
  ```typescript
  expect(whiteSpace).toBe('nowrap');
  expect(text).not.toContain('...');
  expect(text).toMatch(/^([a-h][1-8])+$/);
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should be scrollable on mobile devices

- **元のテストタイトル**: should be scrollable on mobile devices
- **日本語タイトル**: モバイルデバイスでスクロール可能であること
- **テスト内容**: モバイルビューポート（375x667）で25手プレイ後、履歴がスクロール可能（scrollWidth > clientWidth）であることを確認
- **テストコード抜粋**:

  ```typescript
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // Play multiple moves
  await playMultipleMoves(page, 25);

  const moveHistory = page.locator('[data-testid="move-history"]');
  await expect(moveHistory).toBeVisible();

  // Verify scrollable behavior
  const isScrollable = await moveHistory.evaluate((el) => {
    return el.scrollWidth > el.clientWidth;
  });

  if (isScrollable) {
    const scrollWidth = await moveHistory.evaluate((el) => el.scrollWidth);
    const clientWidth = await moveHistory.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  }
  ```

- **期待値**:
  ```typescript
  expect(moveHistory).toBeVisible();
  if (isScrollable) {
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  }
  ```
- **削除判定**: [ ] 不要

---

### Task 5.2: Game Reset Clears Move History（3件）

#### Test 8: should clear move history after game reset

- **元のテストタイトル**: should clear move history after game reset
- **日本語タイトル**: ゲームリセット後に着手履歴をクリアすること
- **テスト内容**: 着手後に履歴が表示され、リロード（リセット）後に履歴が非表示になり、新たな着手後に再度表示されることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Play a few moves
  await page.locator('[data-row="2"][data-col="3"]').click();
  await page.waitForTimeout(500);

  // Wait for AI move
  await page.waitForTimeout(3000);

  // Play another user move
  const validMoves = page.locator('[data-valid="true"]');
  const count = await validMoves.count();
  if (count > 0) {
    await validMoves.first().click();
    await page.waitForTimeout(500);
  }

  // Verify move history exists
  const moveHistory = page.locator('[data-testid="move-history"]');
  await expect(moveHistory).toBeVisible();

  // Reset game by reloading the page
  await page.reload();
  await page.waitForTimeout(500);

  // After reset, move history should not be visible (no moves yet)
  await expect(moveHistory).not.toBeVisible();

  // Make a move after reset to verify move history can display again
  const validMovesAfterReset = page.locator('[data-valid="true"]');
  if ((await validMovesAfterReset.count()) > 0) {
    await validMovesAfterReset.first().click();
    await page.waitForTimeout(500);
    // Now move history should be visible with new move
    await expect(moveHistory).toBeVisible();
  }
  ```

- **期待値**:

  ```typescript
  // リセット前
  expect(moveHistory).toBeVisible();

  // リセット後
  expect(moveHistory).not.toBeVisible();

  // 新着手後
  expect(moveHistory).toBeVisible();
  ```

- **削除判定**: [ ] 不要

---

#### Test 9: should record new move history correctly after reset

- **元のテストタイトル**: should record new move history correctly after reset
- **日本語タイトル**: リセット後に新しい着手履歴を正しく記録すること
- **テスト内容**: 初回ゲーム、リセット、新ゲームと進み、新ゲームの履歴が正しい棋譜形式で記録されることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Play initial moves
  const validMoves = page.locator('[data-valid="true"]');
  await validMoves.first().click();
  await page.waitForTimeout(500);
  await page.waitForTimeout(3000); // Wait for AI move

  // Reset game (reload page simulates reset)
  await page.reload();
  await page.waitForTimeout(500);

  const moveHistory = page.locator('[data-testid="move-history"]');
  await expect(moveHistory).not.toBeVisible();

  // Play move in new game
  const validMovesAfterReset = page.locator('[data-valid="true"]');
  const count = await validMovesAfterReset.count();
  if (count > 1) {
    await validMovesAfterReset.nth(1).click();
  } else if (count > 0) {
    await validMovesAfterReset.first().click();
  }
  await page.waitForTimeout(500);

  // New move history should be visible
  await expect(moveHistory).toBeVisible();

  // Get new game's move history
  const newGameText = await moveHistory.locator('div').first().textContent();

  expect(newGameText).not.toBeNull();
  expect(newGameText).toMatch(/^[a-h][1-8]/);
  ```

- **期待値**:
  ```typescript
  expect(moveHistory).not.toBeVisible(); // リセット後
  expect(moveHistory).toBeVisible(); // 新着手後
  expect(newGameText).toMatch(/^[a-h][1-8]/);
  ```
- **削除判定**: [ ] 不要

---

#### Test 10: should handle multiple resets correctly

- **元のテストタイトル**: should handle multiple resets correctly
- **日本語タイトル**: 複数のリセットを正しく処理できること
- **テスト内容**: 3回のゲーム（2回のリセット）を通じて、各リセット後に履歴が非表示になり、着手後に再表示されることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const moveHistory = page.locator('[data-testid="move-history"]');

  // First game
  const validMoves1 = page.locator('[data-valid="true"]');
  await validMoves1.first().click();
  await page.waitForTimeout(500);
  await expect(moveHistory).toBeVisible();

  // Reset 1
  await page.reload();
  await page.waitForTimeout(500);
  await expect(moveHistory).not.toBeVisible();

  // Second game
  const validMoves2 = page.locator('[data-valid="true"]');
  if ((await validMoves2.count()) > 0) {
    await validMoves2.first().click();
    await page.waitForTimeout(500);
    await expect(moveHistory).toBeVisible();
  }

  // Reset 2
  await page.reload();
  await page.waitForTimeout(500);
  await expect(moveHistory).not.toBeVisible();

  // Third game
  const validMoves3 = page.locator('[data-valid="true"]');
  if ((await validMoves3.count()) > 0) {
    await validMoves3.first().click();
    await page.waitForTimeout(500);
    await expect(moveHistory).toBeVisible();

    const finalText = await moveHistory.locator('div').first().textContent();
    expect(finalText).not.toBeNull();
    expect(finalText).toMatch(/^[a-h][1-8]/);
  }
  ```

- **期待値**:
  ```typescript
  // 各ゲームサイクルで
  expect(moveHistory).toBeVisible(); // 着手後
  expect(moveHistory).not.toBeVisible(); // リセット後
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 11件（全て）

このファイルは**着手履歴表示機能**をE2Eテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 基本表示（4件）: 初期非表示、ユーザー着手後、AI着手後、3手後
- 水平スクロール（3件）: 40手以上、切り詰めなし、モバイル
- リセット（3件）: クリア、新記録、複数リセット
- ヘルパー関数（1件）: playMultipleMoves（40手、30手、25手のプレイ自動化）

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

着手履歴表示E2Eテストは以下の理由で重要です：

- 着手履歴の正確な記録と表示
- 長い履歴のスクロール対応
- ゲームリセット時の適切なクリア
- モバイルデバイスでの使いやすさ

変更不要です。

**備考**:

- playMultipleMoves()ヘルパー関数で複数手の自動プレイ
- 棋譜形式: `[a-h][1-8]`の繰り返し
- overflow-x: auto、whitespace: nowrapでスクロール実装
- ゲーム終了判定でテスト早期終了を防止
- 座標マッピング: data-row/data-col → 棋譜形式
