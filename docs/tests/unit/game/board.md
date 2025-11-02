# board.test.ts

## ファイル情報

- **テストファイル**: `src/lib/game/__tests__/board.test.ts`
- **テスト対象コード**: `src/lib/game/board.ts`
- **テスト数**: 13
- **削除推奨テスト数**: 0

## テストケース一覧

### createInitialBoard

#### Test 1: should create an 8x8 board

- **元のテストタイトル**: should create an 8x8 board
- **日本語タイトル**: 8x8の盤面を作成すること
- **テスト内容**: 初期盤面が8行8列で作成されることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  expect(board).toHaveLength(8);
  expect(board[0]).toHaveLength(8);
  ```
- **期待値**:
  ```typescript
  expect(board).toHaveLength(8);
  expect(board[0]).toHaveLength(8);
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should place 2 black and 2 white stones in the center

- **元のテストタイトル**: should place 2 black and 2 white stones in the center
- **日本語タイトル**: 中央に黒石2個と白石2個を配置すること
- **テスト内容**: リバーシの初期配置（中央4マス）が正しく設定されることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  expect(board[3][3]).toBe('white');
  expect(board[3][4]).toBe('black');
  expect(board[4][3]).toBe('black');
  expect(board[4][4]).toBe('white');
  ```
- **期待値**:
  ```typescript
  expect(board[3][3]).toBe('white');
  expect(board[3][4]).toBe('black');
  expect(board[4][3]).toBe('black');
  expect(board[4][4]).toBe('white');
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should have all other cells as null

- **元のテストタイトル**: should have all other cells as null
- **日本語タイトル**: その他の全てのセルがnullであること
- **テスト内容**: 初期4石以外の60マスが全てnullであることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  let nullCount = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === null) {
        nullCount++;
      }
    }
  }
  expect(nullCount).toBe(60); // 64 - 4 initial stones
  ```
- **期待値**:
  ```typescript
  expect(nullCount).toBe(60);
  ```
- **削除判定**: [ ] 不要
- **備考**: nullの初期化が正しいことを検証する重要なテスト

---

#### Test 4: should create immutable nested arrays

- **元のテストタイトル**: should create immutable nested arrays
- **日本語タイトル**: イミュータブルなネストされた配列を作成すること
- **テスト内容**: 盤面とその行がObject.freeze()で凍結されていることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  expect(Object.isFrozen(board)).toBe(true);
  expect(Object.isFrozen(board[0])).toBe(true);
  ```
- **期待値**:
  ```typescript
  expect(Object.isFrozen(board)).toBe(true);
  expect(Object.isFrozen(board[0])).toBe(true);
  ```
- **削除判定**: [ ] 不要

---

### countStones

#### Test 5: should count initial board correctly

- **元のテストタイトル**: should count initial board correctly
- **日本語タイトル**: 初期盤面を正しくカウントすること
- **テスト内容**: 初期盤面で黒2個、白2個を正しくカウントすることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  const count = countStones(board);
  expect(count).toEqual({ black: 2, white: 2 });
  ```
- **期待値**:
  ```typescript
  expect(count).toEqual({ black: 2, white: 2 });
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should count an empty board

- **元のテストタイトル**: should count an empty board
- **日本語タイトル**: 空の盤面をカウントすること
- **テスト内容**: 全マスが空の盤面で黒0個、白0個をカウントすることを確認
- **テストコード抜粋**:
  ```typescript
  const emptyBoard: Board = Object.freeze(
    Array(8)
      .fill(null)
      .map(() => Object.freeze(Array(8).fill(null)))
  );
  const count = countStones(emptyBoard);
  expect(count).toEqual({ black: 0, white: 0 });
  ```
- **期待値**:
  ```typescript
  expect(count).toEqual({ black: 0, white: 0 });
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should count a board with more stones

- **元のテストタイトル**: should count a board with more stones
- **日本語タイトル**: より多くの石がある盤面をカウントすること
- **テスト内容**: 初期配置+追加の石を正しくカウントすることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  const mutableBoard = board.map((row) => [...row]);
  mutableBoard[0][0] = 'black';
  mutableBoard[0][1] = 'white';
  mutableBoard[7][7] = 'black';
  const testBoard: Board = Object.freeze(
    mutableBoard.map((row) => Object.freeze(row))
  );
  const count = countStones(testBoard);
  expect(count).toEqual({ black: 4, white: 3 });
  ```
- **期待値**:
  ```typescript
  expect(count).toEqual({ black: 4, white: 3 });
  ```
- **削除判定**: [ ] 不要

---

### cloneBoard

#### Test 8: should create a deep copy of the board

- **元のテストタイトル**: should create a deep copy of the board
- **日本語タイトル**: 盤面のディープコピーを作成すること
- **テスト内容**: クローンが元の盤面と等しいが、別のオブジェクトであることを確認
- **テストコード抜粋**:
  ```typescript
  const original = createInitialBoard();
  const clone = cloneBoard(original);
  expect(clone).toEqual(original);
  expect(clone).not.toBe(original);
  ```
- **期待値**:
  ```typescript
  expect(clone).toEqual(original);
  expect(clone).not.toBe(original);
  ```
- **削除判定**: [ ] 不要

---

#### Test 9: should not modify original when clone is modified

- **元のテストタイトル**: should not modify original when clone is modified
- **日本語タイトル**: クローンが変更されても元の盤面が変更されないこと
- **テスト内容**: クローンを変更しても元の盤面に影響しないことを確認（深いコピーの検証）
- **テストコード抜粋**:
  ```typescript
  const original = createInitialBoard();
  const clone = cloneBoard(original);
  const mutableClone = clone.map((row) => [...row]);
  mutableClone[0][0] = 'black';
  expect(original[0][0]).toBe(null);
  ```
- **期待値**:
  ```typescript
  expect(original[0][0]).toBe(null);
  ```
- **削除判定**: [ ] 不要

---

### getCellAt

#### Test 10: should get the correct cell value

- **元のテストタイトル**: should get the correct cell value
- **日本語タイトル**: 正しいセル値を取得すること
- **テスト内容**: 指定した位置のセル値を正しく取得できることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  expect(getCellAt(board, { row: 3, col: 3 })).toBe('white');
  expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
  ```
- **期待値**:
  ```typescript
  expect(getCellAt(board, { row: 3, col: 3 })).toBe('white');
  expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
  ```
- **削除判定**: [ ] 不要

---

#### Test 11: should throw error for out of bounds position

- **元のテストタイトル**: should throw error for out of bounds position
- **日本語タイトル**: 範囲外の位置に対してエラーをスローすること
- **テスト内容**: 盤面外の位置にアクセスした場合にエラーをスローすることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  expect(() => getCellAt(board, { row: -1, col: 0 })).toThrow();
  expect(() => getCellAt(board, { row: 0, col: 8 })).toThrow();
  ```
- **期待値**:
  ```typescript
  expect(() => getCellAt(board, { row: -1, col: 0 })).toThrow();
  expect(() => getCellAt(board, { row: 0, col: 8 })).toThrow();
  ```
- **削除判定**: [ ] 不要

---

### setCellAt

#### Test 12: should return a new board with updated cell

- **元のテストタイトル**: should return a new board with updated cell
- **日本語タイトル**: 更新されたセルを持つ新しい盤面を返すこと
- **テスト内容**: セルを更新した新しい盤面を返し、元の盤面は変更されないことを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  const newBoard = setCellAt(board, { row: 0, col: 0 }, 'black');
  expect(getCellAt(newBoard, { row: 0, col: 0 })).toBe('black');
  expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
  ```
- **期待値**:
  ```typescript
  expect(getCellAt(newBoard, { row: 0, col: 0 })).toBe('black');
  expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
  ```
- **削除判定**: [ ] 不要

---

#### Test 13: should throw error for out of bounds position

- **元のテストタイトル**: should throw error for out of bounds position
- **日本語タイトル**: 範囲外の位置に対してエラーをスローすること
- **テスト内容**: 盤面外の位置にセットしようとした場合にエラーをスローすることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  expect(() => setCellAt(board, { row: 8, col: 0 }, 'black')).toThrow();
  ```
- **期待値**:
  ```typescript
  expect(() => setCellAt(board, { row: 8, col: 0 }, 'black')).toThrow();
  ```
- **削除判定**: [ ] 不要

---

#### Test 14: should return an immutable board

- **元のテストタイトル**: should return an immutable board
- **日本語タイトル**: イミュータブルな盤面を返すこと
- **テスト内容**: 新しく作成された盤面がObject.freeze()で凍結されていることを確認
- **テストコード抜粋**:
  ```typescript
  const board = createInitialBoard();
  const newBoard = setCellAt(board, { row: 0, col: 0 }, 'black');
  expect(Object.isFrozen(newBoard)).toBe(true);
  expect(Object.isFrozen(newBoard[0])).toBe(true);
  ```
- **期待値**:
  ```typescript
  expect(Object.isFrozen(newBoard)).toBe(true);
  expect(Object.isFrozen(newBoard[0])).toBe(true);
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 13件（全て）

このファイルは**盤面データモデルの基本操作**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 初期盤面作成テスト（4件）: サイズ、初期配置、null初期化、イミュータビリティ
- 石のカウントテスト（3件）: 初期、空、カスタム盤面
- 盤面クローンテスト（2件）: ディープコピー、元の盤面の独立性
- セル取得テスト（2件）: 正常取得、範囲外エラー
- セル設定テスト（3件）: 正常設定、範囲外エラー、イミュータビリティ

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

盤面データモデルは以下の理由で包括的なテストが重要です：

- ゲームロジックの基盤となるデータ構造
- イミュータビリティの保証が必須
- 境界値チェックが重要（範囲外アクセス）
- ディープコピーの正しさが重要

変更不要です。
