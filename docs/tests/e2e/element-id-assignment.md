# Element ID Assignment E2E Tests

## ファイル情報

- **テストファイル**: `e2e/element-id-assignment.spec.ts`
- **テスト対象**: 要素ID割り当て機能
- **テスト数**: 7
- **削除推奨テスト数**: 0

## 概要

このファイルは**セルと履歴要素へのID割り当て機能**をE2Eテストしています。

テストの目的:

- Task 4.1: セルIDによるE2E要素選択テスト
- Task 4.2: 履歴IDによるE2E要素選択テスト（前提条件）
- ID セレクター（#a1、#h8、#c4等）での要素選択検証
- data属性との整合性検証
- ID基盤のクリック操作後のゲーム状態変化確認

## テストケース一覧（カテゴリ別）

### Task 4.1: Cell ID-based Element Selection（6件）

#### Test 1: should select top-left corner cell using #a1 ID

- **元のテストタイトル**: should select top-left corner cell using #a1 ID
- **日本語タイトル**: #a1 IDを使用して左上隅のセルを選択できること
- **テスト内容**: ID \"a1\"でセルを選択し、表示確認とdata属性の整合性（data-row=\"0\"、data-col=\"0\"）を検証
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Select cell using ID
  const cellA1 = page.locator('#a1');

  // Verify cell is visible
  await expect(cellA1).toBeVisible();

  // Verify data attributes consistency
  // Cell "a1" (top-left corner) should have: data-row="0", data-col="0"
  //   - rowIndex=0 → row 1
  //   - colIndex=0 → column 'a'
  await expect(cellA1).toHaveAttribute('data-row', '0');
  await expect(cellA1).toHaveAttribute('data-col', '0');
  ```

- **期待値**:
  ```typescript
  expect(cellA1).toBeVisible();
  expect(cellA1).toHaveAttribute('data-row', '0');
  expect(cellA1).toHaveAttribute('data-col', '0');
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should select bottom-right corner cell using #h8 ID

- **元のテストタイトル**: should select bottom-right corner cell using #h8 ID
- **日本語タイトル**: #h8 IDを使用して右下隅のセルを選択できること
- **テスト内容**: ID \"h8\"でセルを選択し、表示確認とdata属性の整合性（data-row=\"7\"、data-col=\"7\"）を検証
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Select cell using ID
  const cellH8 = page.locator('#h8');

  // Verify cell is visible
  await expect(cellH8).toBeVisible();

  // Verify data attributes consistency
  // Cell "h8" (bottom-right corner) should have: data-row="7", data-col="7"
  //   - rowIndex=7 → row 8
  //   - colIndex=7 → column 'h'
  await expect(cellH8).toHaveAttribute('data-row', '7');
  await expect(cellH8).toHaveAttribute('data-col', '7');
  ```

- **期待値**:
  ```typescript
  expect(cellH8).toBeVisible();
  expect(cellH8).toHaveAttribute('data-row', '7');
  expect(cellH8).toHaveAttribute('data-col', '7');
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should click cell using ID and verify game state change

- **元のテストタイトル**: should click cell using ID and verify game state change
- **日本語タイトル**: IDを使用してセルをクリックし、ゲーム状態の変化を検証できること
- **テスト内容**: ID \"c4\"でセルをクリックし、有効手であることを確認後、石配置、着手履歴追加、有効手フラグ削除を検証
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Cell c4 (rowIndex=3, colIndex=2) is a valid opening move
  const cellC4 = page.locator('#c4');

  // Verify it's a valid move (should have data-valid attribute)
  await expect(cellC4).toHaveAttribute('data-valid', 'true');

  // Click the cell using ID selector
  await cellC4.click();

  await page.waitForTimeout(500);

  // Verify game state changed:
  // 1. Cell should now have a black stone
  await expect(cellC4).toHaveAttribute('data-stone', 'black');

  // 2. Move history should be visible and contain "c4"
  const moveHistory = page.locator('#history');
  await expect(moveHistory).toBeVisible();
  await expect(moveHistory).toContainText('c4');

  // 3. It should no longer be a valid move (stone placed)
  await expect(cellC4).not.toHaveAttribute('data-valid', 'true');
  ```

- **期待値**:
  ```typescript
  expect(cellC4).toHaveAttribute('data-valid', 'true');
  expect(cellC4).toHaveAttribute('data-stone', 'black');
  expect(moveHistory).toBeVisible();
  expect(moveHistory).toContainText('c4');
  expect(cellC4).not.toHaveAttribute('data-valid', 'true');
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should verify data-row and data-col consistency across multiple cells

- **元のテストタイトル**: should verify data-row and data-col consistency across multiple cells
- **日本語タイトル**: 複数セルにわたってdata-rowとdata-colの整合性を検証できること
- **テスト内容**: 7つの代表的なセル（a1、a8、h1、h8、c4、d5、e6）でIDとdata属性のマッピングが正確であることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Test multiple cells to ensure consistent ID-to-data mapping
  const testCases = [
    { id: 'a1', row: '0', col: '0' }, // Top-left: rowIndex=0, colIndex=0
    { id: 'a8', row: '7', col: '0' }, // Bottom-left: rowIndex=7, colIndex=0
    { id: 'h1', row: '0', col: '7' }, // Top-right: rowIndex=0, colIndex=7
    { id: 'h8', row: '7', col: '7' }, // Bottom-right: rowIndex=7, colIndex=7
    { id: 'c4', row: '3', col: '2' }, // Center: rowIndex=3, colIndex=2
    { id: 'd5', row: '4', col: '3' }, // Center: rowIndex=4, colIndex=3
    { id: 'e6', row: '5', col: '4' }, // Center: rowIndex=5, colIndex=4
  ];

  for (const testCase of testCases) {
    const cell = page.locator(`#${testCase.id}`);
    await expect(cell).toBeVisible();
    await expect(cell).toHaveAttribute('data-row', testCase.row);
    await expect(cell).toHaveAttribute('data-col', testCase.col);
  }
  ```

- **期待値**:
  ```typescript
  // 各セルに対して
  expect(cell).toBeVisible();
  expect(cell).toHaveAttribute('data-row', testCase.row);
  expect(cell).toHaveAttribute('data-col', testCase.col);
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should allow E2E tests to reliably select specific cells by ID

- **元のテストタイトル**: should allow E2E tests to reliably select specific cells by ID
- **日本語タイトル**: E2EテストがIDで特定セルを確実に選択できること
- **テスト内容**: 全64セル（a1～h8）が一意のIDを持ち、各セルが正確に1つだけ存在することを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Verify all 64 cells have unique IDs
  // Columns: a-h (0-7), Rows: 1-8 (0-7)
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

  for (const col of columns) {
    for (const row of rows) {
      const cellId = `${col}${row}`;
      const cell = page.locator(`#${cellId}`);

      // Each cell should be uniquely identifiable by its ID
      await expect(cell).toHaveCount(1); // Exactly one element with this ID
    }
  }
  ```

- **期待値**:
  ```typescript
  // 全64セルに対して
  expect(cell).toHaveCount(1);
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should select cells using ID after AI move

- **元のテストタイトル**: should select cells using ID after AI move
- **日本語タイトル**: AI着手後もIDを使用してセルを選択できること
- **テスト内容**: 最初の手をプレイ、AI着手待機後、有効手のIDを取得して選択し、ゲーム状態が変化することを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Make first move
  const cellC4 = page.locator('#c4');
  await cellC4.click();
  await page.waitForTimeout(500);

  // Wait for AI move
  await page.waitForTimeout(3000);

  // After AI move, verify we can still select cells by ID
  const validMoves = page.locator('[data-valid="true"]');
  const firstValidMove = validMoves.first();

  // Get the ID of the first valid move
  const validCellId = await firstValidMove.getAttribute('id');
  expect(validCellId).not.toBeNull();
  expect(validCellId).toMatch(/^[a-h][1-8]$/);

  // Verify we can select it using the ID
  const validCell = page.locator(`#${validCellId}`);
  await expect(validCell).toBeVisible();
  await expect(validCell).toHaveAttribute('data-valid', 'true');

  // Click using ID
  await validCell.click();
  await page.waitForTimeout(500);

  // Verify state changed
  await expect(validCell).toHaveAttribute('data-stone', 'black');
  ```

- **期待値**:
  ```typescript
  expect(validCellId).not.toBeNull();
  expect(validCellId).toMatch(/^[a-h][1-8]$/);
  expect(validCell).toBeVisible();
  expect(validCell).toHaveAttribute('data-valid', 'true');
  expect(validCell).toHaveAttribute('data-stone', 'black');
  ```
- **削除判定**: [ ] 不要

---

### Task 4.2: History ID-based Element Selection (Prerequisite)（2件）

#### Test 7: should not display history initially (no moves)

- **元のテストタイトル**: should not display history initially (no moves)
- **日本語タイトル**: 初期状態では履歴を表示しないこと（着手なし）
- **テスト内容**: ゲーム開始直後、ID \"history\"の要素が表示されないことを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Initially, history should not be visible
  const history = page.locator('#history');
  await expect(history).not.toBeVisible();
  ```

- **期待値**:
  ```typescript
  expect(history).not.toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should select history using #history ID after moves

- **元のテストタイトル**: should select history using #history ID after moves
- **日本語タイトル**: 着手後に#history IDを使用して履歴を選択できること
- **テスト内容**: 着手後、ID \"history\"で履歴要素を選択でき、data-testid=\"move-history\"と同一要素であることを確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');

  // Make a move
  const cellC4 = page.locator('#c4');
  await cellC4.click();
  await page.waitForTimeout(500);

  // History should now be visible with ID
  const history = page.locator('#history');
  await expect(history).toBeVisible();

  // Verify it's the same element as data-testid selector
  const historyByTestId = page.locator('[data-testid="move-history"]');
  await expect(historyByTestId).toBeVisible();

  // Both selectors should point to the same element
  const historyCount = await history.count();
  expect(historyCount).toBe(1);
  ```

- **期待値**:
  ```typescript
  expect(history).toBeVisible();
  expect(historyByTestId).toBeVisible();
  expect(historyCount).toBe(1);
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 7件（全て）

このファイルは**要素ID割り当て機能**をE2Eテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- セルID選択（6件）: 四隅、中央セル、複数セル、全64セル、AI着手後
- 履歴ID選択（2件）: 初期状態、着手後

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

要素ID割り当てE2Eテストは以下の理由で重要です：

- E2Eテストの信頼性向上（安定したセレクター）
- 座標マッピングの正確性検証
- ID属性とdata属性の整合性保証
- ゲーム状態変化の検証

変更不要です。

**備考**:

- ID形式: `[a-h][1-8]`（棋譜形式）
- 座標マッピング:
  - colIndex (0-7) → column letter (a-h)
  - rowIndex (0-7) → row number (1-8)
- セルID: 左上a1、右下h8
- 履歴ID: \"history\"
- 全64セルの一意性検証
