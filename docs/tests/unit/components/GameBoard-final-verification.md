# GameBoard Final Verification Tests

## ファイル情報

- **テストファイル**: `src/components/__tests__/GameBoard.final-verification.test.tsx`
- **テスト対象コード**: `src/components/GameBoard.tsx`
- **テスト数**: 20
- **削除推奨テスト数**: 0

## 概要

このファイルは**要素ID割り当て機能（element-id-assignment）の最終検証テスト（Task 5）** です。

テスト戦略:

- **RED**: 包括的な検証テストを作成
- **GREEN**: 全テストがパス（Tasks 1-4で実装完了済み）
- **REFACTOR**: 全要件が満たされていることを確認

検証対象の要件:

1. 全テストスイート（unit、integration）が成功すること
2. ID属性の一意性（64セルID + 1履歴ID = 65個の一意ID）
3. 既存機能（クリックイベント、スタイリング、石の配置、履歴表示）が正常動作すること
4. ビルドと型チェックが成功すること（CI/CDで検証）

テストは以下の9つの要件カテゴリに分類されます：

- **Requirement 1**: ID属性の一意性（4件）
- **Requirement 2**: 既存機能 - クリックイベント（2件）
- **Requirement 3**: 既存機能 - スタイリング（2件）
- **Requirement 4**: 既存機能 - 石の配置（2件）
- **Requirement 5**: 既存機能 - 着手履歴表示（2件）
- **Requirement 6**: アクセシビリティ - aria-label属性（2件）
- **Requirement 7**: data属性の一貫性（2件）
- **Requirement 8**: 座標マッピングの正確性（2件）
- **Requirement 9**: リグレッションなし - 既存テスト（4件）

## テストケース一覧

### Requirement 1: ID Attribute Uniqueness (64 cell IDs + 1 history ID)

#### Test 1: should generate exactly 64 unique cell IDs (a1-h8)

- **元のテストタイトル**: should generate exactly 64 unique cell IDs (a1-h8)
- **日本語タイトル**: 正確に64個の一意なセルID（a1-h8）を生成すること
- **テスト内容**: GameBoardをレンダリングし、.board-cell[id]セレクターで64個の要素が存在すること、全てのIDが一意であること（Set.sizeが64であること）、全てのIDが/^[a-h][1-8]$/形式にマッチすることを確認する
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  // Get all cell buttons with id attributes
  const cellsWithIds = container.querySelectorAll('.board-cell[id]');
  expect(cellsWithIds.length).toBe(64);

  // Collect all IDs
  const ids = Array.from(cellsWithIds).map((cell) => cell.id);

  // Verify uniqueness: Set size should equal array length
  const uniqueIds = new Set(ids);
  expect(uniqueIds.size).toBe(64);

  // Verify ID format: all should match /^[a-h][1-8]$/
  ids.forEach((id) => {
    expect(id).toMatch(/^[a-h][1-8]$/);
  });
  ```

- **期待値**:
  ```typescript
  expect(cellsWithIds.length).toBe(64);
  expect(uniqueIds.size).toBe(64);
  // For each ID:
  expect(id).toMatch(/^[a-h][1-8]$/);
  ```
- **削除判定**: [ ] 不要
- **備考**: ID属性の一意性と形式の検証。チェス記法形式（a1-h8）を使用。

---

#### Test 2: should verify complete ID coverage: all combinations of [a-h] x [1-8]

- **元のテストタイトル**: should verify complete ID coverage: all combinations of [a-h] x [1-8]
- **日本語タイトル**: 完全なIDカバレッジ（[a-h] x [1-8]の全組み合わせ）を検証すること
- **テスト内容**: 列（a-h）と行（1-8）の全組み合わせ（64通り）について、各セルIDがDOM内に存在し、正しいid属性値を持つことを確認する。例: a1, b2, ..., h8
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

  for (const col of columns) {
    for (const row of rows) {
      const cellId = `${col}${row}`;
      const cell = container.querySelector(`#${cellId}`);
      expect(cell).toBeInTheDocument();
      expect(cell).toHaveAttribute('id', cellId);
    }
  }
  ```

- **期待値**:
  ```typescript
  // For each combination of col (a-h) and row (1-8):
  expect(cell).toBeInTheDocument();
  expect(cell).toHaveAttribute('id', cellId);
  ```
- **削除判定**: [ ] 不要
- **備考**: 64通りの全組み合わせを網羅的にチェック。IDの欠損や誤ったマッピングを防ぐ。

---

#### Test 3: should assign history ID after first move (65th unique ID)

- **元のテストタイトル**: should assign history ID after first move (65th unique ID)
- **日本語タイトル**: 最初の手の後に履歴ID（65番目の一意ID）を割り当てること
- **テスト内容**: 初期状態では#historyが存在しないこと、有効な手（c4）をクリックした後、waitForで#historyがDOMに表示され、id="history"属性を持つことを確認する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Initially, history should not exist
  let history = container.querySelector('#history');
  expect(history).not.toBeInTheDocument();

  // Make a valid move (c4)
  const validCell = container.querySelector('[data-row="3"][data-col="2"]');
  expect(validCell).toBeInTheDocument();
  await user.click(validCell!);

  // Wait for state update
  await waitFor(() => {
    history = container.querySelector('#history');
    expect(history).toBeInTheDocument();
  });

  // Verify history has correct ID
  expect(history).toHaveAttribute('id', 'history');
  ```

- **期待値**:

  ```typescript
  // Before move:
  expect(history).not.toBeInTheDocument();

  // After move:
  expect(history).toBeInTheDocument();
  expect(history).toHaveAttribute('id', 'history');
  ```

- **削除判定**: [ ] 不要
- **備考**: 64セルID + 1履歴ID = 65個の一意IDの検証。履歴は最初の手の後に表示される。

---

#### Test 4: should ensure no ID duplication across all elements (65 total)

- **元のテストタイトル**: should ensure no ID duplication across all elements (65 total)
- **日本語タイトル**: 全要素（65個合計）でID重複がないことを保証すること
- **テスト内容**: 手を実行して履歴を表示させた後、container内の全[id]要素を取得し、全IDが一意であること（配列長 === Set.size）、最低65個のIDが存在することを確認する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Make a move to trigger history display
  const validCell = container.querySelector('[data-row="3"][data-col="2"]');
  await user.click(validCell!);

  await waitFor(() => {
    const history = container.querySelector('#history');
    expect(history).toBeInTheDocument();
  });

  // Get ALL elements with id attribute in the entire DOM
  const allElementsWithIds = container.querySelectorAll('[id]');
  const allIds = Array.from(allElementsWithIds).map((el) => el.id);

  // Verify uniqueness: Set size should equal array length
  const uniqueIds = new Set(allIds);
  expect(allIds.length).toBe(uniqueIds.size);

  // Verify we have at least 65 IDs (64 cells + 1 history)
  expect(allIds.length).toBeGreaterThanOrEqual(65);
  ```

- **期待値**:
  ```typescript
  expect(allIds.length).toBe(uniqueIds.size); // 一意性確認
  expect(allIds.length).toBeGreaterThanOrEqual(65); // 最低65個
  ```
- **削除判定**: [ ] 不要
- **備考**: DOM全体でID重複がないことを保証。64セルID + 1履歴ID = 最低65個。

---

### Requirement 2: Existing Functionality - Click Events

#### Test 5: should trigger click events on cells using ID selectors

- **元のテストタイトル**: should trigger click events on cells using ID selectors
- **日本語タイトル**: IDセレクターを使用してセルでクリックイベントをトリガーできること
- **テスト内容**: #c4セレクターでセルを取得し、data-valid="true"であることを確認、クリック後にwaitForでdata-stone="black"に変化することを確認。IDセレクターでのクリックイベントが正常動作することを検証する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Select cell using ID
  const cellC4 = container.querySelector('#c4');
  expect(cellC4).toBeInTheDocument();
  expect(cellC4).toHaveAttribute('data-valid', 'true');

  // Click using ID selector
  await user.click(cellC4!);

  // Verify state changed: cell now has black stone
  await waitFor(() => {
    expect(cellC4).toHaveAttribute('data-stone', 'black');
  });
  ```

- **期待値**:
  ```typescript
  expect(cellC4).toBeInTheDocument();
  expect(cellC4).toHaveAttribute('data-valid', 'true');
  // After click:
  expect(cellC4).toHaveAttribute('data-stone', 'black');
  ```
- **削除判定**: [ ] 不要
- **備考**: IDセレクター（#c4）でのクリックが正常動作することを確認。ID属性追加が既存機能を破壊していないことを保証。

---

#### Test 6: should maintain click event handlers after ID attribute addition

- **元のテストタイトル**: should maintain click event handlers after ID attribute addition
- **日本語タイトル**: ID属性追加後もクリックイベントハンドラーを維持すること
- **テスト内容**: 複数のセル（d3, c4, f5, e6）をIDセレクターで取得し、data-row/data-col属性が正しいこと、有効手の場合はクリック後にdata-stone="black"に変化することを確認。ID属性追加後もonClickハンドラーが機能することを検証する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Test multiple cells with different IDs
  const testCells = [
    { id: 'd3', row: '2', col: '3' },
    { id: 'c4', row: '3', col: '2' },
    { id: 'f5', row: '4', col: '5' },
    { id: 'e6', row: '5', col: '4' },
  ];

  for (const testCase of testCells) {
    const cell = container.querySelector(`#${testCase.id}`);
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute('data-row', testCase.row);
    expect(cell).toHaveAttribute('data-col', testCase.col);

    // Verify cell is clickable (has onClick handler)
    const isValidMove = cell?.hasAttribute('data-valid');
    if (isValidMove) {
      // If valid, clicking should work
      await user.click(cell!);
      await waitFor(() => {
        expect(cell).toHaveAttribute('data-stone', 'black');
      });
      break; // Only click one valid move for this test
    }
  }
  ```

- **期待値**:

  ```typescript
  // For each test cell:
  expect(cell).toBeInTheDocument();
  expect(cell).toHaveAttribute('data-row', testCase.row);
  expect(cell).toHaveAttribute('data-col', testCase.col);

  // If valid move:
  expect(cell).toHaveAttribute('data-stone', 'black'); // after click
  ```

- **削除判定**: [ ] 不要
- **備考**: 複数セルでクリックイベントハンドラーが正常動作することを確認。ID属性追加による既存機能への影響がないことを保証。

---

### Requirement 3: Existing Functionality - Styling

#### Test 7: should preserve CSS classes after ID attribute addition

- **元のテストタイトル**: should preserve CSS classes after ID attribute addition
- **日本語タイトル**: ID属性追加後もCSSクラスを保持すること
- **テスト内容**: .board-cellセレクターで64個のセルを取得し、全てのセルがid属性を持ちつつ、className に"board-cell"が含まれることを確認。ID属性追加がCSSクラスを破壊していないことを検証する
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  // Get all cells
  const cells = container.querySelectorAll('.board-cell');
  expect(cells.length).toBe(64);

  // Verify each cell has both id and className
  cells.forEach((cell) => {
    expect(cell).toHaveAttribute('id'); // ID present
    expect(cell.className).toContain('board-cell'); // CSS class preserved
  });
  ```

- **期待値**:
  ```typescript
  expect(cells.length).toBe(64);
  // For each cell:
  expect(cell).toHaveAttribute('id');
  expect(cell.className).toContain('board-cell');
  ```
- **削除判定**: [ ] 不要
- **備考**: ID属性とCSSクラスが共存していることを確認。スタイリングが破壊されていないことを保証。

---

#### Test 8: should apply valid-move styling to cells with IDs

- **元のテストタイトル**: should apply valid-move styling to cells with IDs
- **日本語タイトル**: 有効手のスタイリングをID付きセルに適用すること
- **テスト内容**: .board-cell.valid-moveセレクターで有効手セルを取得し、全ての有効手セルがid属性を持ち、IDが/^[a-h][1-8]$/形式にマッチすることを確認。有効手スタイリングがID付きセルに正常適用されることを検証する
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  // Find cells with valid-move class
  const validMoveCells = container.querySelectorAll(
    '.board-cell.valid-move'
  );

  // All valid-move cells should have IDs
  validMoveCells.forEach((cell) => {
    expect(cell).toHaveAttribute('id');
    expect(cell.id).toMatch(/^[a-h][1-8]$/);
  });
  ```

- **期待値**:
  ```typescript
  // For each valid-move cell:
  expect(cell).toHaveAttribute('id');
  expect(cell.id).toMatch(/^[a-h][1-8]$/);
  ```
- **削除判定**: [ ] 不要
- **備考**: 有効手のスタイリング（.valid-moveクラス）がID属性追加後も正常動作することを確認。

---

### Requirement 4: Existing Functionality - Stone Placement

#### Test 9: should correctly place stones on cells with ID attributes

- **元のテストタイトル**: should correctly place stones on cells with ID attributes
- **日本語タイトル**: ID属性を持つセルに石を正しく配置すること
- **テスト内容**: 初期状態で黒石2個・白石2個が配置されていること、全ての石が.board-cell[id]内にあること、#c4をクリック後に黒石が2個より多くなることを確認。ID属性を持つセルへの石配置が正常動作することを検証する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Verify initial stone placement (center 4 cells)
  const blackStones = container.querySelectorAll('[data-stone="black"]');
  const whiteStones = container.querySelectorAll('[data-stone="white"]');
  expect(blackStones.length).toBe(2);
  expect(whiteStones.length).toBe(2);

  // All stones should be on cells with IDs
  blackStones.forEach((stone) => {
    const cell = stone.closest('.board-cell');
    expect(cell).toHaveAttribute('id');
  });
  whiteStones.forEach((stone) => {
    const cell = stone.closest('.board-cell');
    expect(cell).toHaveAttribute('id');
  });

  // Place a stone using ID selector
  const cellC4 = container.querySelector('#c4');
  await user.click(cellC4!);

  await waitFor(() => {
    // Verify stone count increased
    const blackStonesAfter = container.querySelectorAll(
      '[data-stone="black"]'
    );
    expect(blackStonesAfter.length).toBeGreaterThan(2);
  });
  ```

- **期待値**:
  ```typescript
  // Initial:
  expect(blackStones.length).toBe(2);
  expect(whiteStones.length).toBe(2);
  // All stones on cells with IDs:
  expect(cell).toHaveAttribute('id');
  // After move:
  expect(blackStonesAfter.length).toBeGreaterThan(2);
  ```
- **削除判定**: [ ] 不要
- **備考**: ID属性を持つセルへの石配置が正常動作することを確認。初期配置と手による配置の両方を検証。

---

#### Test 10: should flip stones correctly on cells with ID attributes

- **元のテストタイトル**: should flip stones correctly on cells with ID attributes
- **日本語タイトル**: ID属性を持つセルで石を正しく反転すること
- **テスト内容**: 初期状態（黒2個・白2個）から#c4をクリック後、黒石が初期状態より増加することを確認。ID属性を持つセルでの石の反転が正常動作することを検証する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Initial state: 2 black, 2 white
  const initialBlack = container.querySelectorAll(
    '[data-stone="black"]'
  ).length;
  const initialWhite = container.querySelectorAll(
    '[data-stone="white"]'
  ).length;
  expect(initialBlack).toBe(2);
  expect(initialWhite).toBe(2);

  // Make a move that flips stones
  const cellC4 = container.querySelector('#c4');
  await user.click(cellC4!);

  await waitFor(() => {
    // After black's move, some white stones should flip to black
    const blackAfter = container.querySelectorAll(
      '[data-stone="black"]'
    ).length;
    expect(blackAfter).toBeGreaterThan(initialBlack);
  });
  ```

- **期待値**:
  ```typescript
  // Initial:
  expect(initialBlack).toBe(2);
  expect(initialWhite).toBe(2);
  // After move:
  expect(blackAfter).toBeGreaterThan(initialBlack);
  ```
- **削除判定**: [ ] 不要
- **備考**: 石の反転ロジックがID属性追加後も正常動作することを確認。c4への着手で白石が黒石に反転する。

---

### Requirement 5: Existing Functionality - History Display

#### Test 11: should display move history with correct ID after moves

- **元のテストタイトル**: should display move history with correct ID after moves
- **日本語タイトル**: 手の後に正しいIDで着手履歴を表示すること
- **テスト内容**: 初期状態で#historyが存在しないこと、#c4をクリック後にwaitForで#historyがDOM に表示され、id="history"を持ち、テキストに"c4"が含まれることを確認する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Initially, no history
  let history = container.querySelector('#history');
  expect(history).not.toBeInTheDocument();

  // Make a move
  const cellC4 = container.querySelector('#c4');
  await user.click(cellC4!);

  // Wait for history to appear
  await waitFor(() => {
    history = container.querySelector('#history');
    expect(history).toBeInTheDocument();
    expect(history).toHaveAttribute('id', 'history');
  });

  // Verify history content contains move notation
  expect(history).toHaveTextContent('c4');
  ```

- **期待値**:
  ```typescript
  // Before move:
  expect(history).not.toBeInTheDocument();
  // After move:
  expect(history).toBeInTheDocument();
  expect(history).toHaveAttribute('id', 'history');
  expect(history).toHaveTextContent('c4');
  ```
- **削除判定**: [ ] 不要
- **備考**: 履歴コンポーネントのID属性と内容の両方を検証。履歴表示機能が正常動作することを確認。

---

#### Test 12: should update history display after multiple moves

- **元のテストタイトル**: should update history display after multiple moves
- **日本語タイトル**: 複数の手の後も履歴表示を更新すること
- **テスト内容**: #c4をクリック後、履歴が表示され"c4"を含むこと、その後（AIの手が自動実行される）waitForで履歴が引き続き存在し、id="history"を持つことを確認。複数手後も履歴が維持されることを検証する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Make first move
  const cellC4 = container.querySelector('#c4');
  await user.click(cellC4!);

  await waitFor(() => {
    const history = container.querySelector('#history');
    expect(history).toBeInTheDocument();
    expect(history).toHaveTextContent('c4');
  });

  // Note: AI move will happen automatically, but we can verify history persists
  await waitFor(
    () => {
      const history = container.querySelector('#history');
      expect(history).toBeInTheDocument();
      expect(history).toHaveAttribute('id', 'history');
    },
    { timeout: 1000 }
  );
  ```

- **期待値**:
  ```typescript
  // After first move:
  expect(history).toBeInTheDocument();
  expect(history).toHaveTextContent('c4');
  // After AI move (automatically):
  expect(history).toBeInTheDocument();
  expect(history).toHaveAttribute('id', 'history');
  ```
- **削除判定**: [ ] 不要
- **備考**: 複数の手（ユーザー手 + AI手）の後も履歴が維持されることを確認。履歴更新機能の正常動作を保証。

---

### Requirement 6: Accessibility - aria-label Attributes

#### Test 13: should have aria-label on all cells with IDs

- **元のテストタイトル**: should have aria-label on all cells with IDs
- **日本語タイトル**: ID付き全セルにaria-label属性を持つこと
- **テスト内容**: .board-cell[id]セレクターで64個のセルを取得し、各セルがaria-label="セル {cellId}"（例: "セル a1"）を持つことを確認。全セルにアクセシビリティラベルが設定されていることを検証する
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const cells = container.querySelectorAll('.board-cell[id]');
  expect(cells.length).toBe(64);

  cells.forEach((cell) => {
    const cellId = cell.id;
    expect(cell).toHaveAttribute('aria-label', `セル ${cellId}`);
  });
  ```

- **期待値**:
  ```typescript
  expect(cells.length).toBe(64);
  // For each cell:
  expect(cell).toHaveAttribute('aria-label', `セル ${cellId}`);
  ```
- **削除判定**: [ ] 不要
- **備考**: セルのaria-label属性がID（a1-h8）に基づいて正しく設定されていることを確認。スクリーンリーダー対応。

---

#### Test 14: should have aria-label on history component

- **元のテストタイトル**: should have aria-label on history component
- **日本語タイトル**: 履歴コンポーネントにaria-label属性を持つこと
- **テスト内容**: #c4をクリック後、waitForで#historyがDOM に表示され、aria-label="着手履歴"を持つことを確認。履歴コンポーネントにアクセシビリティラベルが設定されていることを検証する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Make a move to trigger history
  const cellC4 = container.querySelector('#c4');
  await user.click(cellC4!);

  await waitFor(() => {
    const history = container.querySelector('#history');
    expect(history).toBeInTheDocument();
    expect(history).toHaveAttribute('aria-label', '着手履歴');
  });
  ```

- **期待値**:
  ```typescript
  expect(history).toBeInTheDocument();
  expect(history).toHaveAttribute('aria-label', '着手履歴');
  ```
- **削除判定**: [ ] 不要
- **備考**: 履歴コンポーネントのaria-label属性が正しく設定されていることを確認。スクリーンリーダー対応。

---

### Requirement 7: Data Attribute Consistency

#### Test 15: should maintain consistent data-row and data-col with ID mapping

- **元のテストタイトル**: should maintain consistent data-row and data-col with ID mapping
- **日本語タイトル**: data-rowとdata-colがIDマッピングと一貫していること
- **テスト内容**: 角と中央のセル（a1, h8, c4, d3, e6）について、IDセレクターで取得し、data-row/data-col属性が期待値と一致することを確認。座標データ属性とID表記の整合性を検証する
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  // Test corner and center cells for data attribute consistency
  const testCases = [
    { id: 'a1', row: '0', col: '0' }, // Top-left
    { id: 'h8', row: '7', col: '7' }, // Bottom-right
    { id: 'c4', row: '3', col: '2' }, // Center
    { id: 'd3', row: '2', col: '3' }, // Center
    { id: 'e6', row: '5', col: '4' }, // Center
  ];

  testCases.forEach((testCase) => {
    const cell = container.querySelector(`#${testCase.id}`);
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute('data-row', testCase.row);
    expect(cell).toHaveAttribute('data-col', testCase.col);
  });
  ```

- **期待値**:
  ```typescript
  // For each test case:
  expect(cell).toBeInTheDocument();
  expect(cell).toHaveAttribute('data-row', testCase.row);
  expect(cell).toHaveAttribute('data-col', testCase.col);
  ```
- **削除判定**: [ ] 不要
- **備考**: data-row/data-col属性とID（a1-h8）の整合性を確認。座標マッピングが一貫していることを保証。

---

#### Test 16: should verify data-testid attribute coexists with id attribute

- **元のテストタイトル**: should verify data-testid attribute coexists with id attribute
- **日本語タイトル**: data-testid属性とid属性が共存することを検証すること
- **テスト内容**: #c4をクリック後、waitForで#historyが表示され、id="history"とdata-testid="move-history"の両方の属性を持つことを確認。複数の識別属性が共存できることを検証する
- **テストコード抜粋**:

  ```typescript
  const user = userEvent.setup();
  const { container } = render(<GameBoard />);

  // Make a move to trigger history
  const cellC4 = container.querySelector('#c4');
  await user.click(cellC4!);

  await waitFor(() => {
    const history = container.querySelector('#history');
    expect(history).toBeInTheDocument();

    // Both attributes should exist
    expect(history).toHaveAttribute('id', 'history');
    expect(history).toHaveAttribute('data-testid', 'move-history');
  });
  ```

- **期待値**:
  ```typescript
  expect(history).toBeInTheDocument();
  expect(history).toHaveAttribute('id', 'history');
  expect(history).toHaveAttribute('data-testid', 'move-history');
  ```
- **削除判定**: [ ] 不要
- **備考**: id属性とdata-testid属性が共存できることを確認。テスト用と実用途の両方の識別子をサポート。

---

### Requirement 8: Coordinate Mapping Correctness

#### Test 17: should correctly map rowIndex and colIndex to cell IDs

- **元のテストタイトル**: should correctly map rowIndex and colIndex to cell IDs
- **日本語タイトル**: rowIndexとcolIndexをセルIDに正しくマッピングすること
- **テスト内容**: 上端行（rowIndex=0）の8セル（a1-h1）と左端列（colIndex=0）の8セル（a1-a8）について、各セルのdata-row/data-col属性が期待値と一致することを確認。チェス記法マッピング（colIndex→列文字a-h、rowIndex→行番号1-8）の正確性を検証する
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  // Verify standard chess notation mapping:
  // - colIndex (0-7) → column letter (a-h) - horizontal, left to right
  // - rowIndex (0-7) → row number (1-8) - vertical, top to bottom

  // Test top row (rowIndex=0 → row 1)
  const topRowIds = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];
  topRowIds.forEach((id, colIndex) => {
    const cell = container.querySelector(`#${id}`);
    expect(cell).toHaveAttribute('data-row', '0');
    expect(cell).toHaveAttribute('data-col', String(colIndex));
  });

  // Test left column (colIndex=0 → column 'a')
  const leftColumnIds = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
  leftColumnIds.forEach((id, rowIndex) => {
    const cell = container.querySelector(`#${id}`);
    expect(cell).toHaveAttribute('data-row', String(rowIndex));
    expect(cell).toHaveAttribute('data-col', '0');
  });
  ```

- **期待値**:

  ```typescript
  // Top row (rowIndex=0):
  // For each topRowId (a1-h1):
  expect(cell).toHaveAttribute('data-row', '0');
  expect(cell).toHaveAttribute('data-col', String(colIndex));

  // Left column (colIndex=0):
  // For each leftColumnId (a1-a8):
  expect(cell).toHaveAttribute('data-row', String(rowIndex));
  expect(cell).toHaveAttribute('data-col', '0');
  ```

- **削除判定**: [ ] 不要
- **備考**: チェス記法の正確なマッピングを検証。colIndex（0-7）→列文字（a-h）、rowIndex（0-7）→行番号（1-8）。

---

#### Test 18: should verify bottom-right corner is h8 (not a8 or h1)

- **元のテストタイトル**: should verify bottom-right corner is h8 (not a8 or h1)
- **日本語タイトル**: 右下隅がh8であること（a8やh1ではない）を検証すること
- **テスト内容**: data-row="7" data-col="7"のセルがid="h8"を持つこと、#h8セレクターで取得したセルがdata-row="7" data-col="7"を持つことを確認。誤ったマッピング（a8やh1）でないことを明示的に検証する
- **テストコード抜粋**:

  ```typescript
  const { container } = render(<GameBoard />);

  const bottomRightCell = container.querySelector(
    '[data-row="7"][data-col="7"]'
  );
  expect(bottomRightCell).toHaveAttribute('id', 'h8');

  // Explicitly verify it's NOT incorrect mappings
  const cellH8 = container.querySelector('#h8');
  expect(cellH8).toHaveAttribute('data-row', '7');
  expect(cellH8).toHaveAttribute('data-col', '7');
  ```

- **期待値**:
  ```typescript
  expect(bottomRightCell).toHaveAttribute('id', 'h8');
  expect(cellH8).toHaveAttribute('data-row', '7');
  expect(cellH8).toHaveAttribute('data-col', '7');
  ```
- **削除判定**: [ ] 不要
- **備考**: 右下隅（row=7, col=7）が正しくh8にマッピングされていることを明示的に検証。誤ったマッピング（a8やh1）を防ぐ。

---

### Requirement 9: No Regressions - Existing Tests

#### Test 19: should render game board correctly (existing test)

- **元のテストタイトル**: should render game board correctly (existing test)
- **日本語タイトル**: ゲームボードを正しくレンダリングすること（既存テスト）
- **テスト内容**: GameBoardをレンダリングし、data-testid="game-board"を持つ要素がDOM内に存在することを確認。基本的なレンダリングが正常動作することを検証する
- **テストコード抜粋**:
  ```typescript
  render(<GameBoard />);
  expect(screen.getByTestId('game-board')).toBeInTheDocument();
  ```
- **期待値**:
  ```typescript
  expect(screen.getByTestId('game-board')).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要
- **備考**: 既存テストの回帰防止。ID属性追加が基本レンダリングを破壊していないことを確認。

---

#### Test 20: should display initial 8x8 board with 64 cells (existing test)

- **元のテストタイトル**: should display initial 8x8 board with 64 cells (existing test)
- **日本語タイトル**: 初期8x8盤面を64セルで表示すること（既存テスト）
- **テスト内容**: GameBoardをレンダリングし、role="button"を持つ要素が65個（64セル + 1パスボタン）存在することを確認。盤面の構造が正常であることを検証する
- **テストコード抜粋**:
  ```typescript
  render(<GameBoard />);
  const cells = screen.getAllByRole('button');
  // 64 board cells + 1 pass button
  expect(cells).toHaveLength(65);
  ```
- **期待値**:
  ```typescript
  expect(cells).toHaveLength(65); // 64 board cells + 1 pass button
  ```
- **削除判定**: [ ] 不要
- **備考**: 既存テストの回帰防止。盤面構造（64セル + 1パスボタン）が正常であることを確認。

---

## サマリー

### 保持推奨テスト: 20件（全て）

このファイルは**要素ID割り当て機能（element-id-assignment）の最終検証テスト** であり、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- **ID属性の一意性（4件）**: 64セルID + 1履歴ID = 65個の一意ID、重複なし、完全カバレッジ
- **既存機能の非破壊（8件）**: クリックイベント（2件）、スタイリング（2件）、石配置（2件）、履歴表示（2件）
- **アクセシビリティ（2件）**: セルと履歴のaria-label属性
- **データ一貫性（2件）**: data-row/data-colとIDの整合性、data-testidとidの共存
- **座標マッピング（2件）**: チェス記法マッピング（a1-h8）の正確性検証
- **リグレッションテスト（2件）**: 既存機能の回帰防止（元は4テストと記載されていたが実際は2テスト）

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）** で、非常に良好な状態です。

最終検証テストは以下の理由で重要です：

- **ID割り当て機能の包括的検証**: 64セルID + 1履歴IDの一意性と完全性を保証
- **既存機能への影響がないことの保証**: クリック、スタイリング、石配置、履歴表示が全て正常動作
- **一意性と整合性の保証**: ID重複なし、data属性との整合性あり
- **アクセシビリティの検証**: aria-label属性が適切に設定
- **座標マッピングの正確性確認**: チェス記法（a1-h8）が正しくマッピング

変更不要です。

**備考**:

- TDD（Test-Driven Development）のRED-GREEN-REFACTORサイクルで実装
- Tasks 1-4で実装が完了し、Task 5で最終検証を実施
- 全要件を網羅的に検証（ID一意性、既存機能、アクセシビリティ、データ整合性、座標正確性）
- ID属性追加が既存機能を一切破壊していないことを保証
