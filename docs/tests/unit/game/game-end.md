# game-end.test.ts

## ファイル情報

- **テストファイル**: `src/lib/game/__tests__/game-end.test.ts`
- **テスト対象コード**: `src/lib/game/game-end.ts`
- **テスト数**: 9
- **削除推奨テスト数**: 0

## テストケース一覧

### checkGameEnd

#### Test 1: should return not ended for initial board

- **元のテストタイトル**: should return not ended for initial board
- **日本語タイトル**: 初期盤面に対してゲーム終了していないことを返すこと
- **テスト内容**: 初期盤面ではゲームが継続中であることを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const blackMoves = calculateValidMoves(board, 'black');
  const whiteMoves = calculateValidMoves(board, 'white');

  const result = checkGameEnd(board, blackMoves, whiteMoves);
  expect(result.ended).toBe(false);
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(false);
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should detect game end when board is full

- **元のテストタイトル**: should detect game end when board is full
- **日本語タイトル**: 盤面が満杯の時にゲーム終了を検出すること
- **テスト内容**: 全マスが埋まった場合にゲーム終了を検出し、勝者を判定することを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      board = setCellAt(board, { row, col }, 'black');
    }
  }

  const result = checkGameEnd(board, [], []);
  expect(result.ended).toBe(true);
  if (result.ended) {
    expect(result.winner).toBe('black');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(true);
  expect(result.winner).toBe('black');
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: should detect game end when both players have no valid moves

- **元のテストタイトル**: should detect game end when both players have no valid moves
- **日本語タイトル**: 両プレイヤーに有効な手がない時にゲーム終了を検出すること
- **テスト内容**: 両プレイヤーの有効手リストが空の場合、ゲーム終了を検出することを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const blackMoves: Position[] = [];
  const whiteMoves: Position[] = [];

  const result = checkGameEnd(board, blackMoves, whiteMoves);
  expect(result.ended).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(true);
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: should determine black as winner when black has more stones

- **元のテストタイトル**: should determine black as winner when black has more stones
- **日本語タイトル**: 黒石が多い場合に黒を勝者と判定すること
- **テスト内容**: 黒石の数が白石より多い場合、黒が勝者として判定されることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();
  for (let col = 0; col < 5; col++) {
    board = setCellAt(board, { row: 0, col }, 'black');
  }
  for (let col = 0; col < 3; col++) {
    board = setCellAt(board, { row: 1, col }, 'white');
  }

  const result = checkGameEnd(board, [], []);
  expect(result.ended).toBe(true);
  if (result.ended) {
    expect(result.winner).toBe('black');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(true);
  expect(result.winner).toBe('black');
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should determine white as winner when white has more stones

- **元のテストタイトル**: should determine white as winner when white has more stones
- **日本語タイトル**: 白石が多い場合に白を勝者と判定すること
- **テスト内容**: 白石の数が黒石より多い場合、白が勝者として判定されることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();
  for (let col = 0; col < 5; col++) {
    board = setCellAt(board, { row: 0, col }, 'white');
  }
  for (let col = 0; col < 3; col++) {
    board = setCellAt(board, { row: 1, col }, 'black');
  }

  const result = checkGameEnd(board, [], []);
  expect(result.ended).toBe(true);
  if (result.ended) {
    expect(result.winner).toBe('white');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(true);
  expect(result.winner).toBe('white');
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: should determine draw when both players have equal stones

- **元のテストタイトル**: should determine draw when both players have equal stones
- **日本語タイトル**: 両プレイヤーの石数が等しい場合に引き分けと判定すること
- **テスト内容**: 黒石と白石の数が同じ場合、引き分けとして判定されることを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();
  for (let col = 0; col < 4; col++) {
    board = setCellAt(board, { row: 0, col }, 'black');
    board = setCellAt(board, { row: 1, col }, 'white');
  }

  const result = checkGameEnd(board, [], []);
  expect(result.ended).toBe(true);
  if (result.ended) {
    expect(result.winner).toBe('draw');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(true);
  expect(result.winner).toBe('draw');
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should continue game when at least one player has valid moves

- **元のテストタイトル**: should continue game when at least one player has valid moves
- **日本語タイトル**: 少なくとも一方のプレイヤーに有効な手がある場合ゲームを継続すること
- **テスト内容**: 一方のプレイヤーに有効な手がある場合、ゲームが継続することを確認
- **テストコード抜粋**:

  ```typescript
  const board = createInitialBoard();
  const blackMoves = calculateValidMoves(board, 'black');
  const whiteMoves: Position[] = []; // White has no moves but black does

  const result = checkGameEnd(board, blackMoves, whiteMoves);
  expect(result.ended).toBe(false);
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(false);
  ```
- **削除判定**: [ ] 不要

---

#### Test 8: should handle edge case with single player having all stones

- **元のテストタイトル**: should handle edge case with single player having all stones
- **日本語タイトル**: 一方のプレイヤーが全ての石を持つエッジケースを処理すること
- **テスト内容**: 全64マスが一方の色で埋まった場合の勝者判定と石数カウントを確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      board = setCellAt(board, { row, col }, 'black');
    }
  }

  const result = checkGameEnd(board, [], []);
  expect(result.ended).toBe(true);
  if (result.ended) {
    expect(result.winner).toBe('black');
    const stones = countStones(board);
    expect(stones.black).toBe(64);
    expect(stones.white).toBe(0);
  }
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(true);
  expect(result.winner).toBe('black');
  expect(stones.black).toBe(64);
  expect(stones.white).toBe(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: Test 2と類似しているが、明示的に石数カウント(64-0)を検証している点で追加価値がある

---

#### Test 9: should correctly count stones when determining winner

- **元のテストタイトル**: should correctly count stones when determining winner
- **日本語タイトル**: 勝者判定時に石を正しくカウントすること
- **テスト内容**: 石を追加した後の正確な石数カウントと勝者判定を確認
- **テストコード抜粋**:

  ```typescript
  let board = createInitialBoard();
  board = setCellAt(board, { row: 0, col: 0 }, 'black');
  board = setCellAt(board, { row: 0, col: 1 }, 'black');
  board = setCellAt(board, { row: 0, col: 2 }, 'white');

  const result = checkGameEnd(board, [], []);
  expect(result.ended).toBe(true);
  if (result.ended) {
    const stones = countStones(board);
    expect(stones.black).toBe(4);
    expect(stones.white).toBe(3);
    expect(result.winner).toBe('black');
  }
  ```

- **期待値**:
  ```typescript
  expect(result.ended).toBe(true);
  expect(stones.black).toBe(4);
  expect(stones.white).toBe(3);
  expect(result.winner).toBe('black');
  ```
- **削除判定**: [ ] 不要
- **備考**: 明示的に石数カウントロジックを検証する重要なテスト

---

## サマリー

### 保持推奨テスト: 9件（全て）

このファイルは**ゲーム終了判定ロジック**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- ゲーム継続判定（2件）: 初期盤面、片方に手あり
- ゲーム終了判定（7件）: 盤面満杯、両者手なし、各種勝敗パターン

**勝敗判定のカバレッジ:**

- 黒勝利
- 白勝利
- 引き分け
- 完全勝利（64-0）
- 石数カウント検証

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

ゲーム終了判定は以下の理由で包括的なテストが重要です：

- ゲームの終了条件が複数ある（盤面満杯、両者手なし）
- 勝敗判定の正確性が重要
- エッジケース（完全勝利など）の処理が必要
- 石数カウントの正確性が勝敗に直結

変更不要です。
