# useGameState Tests

## ファイル情報

- **テストファイル**:
  - `src/hooks/__tests__/useGameState.test.ts` (16テスト)
  - `src/hooks/__tests__/useGameState-pass.test.ts` (11テスト)
- **テスト対象コード**: `src/hooks/useGameState.ts`
- **テスト数**: 27
- **削除推奨テスト数**: 0

## 概要

このファイルは**useGameStateフック**をテストしています。

useGameStateフックは、リバーシゲームの中核的な状態管理を提供します:

- 現在のプレイヤー（currentPlayer）
- ゲームステータス（gameStatus）
- AI思考中フラグ（isAIThinking）
- ボード状態（board）
- 有効な着手（validMoves）
- 連続パスカウンタ（consecutivePassCount）
- 着手履歴（moveHistory, notationString）

## テストケース一覧

### useGameState.test.ts - Basic game state management（5件）

#### Test 1: should initialize with default game state

- **元のテストタイトル**: should initialize with default game state
- **日本語タイトル**: デフォルトのゲーム状態で初期化されること
- **テスト内容**: useGameStateフックが呼ばれた時、正しいデフォルト値で初期化されることを確認（currentPlayer=black, gameStatus=playing, isAIThinking=false, board長さ=8, validMovesが存在）
- **テストコード抜粋**:

  ```typescript
  it('should initialize with default game state', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.currentPlayer).toBe('black');
    expect(result.current.gameStatus).toEqual({ type: 'playing' });
    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.board).toHaveLength(8);
    expect(result.current.validMoves.length).toBeGreaterThan(0);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.currentPlayer).toBe('black');
  expect(result.current.gameStatus).toEqual({ type: 'playing' });
  expect(result.current.isAIThinking).toBe(false);
  expect(result.current.board).toHaveLength(8);
  expect(result.current.validMoves.length).toBeGreaterThan(0);
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: should switch player from black to white

- **元のテストタイトル**: should switch player from black to white
- **日本語タイトル**: 黒から白へプレイヤーが切り替わること
- **テスト内容**: switchPlayer()を呼び出すことで、currentPlayerが'black'から'white'に変わることを確認
- **テストコード抜粋**:

  ```typescript
  it('should switch player from black to white', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.currentPlayer).toBe('black');

    act(() => {
      result.current.switchPlayer();
    });

    expect(result.current.currentPlayer).toBe('white');
  });
  ```

- **期待値**:

  ```typescript
  // Before switch
  expect(result.current.currentPlayer).toBe('black');

  // After switch
  expect(result.current.currentPlayer).toBe('white');
  ```

- **削除判定**: [ ] 不要

---

#### Test 3: should switch player from white to black

- **元のテストタイトル**: should switch player from white to black
- **日本語タイトル**: 白から黒へプレイヤーが切り替わること
- **テスト内容**: switchPlayer()を2回呼び出すことで、black→white→blackと切り替わることを確認
- **テストコード抜粋**:

  ```typescript
  it('should switch player from white to black', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.switchPlayer();
    });

    expect(result.current.currentPlayer).toBe('white');

    act(() => {
      result.current.switchPlayer();
    });

    expect(result.current.currentPlayer).toBe('black');
  });
  ```

- **期待値**:

  ```typescript
  // After first switch
  expect(result.current.currentPlayer).toBe('white');

  // After second switch
  expect(result.current.currentPlayer).toBe('black');
  ```

- **削除判定**: [ ] 不要

---

#### Test 4: should update game status

- **元のテストタイトル**: should update game status
- **日本語タイトル**: ゲームステータスが更新されること
- **テスト内容**: updateGameStatus()を呼び出すことで、gameStatusが新しい値に更新されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should update game status', () => {
    const { result } = renderHook(() => useGameState());

    const newStatus: GameStatus = { type: 'finished', winner: 'black' };

    act(() => {
      result.current.updateGameStatus(newStatus);
    });

    expect(result.current.gameStatus).toEqual(newStatus);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.gameStatus).toEqual({
    type: 'finished',
    winner: 'black',
  });
  ```
- **削除判定**: [ ] 不要

---

#### Test 5: should reset game to initial state

- **元のテストタイトル**: should reset game to initial state
- **日本語タイトル**: ゲームが初期状態にリセットされること
- **テスト内容**: 状態を変更した後にresetGame()を呼び出すと、全ての状態が初期値に戻ることを確認（currentPlayer=black, gameStatus=playing, isAIThinking=false）
- **テストコード抜粋**:

  ```typescript
  it('should reset game to initial state', () => {
    const { result } = renderHook(() => useGameState());

    // Modify state
    act(() => {
      result.current.switchPlayer();
      result.current.updateGameStatus({ type: 'finished', winner: 'white' });
      result.current.setAIThinking(true);
    });

    // Reset
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.currentPlayer).toBe('black');
    expect(result.current.gameStatus).toEqual({ type: 'playing' });
    expect(result.current.isAIThinking).toBe(false);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.currentPlayer).toBe('black');
  expect(result.current.gameStatus).toEqual({ type: 'playing' });
  expect(result.current.isAIThinking).toBe(false);
  ```
- **削除判定**: [ ] 不要

---

### useGameState.test.ts - Consecutive pass count management (Task 1.1)（5件）

#### Test 6: should initialize consecutivePassCount to 0

- **元のテストタイトル**: should initialize consecutivePassCount to 0
- **日本語タイトル**: consecutivePassCountが0で初期化されること
- **テスト内容**: useGameStateフックが呼ばれた時、consecutivePassCountが0で初期化されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should initialize consecutivePassCount to 0', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.consecutivePassCount).toBe(0);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(0);
  ```
- **削除判定**: [ ] 不要

---

#### Test 7: should increment consecutivePassCount by 1 when incrementPassCount is called

- **元のテストタイトル**: should increment consecutivePassCount by 1 when incrementPassCount is called
- **日本語タイトル**: incrementPassCount呼び出し時に1ずつ増加すること
- **テスト内容**: incrementPassCount()を呼び出すたびに、consecutivePassCountが1ずつ増加することを確認（0→1→2）
- **テストコード抜粋**:

  ```typescript
  it('should increment consecutivePassCount by 1 when incrementPassCount is called', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.consecutivePassCount).toBe(0);

    act(() => {
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(1);

    act(() => {
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(2);
  });
  ```

- **期待値**:

  ```typescript
  // Initial
  expect(result.current.consecutivePassCount).toBe(0);

  // After first increment
  expect(result.current.consecutivePassCount).toBe(1);

  // After second increment
  expect(result.current.consecutivePassCount).toBe(2);
  ```

- **削除判定**: [ ] 不要

---

#### Test 8: should reset consecutivePassCount to 0 when resetPassCount is called

- **元のテストタイトル**: should reset consecutivePassCount to 0 when resetPassCount is called
- **日本語タイトル**: resetPassCount呼び出し時に0にリセットされること
- **テスト内容**: consecutivePassCountを2まで増やした後、resetPassCount()を呼び出すと0に戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should reset consecutivePassCount to 0 when resetPassCount is called', () => {
    const { result } = renderHook(() => useGameState());

    // Increment count first
    act(() => {
      result.current.incrementPassCount();
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(2);

    // Reset
    act(() => {
      result.current.resetPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(0);
  });
  ```

- **期待値**:

  ```typescript
  // After increments
  expect(result.current.consecutivePassCount).toBe(2);

  // After reset
  expect(result.current.consecutivePassCount).toBe(0);
  ```

- **削除判定**: [ ] 不要

---

#### Test 9: should reset consecutivePassCount to 0 when resetGame is called

- **元のテストタイトル**: should reset consecutivePassCount to 0 when resetGame is called
- **日本語タイトル**: resetGame呼び出し時に0にリセットされること
- **テスト内容**: consecutivePassCountを1まで増やした後、resetGame()を呼び出すと0に戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should reset consecutivePassCount to 0 when resetGame is called', () => {
    const { result } = renderHook(() => useGameState());

    // Increment count
    act(() => {
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(1);

    // Reset game
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.consecutivePassCount).toBe(0);
  });
  ```

- **期待値**:

  ```typescript
  // After increment
  expect(result.current.consecutivePassCount).toBe(1);

  // After reset game
  expect(result.current.consecutivePassCount).toBe(0);
  ```

- **削除判定**: [ ] 不要

---

#### Test 10: should ensure consecutivePassCount stays within 0-2 range

- **元のテストタイトル**: should ensure consecutivePassCount stays within 0-2 range
- **日本語タイトル**: consecutivePassCountが0-2の範囲内に維持されること
- **テスト内容**: consecutivePassCountが上限2を超えないこと、resetPassCount()後に0以上であることを確認
- **テストコード抜粋**:

  ```typescript
  it('should ensure consecutivePassCount stays within 0-2 range', () => {
    const { result } = renderHook(() => useGameState());

    // Test upper bound
    act(() => {
      result.current.incrementPassCount();
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(2);

    // Additional increments should not exceed 2 (game should end at 2)
    act(() => {
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);

    // Test lower bound after reset
    act(() => {
      result.current.resetPassCount();
    });

    expect(result.current.consecutivePassCount).toBeGreaterThanOrEqual(0);
  });
  ```

- **期待値**:

  ```typescript
  // After 2 increments
  expect(result.current.consecutivePassCount).toBe(2);

  // After 3rd increment (should not exceed 2)
  expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);

  // After reset (should be >= 0)
  expect(result.current.consecutivePassCount).toBeGreaterThanOrEqual(0);
  ```

- **削除判定**: [ ] 不要
- **備考**: ゲームルール上、連続パスが2回発生したらゲーム終了となるため、カウンタは0-2の範囲内に維持される

---

### useGameState.test.ts - Move history management (Task 3.1)（6件）

#### Test 11: should initialize moveHistory as empty array and notationString as empty string

- **元のテストタイトル**: should initialize moveHistory as empty array and notationString as empty string
- **日本語タイトル**: moveHistoryが空配列、notationStringが空文字列で初期化されること
- **テスト内容**: useGameStateフックが呼ばれた時、moveHistoryが空配列[]、notationStringが空文字列''で初期化されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should initialize moveHistory as empty array and notationString as empty string', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.moveHistory).toEqual([]);
    expect(result.current.notationString).toBe('');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.moveHistory).toEqual([]);
  expect(result.current.notationString).toBe('');
  ```
- **削除判定**: [ ] 不要

---

#### Test 12: should add move to history when updateBoard is called with lastMove

- **元のテストタイトル**: should add move to history when updateBoard is called with lastMove
- **日本語タイトル**: lastMove付きでupdateBoardが呼ばれた際、着手が履歴に追加されること
- **テスト内容**: updateBoard()をlastMove={row:4, col:5}付きで呼び出すと、moveHistoryに['f5']、notationStringに'f5'が記録されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should add move to history when updateBoard is called with lastMove', () => {
    const { result } = renderHook(() => useGameState());

    // Create a mock new board (exact content doesn't matter for this test)
    const newBoard = result.current.board;

    // Update board with a move at position (4, 5) which should convert to "f5"
    act(() => {
      result.current.updateBoard(newBoard, { row: 4, col: 5 });
    });

    expect(result.current.moveHistory).toEqual(['f5']);
    expect(result.current.notationString).toBe('f5');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.moveHistory).toEqual(['f5']);
  expect(result.current.notationString).toBe('f5');
  ```
- **削除判定**: [ ] 不要
- **備考**: 座標(row:4, col:5)は、チェス記法で'f5'（列f=5、行5=4）に変換される

---

#### Test 13: should record multiple consecutive moves in correct order

- **元のテストタイトル**: should record multiple consecutive moves in correct order
- **日本語タイトル**: 複数の連続した着手が正しい順序で記録されること
- **テスト内容**: updateBoard()を3回連続で呼び出すと、moveHistoryに['f5', 'f6', 'e6']、notationStringに'f5f6e6'が記録されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should record multiple consecutive moves in correct order', () => {
    const { result } = renderHook(() => useGameState());

    const newBoard = result.current.board;

    // First move: black at f5
    act(() => {
      result.current.updateBoard(newBoard, { row: 4, col: 5 });
    });

    expect(result.current.moveHistory).toEqual(['f5']);

    // Second move: white at f6
    act(() => {
      result.current.updateBoard(newBoard, { row: 5, col: 5 });
    });

    expect(result.current.moveHistory).toEqual(['f5', 'f6']);

    // Third move: black at e6
    act(() => {
      result.current.updateBoard(newBoard, { row: 5, col: 4 });
    });

    expect(result.current.moveHistory).toEqual(['f5', 'f6', 'e6']);
    expect(result.current.notationString).toBe('f5f6e6');
  });
  ```

- **期待値**:

  ```typescript
  // After first move
  expect(result.current.moveHistory).toEqual(['f5']);

  // After second move
  expect(result.current.moveHistory).toEqual(['f5', 'f6']);

  // After third move
  expect(result.current.moveHistory).toEqual(['f5', 'f6', 'e6']);
  expect(result.current.notationString).toBe('f5f6e6');
  ```

- **削除判定**: [ ] 不要

---

#### Test 14: should not record move when updateBoard is called without lastMove (pass)

- **元のテストタイトル**: should not record move when updateBoard is called without lastMove (pass)
- **日本語タイトル**: lastMoveなしでupdateBoardが呼ばれた際（パス）、着手が記録されないこと
- **テスト内容**: updateBoard()をlastMoveなしで呼び出すと（パス）、moveHistoryとnotationStringが変更されないことを確認
- **テストコード抜粋**:

  ```typescript
  it('should not record move when updateBoard is called without lastMove (pass)', () => {
    const { result } = renderHook(() => useGameState());

    const newBoard = result.current.board;

    // First move with position
    act(() => {
      result.current.updateBoard(newBoard, { row: 4, col: 5 });
    });

    expect(result.current.moveHistory).toEqual(['f5']);

    // Pass (updateBoard without lastMove)
    act(() => {
      result.current.updateBoard(newBoard);
    });

    // History should not change
    expect(result.current.moveHistory).toEqual(['f5']);
    expect(result.current.notationString).toBe('f5');
  });
  ```

- **期待値**:

  ```typescript
  // After first move
  expect(result.current.moveHistory).toEqual(['f5']);

  // After pass (no lastMove) - history unchanged
  expect(result.current.moveHistory).toEqual(['f5']);
  expect(result.current.notationString).toBe('f5');
  ```

- **削除判定**: [ ] 不要
- **備考**: パス（有効な着手がない場合）は着手履歴に記録されない

---

#### Test 15: should reset moveHistory and notationString when resetGame is called

- **元のテストタイトル**: should reset moveHistory and notationString when resetGame is called
- **日本語タイトル**: resetGame呼び出し時にmoveHistoryとnotationStringがリセットされること
- **テスト内容**: 3手着手した後にresetGame()を呼び出すと、moveHistoryが[]、notationStringが''に戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should reset moveHistory and notationString when resetGame is called', () => {
    const { result } = renderHook(() => useGameState());

    const newBoard = result.current.board;

    // Add some moves
    act(() => {
      result.current.updateBoard(newBoard, { row: 4, col: 5 });
      result.current.updateBoard(newBoard, { row: 5, col: 5 });
      result.current.updateBoard(newBoard, { row: 5, col: 4 });
    });

    expect(result.current.moveHistory).toEqual(['f5', 'f6', 'e6']);
    expect(result.current.notationString).toBe('f5f6e6');

    // Reset game
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.moveHistory).toEqual([]);
    expect(result.current.notationString).toBe('');
  });
  ```

- **期待値**:

  ```typescript
  // After 3 moves
  expect(result.current.moveHistory).toEqual(['f5', 'f6', 'e6']);
  expect(result.current.notationString).toBe('f5f6e6');

  // After reset
  expect(result.current.moveHistory).toEqual([]);
  expect(result.current.notationString).toBe('');
  ```

- **削除判定**: [ ] 不要

---

#### Test 16: should update notationString reactively when moveHistory changes

- **元のテストタイトル**: should update notationString reactively when moveHistory changes
- **日本語タイトル**: moveHistory変更時にnotationStringがリアクティブに更新されること
- **テスト内容**: moveHistoryが変更されるたびに、notationStringが自動的に更新されることを確認（空→'f5'→'f5f6'→空）
- **テストコード抜粋**:

  ```typescript
  it('should update notationString reactively when moveHistory changes', () => {
    const { result } = renderHook(() => useGameState());

    const newBoard = result.current.board;

    // Initially empty
    expect(result.current.notationString).toBe('');

    // Add first move
    act(() => {
      result.current.updateBoard(newBoard, { row: 4, col: 5 });
    });

    expect(result.current.notationString).toBe('f5');

    // Add second move
    act(() => {
      result.current.updateBoard(newBoard, { row: 5, col: 5 });
    });

    expect(result.current.notationString).toBe('f5f6');

    // Reset
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.notationString).toBe('');
  });
  ```

- **期待値**:

  ```typescript
  // Initially
  expect(result.current.notationString).toBe('');

  // After first move
  expect(result.current.notationString).toBe('f5');

  // After second move
  expect(result.current.notationString).toBe('f5f6');

  // After reset
  expect(result.current.notationString).toBe('');
  ```

- **削除判定**: [ ] 不要
- **備考**: notationStringはmoveHistoryの派生状態（derived state）として、リアクティブに更新される

---

### useGameState-pass.test.ts - Pass counter state management (Task 6.1)（5件）

#### Test 17: should increment consecutivePassCount by 1

- **元のテストタイトル**: should increment consecutivePassCount by 1
- **日本語タイトル**: consecutivePassCountが1ずつ増加すること
- **テスト内容**: incrementPassCount()を呼び出すと、consecutivePassCountが0から1に増加することを確認
- **テストコード抜粋**:

  ```typescript
  it('should increment consecutivePassCount by 1', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.consecutivePassCount).toBe(0);

    act(() => {
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(1);
  });
  ```

- **期待値**:

  ```typescript
  // Initial
  expect(result.current.consecutivePassCount).toBe(0);

  // After increment
  expect(result.current.consecutivePassCount).toBe(1);
  ```

- **削除判定**: [ ] 不要

---

#### Test 18: should reset consecutivePassCount to 0

- **元のテストタイトル**: should reset consecutivePassCount to 0
- **日本語タイトル**: consecutivePassCountが0にリセットされること
- **テスト内容**: consecutivePassCountを2まで増やした後、resetPassCount()を呼び出すと0に戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should reset consecutivePassCount to 0', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementPassCount();
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(2);

    act(() => {
      result.current.resetPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(0);
  });
  ```

- **期待値**:

  ```typescript
  // After 2 increments
  expect(result.current.consecutivePassCount).toBe(2);

  // After reset
  expect(result.current.consecutivePassCount).toBe(0);
  ```

- **削除判定**: [ ] 不要

---

#### Test 19: should reset consecutivePassCount on game reset

- **元のテストタイトル**: should reset consecutivePassCount on game reset
- **日本語タイトル**: ゲームリセット時にconsecutivePassCountが0にリセットされること
- **テスト内容**: consecutivePassCountを1まで増やした後、resetGame()を呼び出すと0に戻り、gameStatus.typeも'playing'に戻ることを確認
- **テストコード抜粋**:

  ```typescript
  it('should reset consecutivePassCount on game reset', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(1);

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.consecutivePassCount).toBe(0);
    expect(result.current.gameStatus.type).toBe('playing');
  });
  ```

- **期待値**:

  ```typescript
  // After increment
  expect(result.current.consecutivePassCount).toBe(1);

  // After reset game
  expect(result.current.consecutivePassCount).toBe(0);
  expect(result.current.gameStatus.type).toBe('playing');
  ```

- **削除判定**: [ ] 不要

---

#### Test 20: should maintain counter within 0-2 range

- **元のテストタイトル**: should maintain counter within 0-2 range
- **日本語タイトル**: カウンタが0-2の範囲内に維持されること
- **テスト内容**: incrementPassCount()を3回呼び出しても、consecutivePassCountが2以下、0以上に維持されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should maintain counter within 0-2 range', () => {
    const { result } = renderHook(() => useGameState());

    // Test multiple increments
    act(() => {
      result.current.incrementPassCount();
      result.current.incrementPassCount();
      result.current.incrementPassCount(); // Should cap at 2
    });

    expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);
    expect(result.current.consecutivePassCount).toBeGreaterThanOrEqual(0);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);
  expect(result.current.consecutivePassCount).toBeGreaterThanOrEqual(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: 連続パスが2回発生したらゲーム終了となるため、実装上2を超えないようになっている

---

#### Test 21: should not go below 0 after reset

- **元のテストタイトル**: should not go below 0 after reset
- **日本語タイトル**: リセット後にカウンタが0未満にならないこと
- **テスト内容**: resetPassCount()を複数回呼び出しても、consecutivePassCountが0に留まることを確認
- **テストコード抜粋**:

  ```typescript
  it('should not go below 0 after reset', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.resetPassCount();
      result.current.resetPassCount(); // Multiple resets
    });

    expect(result.current.consecutivePassCount).toBe(0);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(0);
  ```
- **削除判定**: [ ] 不要

---

### useGameState-pass.test.ts - Pass counter integration with game state (Task 6.1)（3件）

#### Test 22: should maintain pass count independently of player switches

- **元のテストタイトル**: should maintain pass count independently of player switches
- **日本語タイトル**: プレイヤー切り替えと独立してパスカウントが維持されること
- **テスト内容**: incrementPassCount()とswitchPlayer()を呼び出しても、consecutivePassCountが1のまま維持され、currentPlayerが'white'に切り替わることを確認
- **テストコード抜粋**:

  ```typescript
  it('should maintain pass count independently of player switches', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementPassCount();
      result.current.switchPlayer();
    });

    expect(result.current.consecutivePassCount).toBe(1);
    expect(result.current.currentPlayer).toBe('white');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(1);
  expect(result.current.currentPlayer).toBe('white');
  ```
- **削除判定**: [ ] 不要
- **備考**: パスカウンタはプレイヤー状態と独立して管理される

---

#### Test 23: should maintain pass count when game status changes

- **元のテストタイトル**: should maintain pass count when game status changes
- **日本語タイトル**: ゲームステータス変更時もパスカウントが維持されること
- **テスト内容**: incrementPassCount()とupdateGameStatus()を呼び出しても、consecutivePassCountが1のまま維持され、gameStatus.typeが'finished'に変わることを確認
- **テストコード抜粋**:

  ```typescript
  it('should maintain pass count when game status changes', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementPassCount();
      result.current.updateGameStatus({ type: 'finished', winner: 'draw' });
    });

    expect(result.current.consecutivePassCount).toBe(1);
    expect(result.current.gameStatus.type).toBe('finished');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(1);
  expect(result.current.gameStatus.type).toBe('finished');
  ```
- **削除判定**: [ ] 不要
- **備考**: パスカウンタはゲームステータスと独立して管理される（resetGame()以外では影響を受けない）

---

#### Test 24: should reset all game state including pass count on resetGame

- **元のテストタイトル**: should reset all game state including pass count on resetGame
- **日本語タイトル**: resetGame呼び出し時に全ゲーム状態（パスカウント含む）がリセットされること
- **テスト内容**: 全ての状態を変更した後にresetGame()を呼び出すと、全ての状態が初期値に戻ることを確認（consecutivePassCount=0, currentPlayer='black', isAIThinking=false, gameStatus.type='playing'）
- **テストコード抜粋**:

  ```typescript
  it('should reset all game state including pass count on resetGame', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementPassCount();
      result.current.switchPlayer();
      result.current.setAIThinking(true);
      result.current.updateGameStatus({ type: 'finished', winner: 'black' });
    });

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.consecutivePassCount).toBe(0);
    expect(result.current.currentPlayer).toBe('black');
    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.gameStatus.type).toBe('playing');
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(0);
  expect(result.current.currentPlayer).toBe('black');
  expect(result.current.isAIThinking).toBe(false);
  expect(result.current.gameStatus.type).toBe('playing');
  ```
- **削除判定**: [ ] 不要
- **備考**: resetGame()は全ての状態を初期値に戻す包括的なリセット機能

---

### useGameState-pass.test.ts - Pass counter behavior under edge cases (Task 6.1)（3件）

#### Test 25: should handle rapid increment calls

- **元のテストタイトル**: should handle rapid increment calls
- **日本語タイトル**: 連続したincrement呼び出しを適切に処理し、最大値2を超えないこと
- **テスト内容**: incrementPassCount()を5回連続で呼び出しても、consecutivePassCountが2以下に維持されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should handle rapid increment calls', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.incrementPassCount();
      }
    });

    expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);
  ```
- **削除判定**: [ ] 不要
- **備考**: 連続して5回呼び出しても、上限2を超えないことを確認

---

#### Test 26: should handle rapid reset calls

- **元のテストタイトル**: should handle rapid reset calls
- **日本語タイトル**: 連続したreset呼び出しを適切に処理すること
- **テスト内容**: incrementPassCount()を1回呼び出した後、resetPassCount()を3回連続で呼び出しても、consecutivePassCountが0に維持されることを確認
- **テストコード抜粋**:

  ```typescript
  it('should handle rapid reset calls', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementPassCount();
    });

    act(() => {
      result.current.resetPassCount();
      result.current.resetPassCount();
      result.current.resetPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(0);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(0);
  ```
- **削除判定**: [ ] 不要
- **備考**: 連続して3回resetを呼び出しても、0に留まることを確認

---

#### Test 27: should handle increment-reset cycle

- **元のテストタイトル**: should handle increment-reset cycle
- **日本語タイトル**: increment-resetサイクルを適切に処理すること
- **テスト内容**: incrementPassCount()→resetPassCount()→incrementPassCount()のサイクルを実行すると、consecutivePassCountが最終的に1になることを確認
- **テストコード抜粋**:

  ```typescript
  it('should handle increment-reset cycle', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.incrementPassCount();
      result.current.resetPassCount();
      result.current.incrementPassCount();
    });

    expect(result.current.consecutivePassCount).toBe(1);
  });
  ```

- **期待値**:
  ```typescript
  expect(result.current.consecutivePassCount).toBe(1);
  ```
- **削除判定**: [ ] 不要
- **備考**: increment→reset→incrementのサイクルで、最終的に1になることを確認

---

## サマリー

### 保持推奨テスト: 27件（全て）

このファイルは**useGameStateフック**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 基本ゲーム状態管理（5件）: 初期化、プレイヤー切り替え、ステータス更新、リセット
- 連続パスカウント管理（10件）: 初期化、増加、リセット、範囲検証、ゲームリセット連携
- 着手履歴管理（6件）: 初期化、追加、複数記録、パス時の非記録、リセット、リアクティブ更新
- パスカウンタ統合（3件）: プレイヤー切り替え、ステータス変更、全体リセット
- パスカウンタエッジケース（3件）: 連続increment、連続reset、increment-resetサイクル

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

useGameStateのテストは以下の理由で重要です：

- ゲーム状態の中核的な管理
- パスカウンタの正確な動作（リバーシゲームのルール上重要）
- 着手履歴の正確な記録（棋譜の生成に必要）
- 状態リセットの完全性
- エッジケースの適切な処理（連続increment、連続resetなど）
- 状態間の独立性検証（パスカウンタとプレイヤー状態など）

変更不要です。

**備考**:

- Task 1.1: Consecutive pass count management（連続パスカウント管理）
- Task 3.1: Move history management（着手履歴管理）
- Task 6.1: useGameState extension tests（useGameState拡張テスト）
- 2つのテストファイルを統合したドキュメント（useGameState.test.ts: 16テスト、useGameState-pass.test.ts: 11テスト）
- 連続パスが2回発生したらゲーム終了（リバーシのルール）
- notationStringはmoveHistoryの派生状態として、リアクティブに更新される
- パスカウンタは他の状態と独立して管理され、resetGame()でのみリセットされる
