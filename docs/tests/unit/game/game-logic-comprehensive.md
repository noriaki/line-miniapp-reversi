# game-logic.comprehensive.test.ts

## ファイル情報

- **テストファイル**: `src/lib/game/__tests__/game-logic.comprehensive.test.ts`
- **テスト対象コード**: `src/lib/game/game-logic.ts`
- **テスト数**: 28
- **削除推奨テスト数**: 0

## 概要

このファイルは**ゲームロジックの包括的テスト**であり、複雑なシナリオ、エッジケース、境界条件をテストしています。

テストは以下のカテゴリに分類されます：

- **applyMove - Complex Flip Patterns（5件）**: 複雑な石の反転パターン
- **applyMove - Boundary Conditions（5件）**: 境界条件
- **calculateValidMoves - Complex Board States（5件）**: 有効手計算の複雑なシナリオ
- **validateMove - Edge Cases（8件）**: 手の検証のエッジケース
- **Immutability Guarantees（3件）**: イミュータビリティの保証
- **Performance and Stress Tests（3件）**: パフォーマンスとストレステスト

## テストケース一覧

### applyMove - Complex Flip Patterns

#### Test 1: should flip stones in all 8 directions simultaneously

- **元のテストタイトル**: should flip stones in all 8 directions simultaneously
- **日本語タイトル**: 1手で8方向全ての石を同時に反転できること
- **テスト内容**: (4,4)に着手することで、周囲8方向全ての白石（各方向に1つ）を黒石に反転できることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 中央の初期配置をクリア
  board = setCellAt(board, { row: 3, col: 3 }, null);
  board = setCellAt(board, { row: 3, col: 4 }, null);
  board = setCellAt(board, { row: 4, col: 3 }, null);
  board = setCellAt(board, { row: 4, col: 4 }, null);

  // (4,4)の周囲8方向に白石を配置し、その先に黒石を配置
  // 左上斜め: (3,3)-white, (2,2)-black
  board = setCellAt(board, { row: 3, col: 3 }, 'white');
  board = setCellAt(board, { row: 2, col: 2 }, 'black');
  // 上: (3,4)-white, (2,4)-black
  board = setCellAt(board, { row: 3, col: 4 }, 'white');
  board = setCellAt(board, { row: 2, col: 4 }, 'black');
  // ... (全8方向同様)

  const result = applyMove(board, { row: 4, col: 4 }, 'black');

  expect(result.success).toBe(true);
  if (result.success) {
    const newBoard = result.value;
    // 周囲8方向の白石が全て黒に反転
    expect(getCellAt(newBoard, { row: 3, col: 3 })).toBe('black');
    expect(getCellAt(newBoard, { row: 3, col: 4 })).toBe('black');
    // ... (全8方向)
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(getCellAt(newBoard, { row: 3, col: 3 })).toBe('black');
  expect(getCellAt(newBoard, { row: 3, col: 4 })).toBe('black');
  expect(getCellAt(newBoard, { row: 3, col: 5 })).toBe('black');
  expect(getCellAt(newBoard, { row: 4, col: 3 })).toBe('black');
  expect(getCellAt(newBoard, { row: 4, col: 4 })).toBe('black');
  expect(getCellAt(newBoard, { row: 4, col: 5 })).toBe('black');
  expect(getCellAt(newBoard, { row: 5, col: 3 })).toBe('black');
  expect(getCellAt(newBoard, { row: 5, col: 4 })).toBe('black');
  expect(getCellAt(newBoard, { row: 5, col: 5 })).toBe('black');
  ```
- **削除判定**: [ ] 不要
- **備考**: 8方向全てで同時に反転が起こる複雑なケースの検証として重要

---

#### Test 2: should flip long chains of stones (5+ stones in a row)

- **元のテストタイトル**: should flip long chains of stones (5+ stones in a row)
- **日本語タイトル**: 5個以上の連続した石を反転できること
- **テスト内容**: 水平方向に5個連続する白石を、両端を黒石で挟むことで全て反転できることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 長い連鎖を作成: black-white-white-white-white-white-empty
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'white');
  board = setCellAt(board, { row: 0, col: 2 }, 'white');
  board = setCellAt(board, { row: 0, col: 3 }, 'white');
  board = setCellAt(board, { row: 0, col: 4 }, 'white');
  board = setCellAt(board, { row: 0, col: 5 }, 'white');
  // (0,6) は空

  const result = applyMove(board, { row: 0, col: 6 }, 'black');

  expect(result.success).toBe(true);
  if (result.success) {
    const newBoard = result.value;
    // 5個の白石が全て黒に反転
    for (let col = 1; col <= 5; col++) {
      expect(getCellAt(newBoard, { row: 0, col })).toBe('black');
    }
    expect(getCellAt(newBoard, { row: 0, col: 6 })).toBe('black');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(getCellAt(newBoard, { row: 0, col: 1 })).toBe('black');
  expect(getCellAt(newBoard, { row: 0, col: 2 })).toBe('black');
  expect(getCellAt(newBoard, { row: 0, col: 3 })).toBe('black');
  expect(getCellAt(newBoard, { row: 0, col: 4 })).toBe('black');
  expect(getCellAt(newBoard, { row: 0, col: 5 })).toBe('black');
  expect(getCellAt(newBoard, { row: 0, col: 6 })).toBe('black');
  ```
- **削除判定**: [ ] 不要
- **備考**: 長い連鎖の反転処理が正しく動作することを検証

---

#### Test 3: should flip multiple chains in different directions from one move

- **元のテストタイトル**: should flip multiple chains in different directions from one move
- **日本語タイトル**: 1手で複数の方向の石を反転できること
- **テスト内容**: (4,4)への着手で、水平方向と垂直方向の両方向で同時に反転が起こることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 初期配置をクリア
  board = setCellAt(board, { row: 3, col: 3 }, null);
  board = setCellAt(board, { row: 3, col: 4 }, null);
  board = setCellAt(board, { row: 4, col: 3 }, null);
  board = setCellAt(board, { row: 4, col: 4 }, null);

  // 水平方向: (4,2)-black, (4,3)-white, (4,4)-empty, (4,5)-white, (4,6)-black
  board = setCellAt(board, { row: 4, col: 2 }, 'black');
  board = setCellAt(board, { row: 4, col: 3 }, 'white');
  board = setCellAt(board, { row: 4, col: 5 }, 'white');
  board = setCellAt(board, { row: 4, col: 6 }, 'black');

  // 垂直方向: (2,4)-black, (3,4)-white, (4,4)-empty, (5,4)-white, (6,4)-black
  board = setCellAt(board, { row: 2, col: 4 }, 'black');
  board = setCellAt(board, { row: 3, col: 4 }, 'white');
  board = setCellAt(board, { row: 5, col: 4 }, 'white');
  board = setCellAt(board, { row: 6, col: 4 }, 'black');

  const result = applyMove(board, { row: 4, col: 4 }, 'black');

  expect(result.success).toBe(true);
  if (result.success) {
    const newBoard = result.value;
    // 水平方向の反転
    expect(getCellAt(newBoard, { row: 4, col: 3 })).toBe('black');
    expect(getCellAt(newBoard, { row: 4, col: 5 })).toBe('black');
    // 垂直方向の反転
    expect(getCellAt(newBoard, { row: 3, col: 4 })).toBe('black');
    expect(getCellAt(newBoard, { row: 5, col: 4 })).toBe('black');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(getCellAt(newBoard, { row: 4, col: 3 })).toBe('black'); // 水平方向
  expect(getCellAt(newBoard, { row: 4, col: 5 })).toBe('black'); // 水平方向
  expect(getCellAt(newBoard, { row: 3, col: 4 })).toBe('black'); // 垂直方向
  expect(getCellAt(newBoard, { row: 5, col: 4 })).toBe('black'); // 垂直方向
  ```
- **削除判定**: [ ] 不要
- **備考**: 複数方向の同時反転が正しく処理されることを検証

---

#### Test 4: should handle corner moves with diagonal flips

- **元のテストタイトル**: should handle corner moves with diagonal flips
- **日本語タイトル**: 角への着手で斜め方向の反転を処理できること
- **テスト内容**: 左上角(0,0)への着手で、斜め方向の石を反転できることを確認する
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 角のシナリオ: (0,0)-empty, (1,1)-white, (2,2)-black
  board = setCellAt(board, { row: 1, col: 1 }, 'white');
  board = setCellAt(board, { row: 2, col: 2 }, 'black');

  const result = applyMove(board, { row: 0, col: 0 }, 'black');

  expect(result.success).toBe(true);
  if (result.success) {
    const newBoard = result.value;
    expect(getCellAt(newBoard, { row: 0, col: 0 })).toBe('black');
    expect(getCellAt(newBoard, { row: 1, col: 1 })).toBe('black');
    expect(getCellAt(newBoard, { row: 2, col: 2 })).toBe('black');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(getCellAt(newBoard, { row: 0, col: 0 })).toBe('black');
  expect(getCellAt(newBoard, { row: 1, col: 1 })).toBe('black');
  expect(getCellAt(newBoard, { row: 2, col: 2 })).toBe('black');
  ```
- **削除判定**: [ ] 不要
- **備考**: 角での斜め方向の反転処理を検証

---

#### Test 5: should not flip stones beyond the terminating player stone

- **元のテストタイトル**: should not flip stones beyond the terminating player stone
- **日本語タイトル**: 挟む石の外側の石は反転しないこと
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // パターン: black-white-white-black-white-empty
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'white');
  board = setCellAt(board, { row: 0, col: 2 }, 'white');
  board = setCellAt(board, { row: 0, col: 3 }, 'black'); // これで反転が終了
  board = setCellAt(board, { row: 0, col: 4 }, 'white'); // これは反転されるべき
  // (0,5) は空

  const result = applyMove(board, { row: 0, col: 5 }, 'black');

  expect(result.success).toBe(true);
  if (result.success) {
    const newBoard = result.value;
    // (0,4)は(0,3)のblackと(0,5)のblackで挟まれるので反転
    expect(getCellAt(newBoard, { row: 0, col: 4 })).toBe('black');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(getCellAt(newBoard, { row: 0, col: 4 })).toBe('black');
  ```
- **削除判定**: [ ] 不要
- **備考**: 反転範囲の正確性を検証

---

### applyMove - Boundary Conditions

#### Test 6: should handle moves at all four corners

- **元のテストタイトル**: should handle moves at all four corners
- **日本語タイトル**: 4隅全てへの着手を正しく処理できること
- **テスト内容**: 4隅それぞれに対して有効な着手シナリオを作り、正しく処理できることを確認する
- **テストコード抜粋**:

  ```typescript
  const corners = [
    { row: 0, col: 0 }, // 左上
    { row: 0, col: 7 }, // 右上
    { row: 7, col: 0 }, // 左下
    { row: 7, col: 7 }, // 右下
  ];

  corners.forEach((corner) => {
    let board = createInitialBoard();
    // 各角に対して有効なシナリオを設定
    const adjacent = {
      row: corner.row === 0 ? 1 : 6,
      col: corner.col === 0 ? 1 : 6,
    };
    const terminal = {
      row: corner.row === 0 ? 2 : 5,
      col: corner.col === 0 ? 2 : 5,
    };

    board = setCellAt(board, adjacent, 'white');
    board = setCellAt(board, terminal, 'black');

    const result = applyMove(board, corner, 'black');
    expect(result.success).toBe(true);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true); // 全4隅で
  ```
- **削除判定**: [ ] 不要
- **備考**: 境界値としての角の処理を検証

---

#### Test 7: should handle moves at all four edges

- **元のテストタイトル**: should handle moves at all four edges
- **日本語タイトル**: 4辺全てへの着手を正しく処理できること
- **テスト内容**: 辺への着手が正しく処理されることを確認（この例では既に占有されているセルへの着手を拒否）
- **テストコード抜粋**:

  ```typescript
  // 上辺
  let board = createInitialBoard();
  board = setCellAt(board, { row: 0, col: 3 }, 'black');
  board = setCellAt(board, { row: 1, col: 3 }, 'white');
  board = setCellAt(board, { row: 2, col: 3 }, 'white');
  board = setCellAt(board, { row: 3, col: 3 }, 'black');

  const result = applyMove(board, { row: 0, col: 3 }, 'white');
  expect(result.success).toBe(false); // 既に占有されている
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  ```
- **削除判定**: [ ] 不要
- **備考**: 辺での処理と占有セルの拒否を検証

---

#### Test 8: should reject moves at negative positions

- **元のテストタイトル**: should reject moves at negative positions
- **日本語タイトル**: 負の座標への着手を拒否すること
- **テスト内容**: 負の行インデックスへの着手を拒否することを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  const result = applyMove(board, { row: -1, col: 0 }, 'black');
  expect(result.success).toBe(false);
  ```
- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  ```
- **削除判定**: [ ] 不要
- **備考**: 範囲外座標の拒否を検証

---

#### Test 9: should reject moves beyond board bounds (row >= 8)

- **元のテストタイトル**: should reject moves beyond board bounds (row >= 8)
- **日本語タイトル**: 盤面範囲外（row >= 8）への着手を拒否すること
- **テスト内容**: 行インデックス8以上への着手を拒否することを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  const result = applyMove(board, { row: 8, col: 0 }, 'black');
  expect(result.success).toBe(false);
  ```
- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  ```
- **削除判定**: [ ] 不要
- **備考**: 範囲外座標の拒否を検証

---

#### Test 10: should reject moves beyond board bounds (col >= 8)

- **元のテストタイトル**: should reject moves beyond board bounds (col >= 8)
- **日本語タイトル**: 盤面範囲外（col >= 8）への着手を拒否すること
- **テスト内容**: 列インデックス8以上への着手を拒否することを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  const result = applyMove(board, { row: 0, col: 8 }, 'black');
  expect(result.success).toBe(false);
  ```
- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  ```
- **削除判定**: [ ] 不要
- **備考**: 範囲外座標の拒否を検証

---

### calculateValidMoves - Complex Board States

#### Test 11: should find valid moves in a nearly full board

- **元のテストタイトル**: should find valid moves in a nearly full board
- **日本語タイトル**: ほぼ満杯の盤面で有効手を見つけることができること
- **テスト内容**: 大部分が埋まっている盤面でも、残りのマスから有効手を正しく見つけられることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 盤面の大部分を埋める
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 8; col++) {
      if (row % 2 === 0) {
        board = setCellAt(board, { row, col }, 'black');
      } else {
        board = setCellAt(board, { row, col }, 'white');
      }
    }
  }
  // 7行目は一部空ける
  board = setCellAt(board, { row: 7, col: 0 }, 'white');
  board = setCellAt(board, { row: 7, col: 1 }, 'black');
  // (7,2) から (7,7) は空

  const validMoves = calculateValidMoves(board, 'white');

  expect(validMoves.length).toBeGreaterThan(0);
  validMoves.forEach((move) => {
    expect(getCellAt(board, move)).toBe(null);
  });
  ```

- **期待値**:
  ```typescript
  expect(validMoves.length).toBeGreaterThan(0);
  expect(getCellAt(board, move)).toBe(null); // 全ての有効手で
  ```
- **削除判定**: [ ] 不要
- **備考**: 終盤近くの盤面での有効手計算を検証

---

#### Test 12: should return empty array when player has no valid moves (surrounded)

- **元のテストタイトル**: should return empty array when player has no valid moves (surrounded)
- **日本語タイトル**: プレイヤーに有効手がない場合に空配列を返すこと
- **テスト内容**: 全マスが相手の石で埋まっている場合、有効手が存在しないことを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 全マスを白で埋める
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      board = setCellAt(board, { row, col }, 'white');
    }
  }
  // 1マスだけ空けるが、有効な反転がない
  board = setCellAt(board, { row: 0, col: 0 }, null);

  const validMoves = calculateValidMoves(board, 'black');
  expect(validMoves).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(validMoves).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: 有効手なしの検出を検証

---

#### Test 13: should find moves for white when black has just made a move

- **元のテストタイトル**: should find moves for white when black has just made a move
- **日本語タイトル**: 黒が着手した直後に白の有効手を見つけることができること
- **テスト内容**: 黒が(3,2)に着手した後、白の有効手が正しく計算されることを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // 黒の最初の手 (3,2)
  const result = applyMove(board, { row: 3, col: 2 }, 'black');
  expect(result.success).toBe(true);

  if (result.success) {
    const validMoves = calculateValidMoves(result.value, 'white');

    expect(validMoves.length).toBeGreaterThan(0);

    // 各手が実際に有効であることを確認
    validMoves.forEach((move) => {
      const moveResult = validateMove(result.value, move, 'white');
      expect(moveResult.success).toBe(true);
    });
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(validMoves.length).toBeGreaterThan(0);
  expect(moveResult.success).toBe(true); // 各有効手で
  ```
- **削除判定**: [ ] 不要
- **備考**: 着手後のターン切り替えと有効手計算を検証

---

#### Test 14: should handle alternating sparse and dense areas on the board

- **元のテストタイトル**: should handle alternating sparse and dense areas on the board
- **日本語タイトル**: 疎な領域と密な領域が混在する盤面を処理できること
- **テスト内容**: 盤面の一部が密（石が多い）で、一部が疎（石が少ない）な状態で有効手を計算できることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 左上象限を密に（市松模様）
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if ((row + col) % 2 === 0) {
        board = setCellAt(board, { row, col }, 'black');
      } else {
        board = setCellAt(board, { row, col }, 'white');
      }
    }
  }

  // 右下象限は疎（ほとんど空）

  const validMovesBlack = calculateValidMoves(board, 'black');
  const validMovesWhite = calculateValidMoves(board, 'white');

  expect(validMovesBlack.length + validMovesWhite.length).toBeGreaterThan(0);
  ```

- **期待値**:
  ```typescript
  expect(validMovesBlack.length + validMovesWhite.length).toBeGreaterThan(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: 複雑な盤面状態での有効手計算を検証

---

#### Test 15: should not return duplicate positions even with complex patterns

- **元のテストタイトル**: should not return duplicate positions even with complex patterns
- **日本語タイトル**: 複雑なパターンでも重複した位置を返さないこと
- **テスト内容**: 有効手のリストに重複がないことを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 複雑なパターンを作成
  board = setCellAt(board, { row: 2, col: 2 }, 'black');
  board = setCellAt(board, { row: 2, col: 3 }, 'white');
  board = setCellAt(board, { row: 2, col: 4 }, 'white');
  board = setCellAt(board, { row: 2, col: 5 }, 'black');

  const validMoves = calculateValidMoves(board, 'black');

  const uniqueSet = new Set(validMoves.map((p) => `${p.row},${p.col}`));
  expect(uniqueSet.size).toBe(validMoves.length);
  ```

- **期待値**:
  ```typescript
  expect(uniqueSet.size).toBe(validMoves.length);
  ```
- **削除判定**: [ ] 不要
- **備考**: 重複排除ロジックの正確性を検証

---

### validateMove - Edge Cases

#### Test 16: should reject move that would flip zero stones

- **元のテストタイトル**: should reject move that would flip zero stones
- **日本語タイトル**: 石を反転しない手を拒否すること
- **テスト内容**: (0,0)への着手が反転する石がないため拒否されることを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // (0,0) には隣接する相手の石がないため、反転なし
  const result = validateMove(board, { row: 0, col: 0 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.reason).toBe('no_flips');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('no_flips');
  ```
- **削除判定**: [ ] 不要
- **備考**: 無効手（反転なし）の拒否を検証

---

#### Test 17: should accept move that flips exactly one stone

- **元のテストタイトル**: should accept move that flips exactly one stone
- **日本語タイトル**: 正確に1つの石を反転する手を受け入れること
- **テスト内容**: 初期盤面で(3,2)への着手が1つの石を反転するため有効であることを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // (3,2)-empty, (3,3)-white, (3,4)-black
  // 初期盤面で既にこの配置になっているため、(3,2)は有効

  const result = validateMove(board, { row: 3, col: 2 }, 'black');
  expect(result.success).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 最小限の反転（1石）の有効性を検証

---

#### Test 18: should validate diagonal moves at corners

- **元のテストタイトル**: should validate diagonal moves at corners
- **日本語タイトル**: 角での斜め方向の手を検証すること
- **テスト内容**: 右下角(7,7)への斜め方向の有効手を正しく検証できることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 角: (7,7)-empty, (6,6)-white, (5,5)-black
  board = setCellAt(board, { row: 6, col: 6 }, 'white');
  board = setCellAt(board, { row: 5, col: 5 }, 'black');

  const result = validateMove(board, { row: 7, col: 7 }, 'black');
  expect(result.success).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 角での斜め方向の検証を確認

---

#### Test 19: should reject move on cell occupied by same player

- **元のテストタイトル**: should reject move on cell occupied by same player
- **日本語タイトル**: 同じプレイヤーの石があるマスへの着手を拒否すること
- **テスト内容**: 初期盤面で(3,4)は既に黒石があるため、黒プレイヤーの着手が拒否されることを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // (3,4) は初期盤面で既に黒石
  const result = validateMove(board, { row: 3, col: 4 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.reason).toBe('occupied');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('occupied');
  ```
- **削除判定**: [ ] 不要
- **備考**: 自分の石があるマスへの着手拒否を検証

---

#### Test 20: should reject move on cell occupied by opponent

- **元のテストタイトル**: should reject move on cell occupied by opponent
- **日本語タイトル**: 相手プレイヤーの石があるマスへの着手を拒否すること
- **テスト内容**: 初期盤面で(3,3)は白石があるため、黒プレイヤーの着手が拒否されることを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();

  // (3,3) は初期盤面で白石
  const result = validateMove(board, { row: 3, col: 3 }, 'black');

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.reason).toBe('occupied');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(false);
  expect(result.error.reason).toBe('occupied');
  ```
- **削除判定**: [ ] 不要
- **備考**: 相手の石があるマスへの着手拒否を検証

---

#### Test 21: should handle maximum coordinate boundaries (7,7)

- **元のテストタイトル**: should handle maximum coordinate boundaries (7,7)
- **日本語タイトル**: 最大座標（7,7）を正しく処理すること
- **テスト内容**: 盤面の最大座標(7,7)への有効手が正しく検証されることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // (7,7)を有効な手にする
  board = setCellAt(board, { row: 7, col: 6 }, 'white');
  board = setCellAt(board, { row: 7, col: 5 }, 'black');

  const result = validateMove(board, { row: 7, col: 7 }, 'black');
  expect(result.success).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 最大座標での境界値処理を検証

---

#### Test 22: should handle minimum coordinate boundaries (0,0)

- **元のテストタイトル**: should handle minimum coordinate boundaries (0,0)
- **日本語タイトル**: 最小座標（0,0）を正しく処理すること
- **テスト内容**: 盤面の最小座標(0,0)への有効手が正しく検証されることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // (0,0)を有効な手にする
  board = setCellAt(board, { row: 0, col: 1 }, 'white');
  board = setCellAt(board, { row: 0, col: 2 }, 'black');

  const result = validateMove(board, { row: 0, col: 0 }, 'black');
  expect(result.success).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 最小座標での境界値処理を検証

---

### Immutability Guarantees

#### Test 23: should never modify the original board in applyMove

- **元のテストタイトル**: should never modify the original board in applyMove
- **日本語タイトル**: applyMoveが元の盤面を変更しないこと
- **テスト内容**: applyMove実行後も元の盤面が変更されていないことを確認（イミュータビリティ）
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const originalCell = getCellAt(board, { row: 3, col: 2 });
  const originalFlipTarget = getCellAt(board, { row: 3, col: 3 });

  applyMove(board, { row: 3, col: 2 }, 'black');

  // 元の盤面は変更されていない
  expect(getCellAt(board, { row: 3, col: 2 })).toBe(originalCell);
  expect(getCellAt(board, { row: 3, col: 3 })).toBe(originalFlipTarget);
  ```

- **期待値**:
  ```typescript
  expect(getCellAt(board, { row: 3, col: 2 })).toBe(originalCell);
  expect(getCellAt(board, { row: 3, col: 3 })).toBe(originalFlipTarget);
  ```
- **削除判定**: [ ] 不要
- **備考**: データの不変性保証として重要

---

#### Test 24: should return frozen board from applyMove

- **元のテストタイトル**: should return frozen board from applyMove
- **日本語タイトル**: applyMoveがObject.freeze()された盤面を返すこと
- **テスト内容**: 返された盤面がObject.freeze()されていることを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const result = applyMove(board, { row: 3, col: 2 }, 'black');

  expect(result.success).toBe(true);
  if (result.success) {
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen(result.value[0])).toBe(true);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.success).toBe(true);
  expect(Object.isFrozen(result.value)).toBe(true);
  expect(Object.isFrozen(result.value[0])).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: Object.freeze()による不変性の強制を検証

---

#### Test 25: should not modify board during calculateValidMoves

- **元のテストタイトル**: should not modify board during calculateValidMoves
- **日本語タイトル**: calculateValidMovesが盤面を変更しないこと
- **テスト内容**: 有効手計算中に元の盤面が変更されていないことを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const originalBoard = JSON.stringify(board);

  calculateValidMoves(board, 'black');

  expect(JSON.stringify(board)).toBe(originalBoard);
  ```

- **期待値**:
  ```typescript
  expect(JSON.stringify(board)).toBe(originalBoard);
  ```
- **削除判定**: [ ] 不要
- **備考**: 読み取り専用操作での不変性を検証

---

### Performance and Stress Tests

#### Test 26: should handle calculating valid moves on empty board efficiently

- **元のテストタイトル**: should handle calculating valid moves on empty board efficiently
- **日本語タイトル**: 空の盤面での有効手計算が効率的であること
- **テスト内容**: 完全に空の盤面では有効手がないことを確認（パフォーマンステスト）
- **テストコード抜粋**:

  ```typescript
  const emptyBoard: Board = Object.freeze(
    Array(8)
      .fill(null)
      .map(() => Object.freeze(Array(8).fill(null)))
  );

  const validMoves = calculateValidMoves(emptyBoard, 'black');

  expect(validMoves).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(validMoves).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: エッジケース（空盤面）での動作を検証

---

#### Test 27: should handle calculateValidMoves on full board efficiently

- **元のテストタイトル**: should handle calculateValidMoves on full board efficiently
- **日本語タイトル**: 満杯の盤面での有効手計算が効率的であること
- **テスト内容**: 完全に埋まった盤面では有効手がないことを確認（パフォーマンステスト）
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 全マスを埋める
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      board = setCellAt(board, { row, col }, 'black');
    }
  }

  const validMoves = calculateValidMoves(board, 'white');

  expect(validMoves).toEqual([]);
  ```

- **期待値**:
  ```typescript
  expect(validMoves).toEqual([]);
  ```
- **削除判定**: [ ] 不要
- **備考**: エッジケース（満杯盤面）での動作を検証

---

#### Test 28: should handle complex board state with many flips efficiently

- **元のテストタイトル**: should handle complex board state with many flips efficiently
- **日本語タイトル**: 多数の反転がある複雑な盤面を効率的に処理できること
- **テスト内容**: 市松模様の複雑な盤面で有効手を計算できることを確認（パフォーマンステスト）
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();

  // 市松模様を作成（中央4マスを除く）
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (
        (row + col) % 2 === 0 &&
        !(row >= 3 && row <= 4 && col >= 3 && col <= 4)
      ) {
        board = setCellAt(board, { row, col }, 'black');
      } else if (!(row >= 3 && row <= 4 && col >= 3 && col <= 4)) {
        board = setCellAt(board, { row, col }, 'white');
      }
    }
  }

  const validMoves = calculateValidMoves(board, 'black');

  expect(Array.isArray(validMoves)).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(Array.isArray(validMoves)).toBe(true);
  ```
- **削除判定**: [ ] 不要
- **備考**: 複雑な盤面状態でのパフォーマンスを検証

---

## サマリー

### 保持推奨テスト: 28件（全て）

このファイルは**ゲームロジックの包括的テスト**であり、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 複雑な反転パターン（5件）: 8方向同時反転、長い連鎖、複数方向、角の処理、反転範囲の検証
- 境界条件（5件）: 4隅、4辺、負の座標、範囲外（row/col >= 8）
- 有効手計算（5件）: ほぼ満杯の盤面、有効手なし、ターン切り替え、疎密混在、重複排除
- 手の検証（8件）: 反転なし拒否、1石反転受理、角での斜め、占有マス拒否、境界座標
- 不変性保証（3件）: 元盤面の不変性、freeze確認、読み取り専用操作
- パフォーマンス（3件）: 空盤面、満杯盤面、複雑な盤面

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

包括的テストは以下の理由で重要です：

- リバーシの中核ロジック（反転計算）の完全な検証
- エッジケースと境界条件の網羅的なカバレッジ
- データの不変性保証
- パフォーマンス要件の確認
- リグレッション防止

変更不要です。
