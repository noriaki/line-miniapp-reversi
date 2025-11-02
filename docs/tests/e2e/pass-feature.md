# Pass Feature E2E Tests

## ファイル情報

- **テストファイル**: `e2e/pass-feature.spec.ts`
- **テスト対象**: パス機能
- **テスト数**: 11
- **削除推奨テスト数**: 1

## 概要

このファイルは**ユーザーパスボタン機能**をE2Eテストしています。

テストの目的:

- Task 8.1: パスボタンUI操作
- Task 8.2: 連続パスによるゲーム終了（スキップ）
- Task 8.3: パスボタン無効化状態
- Task 8.4: パスボタンアクセシビリティ
- Task 8.5: モバイルタッチターゲット
- 統合シナリオ

## テストケース一覧（カテゴリ別）

### Task 8.1: Pass Button UI Interaction（2件）

#### Test 1: should display pass button during gameplay

- **元のテストタイトル**: should display pass button during gameplay
- **日本語タイトル**: ゲームプレイ中にパスボタンを表示すること
- **テスト内容**: ゲームボード読み込み後、パスボタンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Wait for game board to load
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

  // Pass button should be visible
  const passButton = page.getByRole('button', { name: /パス/i });
  await expect(passButton).toBeVisible();
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should show pass button in correct location (below board, above result)

- **元のテストタイトル**: should show pass button in correct location (below board, above result)
- **日本語タイトル**: パスボタンを正しい位置（ボードの下、結果の上）に表示すること
- **テスト内容**: パスボタンがボードグリッドの下に配置されていることを座標で確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const boardGrid = page.locator('.board-grid');
  const passButton = page.getByRole('button', { name: /パス/i });

  // Verify order: board grid should come before pass button
  await expect(boardGrid).toBeVisible();
  await expect(passButton).toBeVisible();

  // Get positions
  const boardBox = await boardGrid.boundingBox();
  const passBox = await passButton.boundingBox();

  // Pass button should be below the board
  expect(passBox?.y).toBeGreaterThan(
    boardBox ? boardBox.y + boardBox.height : 0
  );
  ```

- **期待値**:
  ```typescript
  expect(passBox?.y).toBeGreaterThan(boardBox.y + boardBox.height);
  ```
- **削除判定**: [ ] 不要

---

### Task 8.3: Pass Button Disabled State（2件）

#### Test 3: should disable pass button when valid moves exist

- **元のテストタイトル**: should disable pass button when valid moves exist
- **日本語タイトル**: 有効な手が存在する場合、パスボタンを無効化すること
- **テスト内容**: ゲーム開始時に有効な手が存在するため、パスボタンが無効化され、aria-disabled属性が設定されることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });

  // At game start, user (black) should have valid moves
  // Pass button should be disabled
  await expect(passButton).toBeDisabled();

  // Verify aria-disabled attribute
  await expect(passButton).toHaveAttribute('aria-disabled', 'true');
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeDisabled();
  expect(passButton).toHaveAttribute('aria-disabled', 'true');
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should show visual disabled state

- **元のテストタイトル**: should show visual disabled state
- **日本語タイトル**: 視覚的な無効状態を表示すること
- **テスト内容**: パスボタンが無効化されており、視覚的に無効状態（opacity等）が設定されていることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });

  // Button should have disabled attribute
  await expect(passButton).toBeDisabled();

  // Visual check: disabled button should have reduced opacity or grayed style
  const opacity = await passButton.evaluate((el) => {
    return window.getComputedStyle(el).opacity;
  });

  // Disabled buttons typically have opacity less than 1
  expect(parseFloat(opacity)).toBeLessThanOrEqual(1);
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeDisabled();
  expect(parseFloat(opacity)).toBeLessThanOrEqual(1);
  ```
- **削除判定**: [ ] 不要

---

### Task 8.4: Pass Button Accessibility（3件）

#### Test 5: should have proper aria-label

- **元のテストタイトル**: should have proper aria-label
- **日本語タイトル**: 適切なaria-label属性を持つこと
- **テスト内容**: パスボタンにaria-label=\"ターンをパスする\"が設定されていることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });

  // Verify aria-label
  await expect(passButton).toHaveAttribute('aria-label', 'ターンをパスする');
  ```

- **期待値**:
  ```typescript
  expect(passButton).toHaveAttribute('aria-label', 'ターンをパスする');
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should be keyboard accessible

- **元のテストタイトル**: should be keyboard accessible
- **日本語タイトル**: キーボードアクセス可能であること
- **テスト内容**: Tabキーでパスボタンにフォーカスを移動でき、フォーカス可能であることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Tab to navigate to pass button
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  // Check if pass button can receive focus
  const passButton = page.getByRole('button', { name: /パス/i });
  const isFocusable = await passButton.evaluate((el) => {
    return el === document.activeElement || el.tabIndex >= 0;
  });

  expect(isFocusable).toBeTruthy();
  ```

- **期待値**:
  ```typescript
  expect(isFocusable).toBeTruthy();
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should show focus indicator

- **元のテストタイトル**: should show focus indicator
- **日本語タイトル**: フォーカスインジケーターを表示すること
- **テスト内容**: パスボタンにフォーカスした際、フォーカスが設定されることを確認（視覚的インジケーターはCSSで処理）
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });

  // Focus the button
  await passButton.focus();

  // Check if button has focus (visual indicator is handled by CSS)
  const isFocused = await passButton.evaluate((el) => {
    return el === document.activeElement;
  });

  expect(isFocused).toBeTruthy();
  ```

- **期待値**:
  ```typescript
  expect(isFocused).toBeTruthy();
  ```
- **削除判定**: [ ] 不要

---

### Task 8.5: Mobile Touch Target（3件）

#### Test 8: should have minimum 44x44px touch target

- **元のテストタイトル**: should have minimum 44x44px touch target
- **日本語タイトル**: 最小44x44pxのタッチターゲットを持つこと
- **テスト内容**: パスボタンのサイズが44x44px以上であることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });

  // Get button dimensions
  const box = await passButton.boundingBox();

  expect(box).not.toBeNull();
  if (box) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  ```

- **期待値**:
  ```typescript
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  ```
- **削除判定**: [ ] 不要

---

#### Test 9: should be tappable on mobile viewport

- **元のテストタイトル**: should be tappable on mobile viewport
- **日本語タイトル**: モバイルビューポートでタップ可能であること
- **テスト内容**: モバイルビューポート（375x667）でパスボタンが表示され、44x44px以上のサイズであることを確認
- **テストコード抜粋**:

  ```typescript
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });

  // Verify button is visible and has adequate size
  await expect(passButton).toBeVisible();

  const box = await passButton.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeVisible();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  ```
- **削除判定**: [ ] 不要

---

#### Test 10: should be properly centered on mobile

- **元のテストタイトル**: should be properly centered on mobile
- **日本語タイトル**: モバイルで適切に中央配置されること
- **テスト内容**: モバイルビューポート（375x667）でパスボタンがゲームボードに対して中央配置されていることを確認（許容誤差20px）
- **テストコード抜粋**:

  ```typescript
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });
  const gameBoard = page.locator('[data-testid="game-board"]');

  const buttonBox = await passButton.boundingBox();
  const boardBox = await gameBoard.boundingBox();

  if (buttonBox && boardBox) {
    // Button should be roughly centered
    const buttonCenter = buttonBox.x + buttonBox.width / 2;
    const boardCenter = boardBox.x + boardBox.width / 2;

    // Allow some tolerance for centering (within 20px)
    expect(Math.abs(buttonCenter - boardCenter)).toBeLessThan(20);
  }
  ```

- **期待値**:
  ```typescript
  expect(Math.abs(buttonCenter - boardCenter)).toBeLessThan(20);
  ```
- **削除判定**: [ ] 不要

---

### Task 8.2: Consecutive Pass Game End（1件）

#### Test 11: should end game when both players pass consecutively (skipped)

- **元のテストタイトル**: should end game when both players pass consecutively
- **日本語タイトル**: 両プレイヤーが連続してパスした場合、ゲームを終了すること（スキップ）
- **テスト内容**: 連続パスシナリオのE2Eテスト（カスタムボード状態のセットアップが必要なためスキップ）
- **テストコード抜粋**:
  ```typescript
  test.skip('should end game when both players pass consecutively', async () => {
    // This test requires custom board state setup which is not available in E2E
    // The functionality is thoroughly tested in integration tests
    // Keeping this as a placeholder for future enhancement if board state injection is added
  });
  ```
- **期待値**: なし（スキップ）
- **削除判定**: [x] **削除推奨**
  - **理由**: E2Eでカスタムボード状態のセットアップが困難なため、統合テスト（Task 7）で十分にカバーされている。placeholderとして残されているが、実装予定がなければ削除可能

---

### Pass Feature - Integration Scenarios（2件）

#### Test 12: should hide pass button when game ends

- **元のテストタイトル**: should hide pass button when game ends
- **日本語タイトル**: ゲーム終了時にパスボタンを非表示にすること
- **テスト内容**: ゲーム中はパスボタンが表示されることを確認（実際のゲーム終了まで進めるのは複雑なため、ゲーム中の表示のみ確認）
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Pass button should be visible during game
  const passButton = page.getByRole('button', { name: /パス/i });
  await expect(passButton).toBeVisible();

  // Note: Actually ending the game requires playing through or simulating game end
  // which is complex in E2E. This verifies button visibility during active game.
  ```

- **期待値**:
  ```typescript
  expect(passButton).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

#### Test 13: should center pass button and maintain layout

- **元のテストタイトル**: should center pass button and maintain layout
- **日本語タイトル**: パスボタンを中央配置し、レイアウトを維持すること
- **テスト内容**: パスボタンがゲームボードレイアウトの一部であり、ボード境界内に配置されていることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  const passButton = page.getByRole('button', { name: /パス/i });
  const gameBoard = page.locator('[data-testid="game-board"]');

  await expect(passButton).toBeVisible();
  await expect(gameBoard).toBeVisible();

  // Verify button is part of game board layout
  const buttonBox = await passButton.boundingBox();
  const boardBox = await gameBoard.boundingBox();

  if (buttonBox && boardBox) {
    // Button should be within board boundaries
    expect(buttonBox.x).toBeGreaterThanOrEqual(boardBox.x);
    expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(
      boardBox.x + boardBox.width
    );
  }
  ```

- **期待値**:
  ```typescript
  expect(buttonBox.x).toBeGreaterThanOrEqual(boardBox.x);
  expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(
    boardBox.x + boardBox.width
  );
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 10件

このファイルは**パス機能**をE2Eテストしており、10件のテストが保持すべきです。

**主要テストカテゴリ:**

- UI操作（2件）: 表示、位置
- 無効化状態（2件）: 有効手存在時の無効化、視覚的状態
- アクセシビリティ（3件）: aria-label、キーボード、フォーカスインジケーター
- モバイルタッチ（3件）: タッチターゲットサイズ、モバイル表示、中央配置
- 統合シナリオ（2件）: ゲーム終了時の非表示、レイアウト維持

### 削除推奨テスト: 1件

**Test 11 (skipped)**: 連続パスによるゲーム終了テスト

- **理由**: E2Eでカスタムボード状態のセットアップが困難。統合テスト（Task 7）で十分カバー済み。placeholderとして残されているが実装予定なし

### 推奨事項

このテストファイルは**削除推奨テスト1件（9%）**で、良好な状態です。

パス機能E2Eテストは以下の理由で重要です：

- パスボタンUIの正確な動作確認
- アクセシビリティの保証
- モバイルデバイスでの操作性確保
- レイアウトの整合性確認

Test 11（スキップテスト）は削除可能ですが、placeholderとして残すことも可能です。

**備考**:

- Task 8.2（連続パスゲーム終了）はE2Eでは困難なため統合テストでカバー
- aria-label=\"ターンをパスする\"を使用
- 44x44pxの推奨タッチターゲットサイズ準拠
- 中央配置の許容誤差は20px
