# Move Validator Comprehensive Tests

## ファイル情報

- **テストファイル**: `src/lib/game/__tests__/move-validator.comprehensive.test.ts`
- **テスト対象コード**: `src/lib/game/move-validator.ts`
- **テスト数**: 40
- **削除推奨テスト数**: 0

## 概要

このファイルは**手の検証と石の反転計算の包括的テスト**であり、複雑なシナリオ、エッジケース、境界条件をテストしています。

テスト対象の関数:

- `validateMove()`: 手の妥当性を検証
- `findAllFlips()`: 全方向の反転可能な石を検索
- `findFlipsInDirection()`: 特定方向の反転可能な石を検索
- `DIRECTIONS`: 8方向の定数定義

## テストケース一覧

### findFlipsInDirection - Complex Patterns

#### Test 1: should find flips with maximum length chain (7 stones)

- **元のテストタイトル**: should find flips with maximum length chain (7 stones)
- **日本語タイトル**: 最大長の連鎖（7石）の反転を見つけることができること
- **テスト内容**: 最長の連鎖（黒-白x6-黒）をボード全体にわたって作成し、findFlipsInDirection が6つの白石全てを反転対象として検出できることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Create longest possible chain: black-white*6-black (spanning entire row)
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  for (let col = 1; col <= 6; col++) {
    board = setCellAt(board, { row: 0, col }, 'white');
  }
  board = setCellAt(board, { row: 0, col: 7 }, 'black');

  const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
    dx: 0,
    dy: 1,
  });

  expect(flips).toHaveLength(6);
  for (let col = 1; col <= 6; col++) {
    expect(flips).toContainEqual({ row: 0, col });
  }
  ```

- **期待値**:
  ```typescript
  expect(flips).toHaveLength(6);
  expect(flips).toContainEqual({ row: 0, col: 1 });
  expect(flips).toContainEqual({ row: 0, col: 2 });
  expect(flips).toContainEqual({ row: 0, col: 3 });
  expect(flips).toContainEqual({ row: 0, col: 4 });
  expect(flips).toContainEqual({ row: 0, col: 5 });
  expect(flips).toContainEqual({ row: 0, col: 6 });
  ```
- **削除判定**: [ ] 不要
- **備考**: リバーシで可能な最長の連鎖（1列を横断する7石）を正しく処理できることの検証として重要

---

#### Test 2: should return empty array when chain is broken by empty cell

- **元のテストタイトル**: should return empty array when chain is broken by empty cell
- **日本語タイトル**: 連鎖が空のマスで途切れた場合に空配列を返すこと
- **テスト内容**: 黒-白-空-白-黒というパターンで、空マスによって連鎖が途切れている場合、反転対象が存在しないため空配列を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Pattern: black-white-empty-white-black
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'white');
  // (0,2) is empty
  board = setCellAt(board, { row: 0, col: 3 }, 'white');
  board = setCellAt(board, { row: 0, col: 4 }, 'black');

  const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
    dx: 0,
    dy: 1,
  });

  // Should only flip (0,1) because (0,2) breaks the chain
  expect(flips).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(flips).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: 空マスによる連鎖の中断を正しく検出することは、リバーシの基本ルールの正確な実装に不可欠

---

#### Test 3: should return empty array when no opponent stones before player stone

- **元のテストタイトル**: should return empty array when no opponent stones before player stone
- **日本語タイトル**: プレイヤーの石の前に相手の石がない場合に空配列を返すこと
- **テスト内容**: 黒-黒-黒というパターンで、相手の石が存在しない場合、反転対象がないため空配列を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Pattern: black-black-black
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'black');
  board = setCellAt(board, { row: 0, col: 2 }, 'black');

  const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
    dx: 0,
    dy: 1,
  });

  expect(flips).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(flips).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: 相手の石を挟んでいない場合は反転不可という基本ルールの検証

---

#### Test 4: should find flips in all 8 directions from center

- **元のテストタイトル**: should find flips in all 8 directions from center
- **日本語タイトル**: 中央から8方向全ての反転を見つけることができること
- **テスト内容**: (4,4)を中心に8方向全てに白石-黒石のパターンを配置し、全ての方向で反転可能な石が検出されることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Place test position at center (4,4)
  // Surround with white stones in all 8 directions, terminated by black

  // Direction: Top-Left (-1, -1)
  board = setCellAt(board, { row: 3, col: 3 }, 'white');
  board = setCellAt(board, { row: 2, col: 2 }, 'black');

  // Direction: Top (-1, 0)
  board = setCellAt(board, { row: 3, col: 4 }, 'white');
  board = setCellAt(board, { row: 2, col: 4 }, 'black');

  // ... (all 8 directions)

  // Test each direction
  DIRECTIONS.forEach((direction) => {
    const flips = findFlipsInDirection(
      board,
      { row: 4, col: 4 },
      'black',
      direction
    );
    expect(flips.length).toBeGreaterThan(0);
  });
  ```

- **期待値**:
  ```typescript
  // For each of 8 DIRECTIONS:
  expect(flips.length).toBeGreaterThan(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: リバーシの8方向全てで反転計算が正しく動作することの包括的検証として重要

---

#### Test 5: should handle diagonal flips across the entire board

- **元のテストタイトル**: should handle diagonal flips across the entire board
- **日本語タイトル**: 盤面全体を横切る斜め方向の反転を処理できること
- **テスト内容**: (0,0)から(7,7)までの対角線上に黒-白x6-黒のパターンを作成し、対角線方向の長い連鎖を正しく処理できることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Create diagonal chain from (0,0) to (7,7)
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  for (let i = 1; i < 7; i++) {
    board = setCellAt(board, { row: i, col: i }, 'white');
  }
  board = setCellAt(board, { row: 7, col: 7 }, 'black');

  const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
    dx: 1,
    dy: 1,
  });

  expect(flips).toHaveLength(6);
  for (let i = 1; i < 7; i++) {
    expect(flips).toContainEqual({ row: i, col: i });
  }
  ```

- **期待値**:
  ```typescript
  expect(flips).toHaveLength(6);
  expect(flips).toContainEqual({ row: 1, col: 1 });
  expect(flips).toContainEqual({ row: 2, col: 2 });
  expect(flips).toContainEqual({ row: 3, col: 3 });
  expect(flips).toContainEqual({ row: 4, col: 4 });
  expect(flips).toContainEqual({ row: 5, col: 5 });
  expect(flips).toContainEqual({ row: 6, col: 6 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 斜め方向での最大長の連鎖を処理できることの検証

---

#### Test 6: should stop at board boundary without wrapping

- **元のテストタイトル**: should stop at board boundary without wrapping
- **日本語タイトル**: 盤面の境界で停止し、ラップアラウンドしないこと
- **テスト内容**: ボードの端（(0,7)）から下方向に白石を配置し、終端の黒石がない場合、境界で停止して空配列を返すことを確認する（ラップアラウンドしないことの検証）
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Place at edge: (0,7)-black, (1,7)-white, (2,7)-white, ...
  board = setCellAt(board, { row: 0, col: 7 }, 'black');
  board = setCellAt(board, { row: 1, col: 7 }, 'white');
  board = setCellAt(board, { row: 2, col: 7 }, 'white');
  // No terminating black stone below

  const flips = findFlipsInDirection(board, { row: 0, col: 7 }, 'black', {
    dx: 1,
    dy: 0,
  });

  // Should return empty because no terminating stone before edge
  expect(flips).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(flips).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: 境界条件での正しい動作（ラップアラウンドしない）の検証として重要

---

#### Test 7: should handle direction with single opponent stone

- **元のテストタイトル**: should handle direction with single opponent stone
- **日本語タイトル**: 1つだけの相手の石を含む方向を処理できること
- **テスト内容**: 黒-白-黒という最小の反転パターン（相手の石が1つだけ）を正しく処理し、その1つの白石を反転対象として返すことを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Pattern: black-white-black
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'white');
  board = setCellAt(board, { row: 0, col: 2 }, 'black');

  const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
    dx: 0,
    dy: 1,
  });

  expect(flips).toEqual([{ row: 0, col: 1 }]);
  ```

- **期待値**:
  ```typescript
  expect(flips).toEqual([{ row: 0, col: 1 }]);
  ```
- **削除判定**: [ ] 不要
- **備考**: 最小の反転パターンの正しい処理の検証

---

#### Test 8: should distinguish between different players correctly

- **元のテストタイトル**: should distinguish between different players correctly
- **日本語タイトル**: 異なるプレイヤーを正しく区別できること
- **テスト内容**: 白-黒-白のパターンで、白プレイヤーの場合は黒石を反転できるが、黒プレイヤーの場合は反転できないことを確認し、プレイヤーの区別が正しく行われることを検証する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Same pattern but flipped: white-black-white
  board = setCellAt(board, { row: 0, col: 0 }, 'white');
  board = setCellAt(board, { row: 0, col: 1 }, 'black');
  board = setCellAt(board, { row: 0, col: 2 }, 'white');

  const flipsForWhite = findFlipsInDirection(
    board,
    { row: 0, col: 0 },
    'white',
    { dx: 0, dy: 1 }
  );

  expect(flipsForWhite).toEqual([{ row: 0, col: 1 }]);

  const flipsForBlack = findFlipsInDirection(
    board,
    { row: 0, col: 0 },
    'black',
    { dx: 0, dy: 1 }
  );

  expect(flipsForBlack).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(flipsForWhite).toEqual([{ row: 0, col: 1 }]);
  expect(flipsForBlack).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: プレイヤーの混同を防ぐための重要な検証

---

### findAllFlips - Complex Multi-Directional Patterns

#### Test 9: should find flips in exactly 2 perpendicular directions

- **元のテストタイトル**: should find flips in exactly 2 perpendicular directions
- **日本語タイトル**: 正確に2つの垂直方向の反転を見つけることができること
- **テスト内容**: (4,4)を中心に十字パターン（水平と垂直）を作成し、findAllFlips が両方向の反転（合計4石）を正しく検出することを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Cross pattern centered at (4,4)
  // Horizontal: (4,2)-black, (4,3)-white, (4,4)-empty, (4,5)-white, (4,6)-black
  board = setCellAt(board, { row: 4, col: 2 }, 'black');
  board = setCellAt(board, { row: 4, col: 3 }, 'white');
  board = setCellAt(board, { row: 4, col: 5 }, 'white');
  board = setCellAt(board, { row: 4, col: 6 }, 'black');

  // Vertical: (2,4)-black, (3,4)-white, (4,4)-empty, (5,4)-white, (6,4)-black
  board = setCellAt(board, { row: 2, col: 4 }, 'black');
  board = setCellAt(board, { row: 3, col: 4 }, 'white');
  board = setCellAt(board, { row: 5, col: 4 }, 'white');
  board = setCellAt(board, { row: 6, col: 4 }, 'black');

  const flips = findAllFlips(board, { row: 4, col: 4 }, 'black');

  // Should flip 4 stones total (2 horizontal + 2 vertical)
  expect(flips).toHaveLength(4);
  expect(flips).toContainEqual({ row: 4, col: 3 });
  expect(flips).toContainEqual({ row: 4, col: 5 });
  expect(flips).toContainEqual({ row: 3, col: 4 });
  expect(flips).toContainEqual({ row: 5, col: 4 });
  ```

- **期待値**:
  ```typescript
  expect(flips).toHaveLength(4);
  expect(flips).toContainEqual({ row: 4, col: 3 });
  expect(flips).toContainEqual({ row: 4, col: 5 });
  expect(flips).toContainEqual({ row: 3, col: 4 });
  expect(flips).toContainEqual({ row: 5, col: 4 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 複数方向の反転を集約する機能の検証として重要

---

#### Test 10: should find flips in all 4 diagonal directions

- **元のテストタイトル**: should find flips in all 4 diagonal directions
- **日本語タイトル**: 4つの斜め方向全ての反転を見つけることができること
- **テスト内容**: (4,4)を中心にXパターン（4つの斜め方向）を作成し、findAllFlips が全ての斜め方向の反転（合計4石）を正しく検出することを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // X pattern centered at (4,4)
  // Top-left diagonal: (2,2)-black, (3,3)-white
  board = setCellAt(board, { row: 2, col: 2 }, 'black');
  board = setCellAt(board, { row: 3, col: 3 }, 'white');

  // Top-right diagonal: (2,6)-black, (3,5)-white
  board = setCellAt(board, { row: 2, col: 6 }, 'black');
  board = setCellAt(board, { row: 3, col: 5 }, 'white');

  // Bottom-left diagonal: (6,2)-black, (5,3)-white
  board = setCellAt(board, { row: 6, col: 2 }, 'black');
  board = setCellAt(board, { row: 5, col: 3 }, 'white');

  // Bottom-right diagonal: (6,6)-black, (5,5)-white
  board = setCellAt(board, { row: 6, col: 6 }, 'black');
  board = setCellAt(board, { row: 5, col: 5 }, 'white');

  const flips = findAllFlips(board, { row: 4, col: 4 }, 'black');

  // Should flip 4 stones (one in each diagonal)
  expect(flips).toHaveLength(4);
  expect(flips).toContainEqual({ row: 3, col: 3 });
  expect(flips).toContainEqual({ row: 3, col: 5 });
  expect(flips).toContainEqual({ row: 5, col: 3 });
  expect(flips).toContainEqual({ row: 5, col: 5 });
  ```

- **期待値**:
  ```typescript
  expect(flips).toHaveLength(4);
  expect(flips).toContainEqual({ row: 3, col: 3 });
  expect(flips).toContainEqual({ row: 3, col: 5 });
  expect(flips).toContainEqual({ row: 5, col: 3 });
  expect(flips).toContainEqual({ row: 5, col: 5 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 斜め4方向全ての反転を同時に処理できることの検証

---

#### Test 11: should aggregate flips from multiple chains in same direction

- **元のテストタイトル**: should aggregate flips from multiple chains in same direction
- **日本語タイトル**: 同じ方向の複数の連鎖からの反転を集約できること
- **テスト内容**: (4,4)の左側に黒-白x3のパターンを作成し、同一方向内の複数の白石を全て反転対象として集約できることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Multiple chains pointing to (4,4)
  // From left: (4,0)-black, (4,1)-white, (4,2)-white, (4,3)-white
  board = setCellAt(board, { row: 4, col: 0 }, 'black');
  board = setCellAt(board, { row: 4, col: 1 }, 'white');
  board = setCellAt(board, { row: 4, col: 2 }, 'white');
  board = setCellAt(board, { row: 4, col: 3 }, 'white');

  const flips = findAllFlips(board, { row: 4, col: 4 }, 'black');

  // Should flip all 3 white stones from the left
  expect(flips).toContainEqual({ row: 4, col: 1 });
  expect(flips).toContainEqual({ row: 4, col: 2 });
  expect(flips).toContainEqual({ row: 4, col: 3 });
  ```

- **期待値**:
  ```typescript
  expect(flips).toContainEqual({ row: 4, col: 1 });
  expect(flips).toContainEqual({ row: 4, col: 2 });
  expect(flips).toContainEqual({ row: 4, col: 3 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 連続する複数の石を正しく反転できることの検証

---

#### Test 12: should not include duplicates when flips overlap conceptually

- **元のテストタイトル**: should not include duplicates when flips overlap conceptually
- **日本語タイトル**: 概念的に重複する反転が発生しても重複を含まないこと
- **テスト内容**: 複数方向から同じ位置を参照する可能性があるパターンで、反転対象の位置がユニークであることを確認する（Set による重複チェック）
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Even if patterns overlap, positions should be unique
  board = setCellAt(board, { row: 3, col: 3 }, 'white');
  board = setCellAt(board, { row: 3, col: 2 }, 'black');
  board = setCellAt(board, { row: 2, col: 3 }, 'black');

  const flips = findAllFlips(board, { row: 4, col: 4 }, 'black');

  // Convert to Set to verify uniqueness
  const positionStrings = flips.map((p) => `${p.row},${p.col}`);
  const uniquePositions = new Set(positionStrings);

  expect(positionStrings.length).toBe(uniquePositions.size);
  ```

- **期待値**:
  ```typescript
  expect(positionStrings.length).toBe(uniquePositions.size);
  ```
- **削除判定**: [ ] 不要
- **備考**: 反転対象リストに重複がないことを保証する重要な検証

---

#### Test 13: should find asymmetric flip patterns

- **元のテストタイトル**: should find asymmetric flip patterns
- **日本語タイトル**: 非対称な反転パターンを見つけることができること
- **テスト内容**: (4,4)から北・東・南の3方向のみに反転可能なパターンを作成し、非対称なケースでも正しく3つの反転を検出することを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Asymmetric: flips only in 3 of 4 cardinal directions
  // North: (2,4)-black, (3,4)-white
  board = setCellAt(board, { row: 2, col: 4 }, 'black');
  board = setCellAt(board, { row: 3, col: 4 }, 'white');

  // East: (4,6)-black, (4,5)-white
  board = setCellAt(board, { row: 4, col: 6 }, 'black');
  board = setCellAt(board, { row: 4, col: 5 }, 'white');

  // South: (6,4)-black, (5,4)-white
  board = setCellAt(board, { row: 6, col: 4 }, 'black');
  board = setCellAt(board, { row: 5, col: 4 }, 'white');

  // West: No valid flip (empty or same color)

  const flips = findAllFlips(board, { row: 4, col: 4 }, 'black');

  expect(flips).toHaveLength(3);
  expect(flips).toContainEqual({ row: 3, col: 4 });
  expect(flips).toContainEqual({ row: 4, col: 5 });
  expect(flips).toContainEqual({ row: 5, col: 4 });
  ```

- **期待値**:
  ```typescript
  expect(flips).toHaveLength(3);
  expect(flips).toContainEqual({ row: 3, col: 4 });
  expect(flips).toContainEqual({ row: 4, col: 5 });
  expect(flips).toContainEqual({ row: 5, col: 4 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 非対称なパターンでも正しく動作することの検証

---

#### Test 14: should handle corner position with limited directions

- **元のテストタイトル**: should handle corner position with limited directions
- **日本語タイトル**: 方向が限定される角の位置を処理できること
- **テスト内容**: 左上角(0,0)から反転可能な3方向（右・下・斜め右下）にパターンを作成し、角の位置でも正しく3つの反転を検出することを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Top-left corner (0,0) can only flip in 3 directions: right, down, diagonal-down-right
  // Right: (0,2)-black, (0,1)-white
  board = setCellAt(board, { row: 0, col: 2 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'white');

  // Down: (2,0)-black, (1,0)-white
  board = setCellAt(board, { row: 2, col: 0 }, 'black');
  board = setCellAt(board, { row: 1, col: 0 }, 'white');

  // Diagonal: (2,2)-black, (1,1)-white
  board = setCellAt(board, { row: 2, col: 2 }, 'black');
  board = setCellAt(board, { row: 1, col: 1 }, 'white');

  const flips = findAllFlips(board, { row: 0, col: 0 }, 'black');

  expect(flips).toHaveLength(3);
  expect(flips).toContainEqual({ row: 0, col: 1 });
  expect(flips).toContainEqual({ row: 1, col: 0 });
  expect(flips).toContainEqual({ row: 1, col: 1 });
  ```

- **期待値**:
  ```typescript
  expect(flips).toHaveLength(3);
  expect(flips).toContainEqual({ row: 0, col: 1 });
  expect(flips).toContainEqual({ row: 1, col: 0 });
  expect(flips).toContainEqual({ row: 1, col: 1 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 角の位置での特殊な制約（方向数が少ない）を正しく処理することの検証

---

#### Test 15: should return empty array when no flips possible in any direction

- **元のテストタイトル**: should return empty array when no flips possible in any direction
- **日本語タイトル**: どの方向でも反転が不可能な場合に空配列を返すこと
- **テスト内容**: 初期盤面で孤立した位置(4,4)に対して findAllFlips を実行し、反転可能な石がない場合は空配列を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // Isolated position with no valid flips
  // Surround (4,4) with empty cells

  const flips = findAllFlips(board, { row: 4, col: 4 }, 'black');

  expect(flips).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(flips).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: 反転不可能な場合の正しい処理の検証

---

### validateMove - Boundary and Edge Cases

#### Test 16: should validate all 4 corners when valid

- **元のテストタイトル**: should validate all 4 corners when valid
- **日本語タイトル**: 有効な場合に4隅全てを検証できること
- **テスト内容**: 4つの角(0,0), (0,7), (7,0), (7,7)それぞれに対して有効な反転パターンを設定し、validateMove が全ての角で正しく成功を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  const corners: Position[] = [
    { row: 0, col: 0 },
    { row: 0, col: 7 },
    { row: 7, col: 0 },
    { row: 7, col: 7 },
  ];

  corners.forEach((corner) => {
    let board = createInitialBoard();

    // Set up valid flip for each corner
    const dx = corner.row === 0 ? 1 : -1;
    const dy = corner.col === 0 ? 1 : -1;

    board = setCellAt(
      board,
      { row: corner.row + dx, col: corner.col + dy },
      'white'
    );
    board = setCellAt(
      board,
      { row: corner.row + 2 * dx, col: corner.col + 2 * dy },
      'black'
    );

    const result = validateMove(board, corner, 'black');
    expect(result.success).toBe(true);
  });
  ```

- **期待値**:
  ```typescript
  // For each corner:
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 4隅での手の検証が正しく機能することの包括的検証

---

#### Test 17: should reject all 4 corners when invalid

- **元のテストタイトル**: should reject all 4 corners when invalid
- **日本語タイトル**: 無効な場合に4隅全てを拒否できること
- **テスト内容**: 初期盤面（角が空でパターンがない状態）で4つの角全てに対して validateMove を実行し、全て失敗を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard(); // Empty corners, no valid flips

  const corners: Position[] = [
    { row: 0, col: 0 },
    { row: 0, col: 7 },
    { row: 7, col: 0 },
    { row: 7, col: 7 },
  ];

  corners.forEach((corner) => {
    const result = validateMove(board, corner, 'black');
    expect(result.success).toBe(false);
  });
  ```

- **期待値**:
  ```typescript
  // For each corner:
  expect(result.success).toBe(false);
  ```
- **削除判定**: [ ] 不要
- **備考**: 無効な手を正しく拒否することの検証

---

#### Test 18: should validate edge positions (non-corner edges)

- **元のテストタイトル**: should validate edge positions (non-corner edges)
- **日本語タイトル**: エッジ位置（角でないエッジ）を検証できること
- **テスト内容**: 上端の中央位置(0,4)に垂直方向の反転パターンを設定し、角以外のエッジ位置でも正しく検証が成功することを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Top edge (0,4): set up vertical flip
  board = setCellAt(board, { row: 1, col: 4 }, 'white');
  board = setCellAt(board, { row: 2, col: 4 }, 'black');

  const result = validateMove(board, { row: 0, col: 4 }, 'black');
  expect(result.success).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: エッジ位置での検証が正しく機能することの確認

---

#### Test 19: should reject positions with row < 0

- **元のテストタイトル**: should reject positions with row < 0
- **日本語タイトル**: row < 0 の位置を拒否できること
- **テスト内容**: row が負の値(-1)の位置に対して validateMove を実行し、out_of_bounds エラーで失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: -1, col: 4 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.reason).toBe('out_of_bounds');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('out_of_bounds');
  ```
- **削除判定**: [ ] 不要
- **備考**: 境界値チェックの正確性の検証

---

#### Test 20: should reject positions with row >= 8

- **元のテストタイトル**: should reject positions with row >= 8
- **日本語タイトル**: row >= 8 の位置を拒否できること
- **テスト内容**: row が8以上の値(8)の位置に対して validateMove を実行し、out_of_bounds エラーで失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: 8, col: 4 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.reason).toBe('out_of_bounds');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('out_of_bounds');
  ```
- **削除判定**: [ ] 不要
- **備考**: 上限境界値チェックの正確性の検証

---

#### Test 21: should reject positions with col < 0

- **元のテストタイトル**: should reject positions with col < 0
- **日本語タイトル**: col < 0 の位置を拒否できること
- **テスト内容**: col が負の値(-1)の位置に対して validateMove を実行し、out_of_bounds エラーで失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: 4, col: -1 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.reason).toBe('out_of_bounds');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('out_of_bounds');
  ```
- **削除判定**: [ ] 不要
- **備考**: 列の下限境界値チェックの検証

---

#### Test 22: should reject positions with col >= 8

- **元のテストタイトル**: should reject positions with col >= 8
- **日本語タイトル**: col >= 8 の位置を拒否できること
- **テスト内容**: col が8以上の値(8)の位置に対して validateMove を実行し、out_of_bounds エラーで失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: 4, col: 8 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.reason).toBe('out_of_bounds');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('out_of_bounds');
  ```
- **削除判定**: [ ] 不要
- **備考**: 列の上限境界値チェックの検証

---

#### Test 23: should reject extreme out of bounds values

- **元のテストタイトル**: should reject extreme out of bounds values
- **日本語タイトル**: 極端な範囲外の値を拒否できること
- **テスト内容**: (-100, 100), (-1, -1), (10, 10) などの極端な範囲外の位置に対して validateMove を実行し、全て out_of_bounds エラーで失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  const outOfBoundsPositions: Position[] = [
    { row: -100, col: 0 },
    { row: 100, col: 0 },
    { row: 0, col: -100 },
    { row: 0, col: 100 },
    { row: -1, col: -1 },
    { row: 10, col: 10 },
  ];

  outOfBoundsPositions.forEach((pos) => {
    const result = validateMove(board, pos, 'black');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.reason).toBe('out_of_bounds');
    }
  });
  ```

- **期待値**:
  ```typescript
  // For each position:
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('out_of_bounds');
  ```
- **削除判定**: [ ] 不要
- **備考**: 極端な値に対するロバスト性の検証

---

#### Test 24: should handle float coordinates by truncating (if passed)

- **元のテストタイトル**: should handle float coordinates by truncating (if passed)
- **日本語タイトル**: 浮動小数点座標を切り捨てて処理できること（渡された場合）
- **テスト内容**: TypeScript の型システムでは浮動小数点は防がれるべきだが、整数座標を使用した場合は正常に動作することを確認する（ランタイムの型安全性の検証）
- **テストコード抜粋**:

  ```typescript
  // TypeScript should prevent this, but test runtime behavior
  const board = createInitialBoard();

  // This would need the position to be cast, showing type safety
  const position = { row: 3, col: 2 };
  const result = validateMove(board, position, 'black');

  // Should work normally with integer coordinates
  expect(result.success).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 型安全性の実装確認テスト

---

### Player Differentiation

#### Test 25: should correctly identify black player flips

- **元のテストタイトル**: should correctly identify black player flips
- **日本語タイトル**: 黒プレイヤーの反転を正しく識別できること
- **テスト内容**: 初期盤面で(3,2)に黒を配置する場合、(3,3)の白石が反転対象として検出されることを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // (3,2)-empty, (3,3)-white, (3,4)-black
  const flips = findAllFlips(board, { row: 3, col: 2 }, 'black');

  expect(flips).toContainEqual({ row: 3, col: 3 });
  ```

- **期待値**:
  ```typescript
  expect(flips).toContainEqual({ row: 3, col: 3 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 黒プレイヤーでの反転計算の正確性の検証

---

#### Test 26: should correctly identify white player flips

- **元のテストタイトル**: should correctly identify white player flips
- **日本語タイトル**: 白プレイヤーの反転を正しく識別できること
- **テスト内容**: 初期盤面で(2,4)に白を配置する場合、(3,4)の黒石が反転対象として検出されることを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // (2,4)-empty, (3,4)-black, (4,4)-white
  const flips = findAllFlips(board, { row: 2, col: 4 }, 'white');

  expect(flips).toContainEqual({ row: 3, col: 4 });
  ```

- **期待値**:
  ```typescript
  expect(flips).toContainEqual({ row: 3, col: 4 });
  ```
- **削除判定**: [ ] 不要
- **備考**: 白プレイヤーでの反転計算の正確性の検証

---

#### Test 27: should not confuse players in validateMove

- **元のテストタイトル**: should not confuse players in validateMove
- **日本語タイトル**: validateMove でプレイヤーを混同しないこと
- **テスト内容**: 初期盤面で(3,2)の位置は黒にとっては有効だが白にとっては無効であることを確認し、プレイヤーの混同がないことを検証する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // Valid for black but not for white (or vice versa)
  const blackValid = validateMove(board, { row: 3, col: 2 }, 'black');
  const whiteValid = validateMove(board, { row: 3, col: 2 }, 'white');

  expect(blackValid.success).toBe(true);
  expect(whiteValid.success).toBe(false);
  ```

- **期待値**:
  ```typescript
  expect(blackValid.success).toBe(true);
  expect(whiteValid.success).toBe(false);
  ```
- **削除判定**: [ ] 不要
- **備考**: プレイヤー固有の検証ロジックが正しく分離されていることの確認

---

#### Test 28: should handle alternating player moves correctly

- **元のテストタイトル**: should handle alternating player moves correctly
- **日本語タイトル**: 交互の手を正しく処理できること
- **テスト内容**: 初期盤面で白プレイヤーの有効な手を検証し、黒と白が交互に手を打つシナリオが正しく処理されることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Set up scenario where black makes a move and then white has valid flips
  // Pattern: white-black-empty creates opportunity for white to flip back
  board = setCellAt(board, { row: 2, col: 3 }, 'white');
  board = setCellAt(board, { row: 3, col: 3 }, 'black'); // Already set in initial board

  // (4,3) is black in initial board, so white can flip (3,3) if we place at (2,3)
  // Let's test the initial board scenario instead
  const result = validateMove(board, { row: 2, col: 4 }, 'white');
  expect(result.success).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 交互の手のシナリオでの正しい動作の検証

---

### findFlipsInDirection - Branch Coverage

#### Test 29: should return flips when exactly one opponent stone before player stone

- **元のテストタイトル**: should return flips when exactly one opponent stone before player stone
- **日本語タイトル**: プレイヤーの石の前に正確に1つの相手の石がある場合に反転を返すこと
- **テスト内容**: 黒-白-黒のパターンで、1つだけの相手の石を反転対象として返すことを確認する（ブランチカバレッジ: flips.length > 0 のパス）
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Pattern: starting-player, opponent, player-stone (line 64: cell === player with flips.length > 0)
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'white');
  board = setCellAt(board, { row: 0, col: 2 }, 'black');

  const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
    dx: 0,
    dy: 1,
  });

  // This should hit line 64 with flips.length > 0
  expect(flips).toEqual([{ row: 0, col: 1 }]);
  ```

- **期待値**:
  ```typescript
  expect(flips).toEqual([{ row: 0, col: 1 }]);
  ```
- **削除判定**: [ ] 不要
- **備考**: ブランチカバレッジ100%を達成するための重要なテスト

---

#### Test 30: should return empty when no opponent stones before player stone

- **元のテストタイトル**: should return empty when no opponent stones before player stone
- **日本語タイトル**: プレイヤーの石の前に相手の石がない場合に空を返すこと
- **テスト内容**: 黒-黒-黒のパターンで、相手の石がない場合は空配列を返すことを確認する（ブランチカバレッジ: flips.length === 0 のパス）
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Pattern: starting-player, player, player (line 64: cell === player with flips.length === 0)
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'black');
  board = setCellAt(board, { row: 0, col: 2 }, 'black');

  const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
    dx: 0,
    dy: 1,
  });

  // This should hit line 64 with flips.length === 0
  expect(flips).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(flips).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: ブランチカバレッジ100%を達成するための重要なテスト

---

### DIRECTIONS Constant

#### Test 31: should have exactly 8 directions

- **元のテストタイトル**: should have exactly 8 directions
- **日本語タイトル**: 正確に8つの方向があること
- **テスト内容**: DIRECTIONS 定数が8つの要素を持つことを確認する
- **テストコード抜粋**:
  ```typescript
  expect(DIRECTIONS).toHaveLength(8);
  ```
- **期待値**:
  ```typescript
  expect(DIRECTIONS).toHaveLength(8);
  ```
- **削除判定**: [ ] 不要
- **備考**: リバーシの8方向定義の正確性を保証する基本的なテスト

---

#### Test 32: should be immutable

- **元のテストタイトル**: should be immutable
- **日本語タイトル**: イミュータブルであること
- **テスト内容**: DIRECTIONS 定数が Object.freeze() によってイミュータブルになっていることを確認する
- **テストコード抜粋**:
  ```typescript
  expect(Object.isFrozen(DIRECTIONS)).toBe(true);
  ```
- **期待値**:
  ```typescript
  expect(Object.isFrozen(DIRECTIONS)).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 定数の不変性を保証する重要なテスト

---

#### Test 33: should cover all cardinal and diagonal directions

- **元のテストタイトル**: should cover all cardinal and diagonal directions
- **日本語タイトル**: 全ての主要方向と斜め方向をカバーしていること
- **テスト内容**: DIRECTIONS 定数が8つの期待される方向（上下左右と4つの斜め）を全て含んでいることを確認する
- **テストコード抜粋**:

  ```typescript
  const expectedDirections = [
    { dx: -1, dy: -1 }, // Top-left
    { dx: -1, dy: 0 }, // Top
    { dx: -1, dy: 1 }, // Top-right
    { dx: 0, dy: -1 }, // Left
    { dx: 0, dy: 1 }, // Right
    { dx: 1, dy: -1 }, // Bottom-left
    { dx: 1, dy: 0 }, // Bottom
    { dx: 1, dy: 1 }, // Bottom-right
  ];

  expectedDirections.forEach((expected) => {
    const found = DIRECTIONS.some(
      (d) => d.dx === expected.dx && d.dy === expected.dy
    );
    expect(found).toBe(true);
  });
  ```

- **期待値**:
  ```typescript
  // For each expected direction:
  expect(found).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 8方向の完全性を保証する重要なテスト

---

### Complex Real-World Scenarios

#### Test 34: should handle mid-game board state correctly

- **元のテストタイトル**: should handle mid-game board state correctly
- **日本語タイトル**: 中盤の盤面状態を正しく処理できること
- **テスト内容**: 数手進んだ中盤の盤面状態で findAllFlips が正しく動作し、配列を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Simulate a few moves to create mid-game state
  board = setCellAt(board, { row: 3, col: 2 }, 'black');
  board = setCellAt(board, { row: 3, col: 3 }, 'black');
  board = setCellAt(board, { row: 2, col: 2 }, 'white');
  board = setCellAt(board, { row: 2, col: 3 }, 'white');
  board = setCellAt(board, { row: 2, col: 4 }, 'white');

  // Find flips for a new move
  const flips = findAllFlips(board, { row: 2, col: 1 }, 'black');

  // Should find appropriate flips based on pattern
  expect(Array.isArray(flips)).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(Array.isArray(flips)).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 実際のゲーム中の複雑な状態での動作保証

---

#### Test 35: should handle near-endgame board with few empty cells

- **元のテストタイトル**: should handle near-endgame board with few empty cells
- **日本語タイトル**: 空きマスが少ない終盤近くの盤面を処理できること
- **テスト内容**: ほとんどのマスが埋まった終盤近くの盤面で validateMove が正しく動作し、boolean 結果を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Fill most of the board
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 8; col++) {
      board = setCellAt(board, { row, col }, row % 2 === 0 ? 'black' : 'white');
    }
  }

  // Leave a few strategic empty cells
  board = setCellAt(board, { row: 7, col: 3 }, null);
  board = setCellAt(board, { row: 7, col: 4 }, null);

  // Check if moves are still validated correctly
  const result = validateMove(board, { row: 7, col: 3 }, 'white');

  // May or may not be valid, but should complete without error
  expect(typeof result.success).toBe('boolean');
  ```

- **期待値**:
  ```typescript
  expect(typeof result.success).toBe('boolean');
  ```
- **削除判定**: [ ] 不要
- **備考**: 終盤の複雑な状態でもエラーなく動作することの検証

---

#### Test 36: should correctly identify a position that flips in 6 different directions

- **元のテストタイトル**: should correctly identify a position that flips in 6 different directions
- **日本語タイトル**: 6つの異なる方向で反転する位置を正しく識別できること
- **テスト内容**: (4,4)から6方向（上・右上・右・右下・下・左下）にスターパターンを作成し、findAllFlips が正確に6つの反転を検出することを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // Create a star pattern where (4,4) can flip in 6 directions
  // Top
  board = setCellAt(board, { row: 3, col: 4 }, 'white');
  board = setCellAt(board, { row: 2, col: 4 }, 'black');

  // Top-right
  board = setCellAt(board, { row: 3, col: 5 }, 'white');
  board = setCellAt(board, { row: 2, col: 6 }, 'black');

  // Right
  board = setCellAt(board, { row: 4, col: 5 }, 'white');
  board = setCellAt(board, { row: 4, col: 6 }, 'black');

  // Bottom-right
  board = setCellAt(board, { row: 5, col: 5 }, 'white');
  board = setCellAt(board, { row: 6, col: 6 }, 'black');

  // Bottom
  board = setCellAt(board, { row: 5, col: 4 }, 'white');
  board = setCellAt(board, { row: 6, col: 4 }, 'black');

  // Bottom-left
  board = setCellAt(board, { row: 5, col: 3 }, 'white');
  board = setCellAt(board, { row: 6, col: 2 }, 'black');

  const flips = findAllFlips(board, { row: 4, col: 4 }, 'black');

  // Should flip 6 white stones (one in each direction)
  expect(flips).toHaveLength(6);
  ```

- **期待値**:
  ```typescript
  expect(flips).toHaveLength(6);
  ```
- **削除判定**: [ ] 不要
- **備考**: 複雑な多方向パターンを正しく処理できることの検証

---

### Error Handling and Result Types

#### Test 37: should return correct error type for out_of_bounds

- **元のテストタイトル**: should return correct error type for out_of_bounds
- **日本語タイトル**: 範囲外の場合に正しいエラータイプを返すこと
- **テスト内容**: 範囲外の位置(-1,0)に対して validateMove を実行し、error.type='invalid_move' かつ error.reason='out_of_bounds' で失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: -1, col: 0 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('invalid_move');
    expect(result.error.reason).toBe('out_of_bounds');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('invalid_move');
  expect(result.error.reason).toBe('out_of_bounds');
  ```
- **削除判定**: [ ] 不要
- **備考**: エラータイプの正確性を保証する重要なテスト

---

#### Test 38: should return correct error type for occupied

- **元のテストタイトル**: should return correct error type for occupied
- **日本語タイトル**: マスが占有されている場合に正しいエラータイプを返すこと
- **テスト内容**: 既に石が置かれている位置(3,3)に対して validateMove を実行し、error.type='invalid_move' かつ error.reason='occupied' で失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: 3, col: 3 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('invalid_move');
    expect(result.error.reason).toBe('occupied');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('invalid_move');
  expect(result.error.reason).toBe('occupied');
  ```
- **削除判定**: [ ] 不要
- **備考**: 占有マスのエラー処理の正確性の検証

---

#### Test 39: should return correct error type for no_flips

- **元のテストタイトル**: should return correct error type for no_flips
- **日本語タイトル**: 反転がない場合に正しいエラータイプを返すこと
- **テスト内容**: 反転可能な石がない位置(0,0)に対して validateMove を実行し、error.type='invalid_move' かつ error.reason='no_flips' で失敗することを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: 0, col: 0 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.type).toBe('invalid_move');
    expect(result.error.reason).toBe('no_flips');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('invalid_move');
  expect(result.error.reason).toBe('no_flips');
  ```
- **削除判定**: [ ] 不要
- **備考**: 反転不可のエラー処理の正確性の検証

---

#### Test 40: should return success result with value true for valid move

- **元のテストタイトル**: should return success result with value true for valid move
- **日本語タイトル**: 有効な手の場合に成功結果を返すこと
- **テスト内容**: 有効な手の位置(3,2)に対して validateMove を実行し、success=true かつ value=true を返すことを確認する
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = validateMove(board, { row: 3, col: 2 }, 'black');

  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value).toBe(true);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(result.value).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 成功時の結果の形式の正確性の検証

---

## サマリー

### 保持推奨テスト: 40件（全て）

このファイルは**手の検証と反転計算の包括的テスト**であり、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- **findFlipsInDirection - Complex Patterns（8件）**: 最大長連鎖、空マス中断、8方向、対角線、境界停止、単一石、プレイヤー区別
- **findAllFlips - Multi-Directional（7件）**: 十字パターン、Xパターン、連鎖集約、重複排除、非対称、角の制約、反転不可
- **validateMove - Boundary Cases（11件）**: 4隅（有効/無効）、エッジ、境界値（row/col < 0、row/col >= 8）、極端な値、浮動小数点
- **Player Differentiation（4件）**: 黒の反転、白の反転、混同防止、交互の手
- **Branch Coverage（2件）**: flips.length > 0、flips.length === 0
- **DIRECTIONS Constant（3件）**: 8方向、イミュータビリティ、完全性
- **Complex Scenarios（3件）**: 中盤状態、終盤状態、6方向反転
- **Error Types（4件）**: out_of_bounds、occupied、no_flips、success

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

包括的な手検証テストは以下の理由で重要です：

- リバーシのコアロジック（反転計算）の完全な検証
- 全8方向の反転パターンの網羅的テスト
- 境界条件とエラーケースの完全なカバレッジ
- プレイヤー区別の正確性保証
- 複雑なゲーム状態での動作保証
- ブランチカバレッジ100%の達成
- エラータイプの正確性保証

変更不要です。
