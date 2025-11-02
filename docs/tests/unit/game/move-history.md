# move-history.test.ts

## ファイル情報

- **テストファイル**: `src/lib/game/__tests__/move-history.test.ts`
- **テスト対象コード**: `src/lib/game/move-history.ts`
- **テスト数**: 23
- **削除推奨テスト数**: 20+

⚠️ **このファイルは削除推奨テストが最も多い**（約87%が不要）

## テストケース一覧

### positionToNotation 関数のテスト

#### Test 1: should convert (0,0) to "a1"

- **元のテストタイトル**: should convert (0,0) to "a1"
- **日本語タイトル**: (0,0) を "a1" に変換すること
- **テスト内容**: 位置座標{row: 0, col: 0}が正しく"a1"に変換されることを確認
- **テストコード抜粋**:
  ```typescript
  const position = { row: 0, col: 0 };
  expect(positionToNotation(position)).toBe('a1');
  ```
- **期待値**: `expect(positionToNotation(position)).toBe('a1')`
- **削除判定**: [ ] 不要
- **備考**: 境界値テストとして重要

---

#### Test 2: should convert all 64 positions correctly

- **元のテストタイトル**: should convert all 64 positions correctly
- **日本語タイトル**: 全64位置を正しく変換すること
- **テスト内容**: 8x8盤面の全位置が正しくチェス記法に変換されることを確認
- **テストコード抜粋**:
  ```typescript
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const position = { row, col };
      const expected = expectedNotations[row][col];
      expect(positionToNotation(position)).toBe(expected);
    }
  }
  ```
- **期待値**: `expect(positionToNotation(position)).toBe(expected)`
- **削除判定**: [x] 不要
- **削除理由**: `cell-id.test.ts`の同様のテストと重複。異なるモジュールで同じロジックを二重にテストしている。重複テスト。

---

#### Test 3: should return the same output for the same input

- **元のテストタイトル**: should return the same output for the same input
- **日本語タイトル**: 同じ入力に対して同じ出力を返すこと
- **テスト内容**: 関数が純粋関数であることを確認（冪等性テスト）
- **テストコード抜粋**:
  ```typescript
  const position = { row: 2, col: 3 };
  const result1 = positionToNotation(position);
  const result2 = positionToNotation(position);
  expect(result1).toBe(result2);
  ```
- **期待値**: `expect(result1).toBe(result2)`
- **削除判定**: [x] 不要
- **削除理由**: JavaScriptの関数が純粋であることを疑ってテストしている。これは基本的な言語仕様であり、わざわざテストする必要はない。標準ライブラリ/言語機能への過剰な疑い。

---

#### Test 4: should not modify the input position object

- **元のテストタイトル**: should not modify the input position object
- **日本語タイトル**: 入力の位置オブジェクトを変更しないこと
- **テスト内容**: 関数が入力を変更しないことを確認（副作用なし）
- **テストコード抜粋**:
  ```typescript
  const position = { row: 2, col: 3 };
  const originalRow = position.row;
  const originalCol = position.col;
  positionToNotation(position);
  expect(position.row).toBe(originalRow);
  expect(position.col).toBe(originalCol);
  ```
- **期待値**: `expect(position.row).toBe(originalRow)`
- **削除判定**: [x] 不要
- **削除理由**: オブジェクトが変更されないことを疑ってテストしている。実装を見れば明らかに副作用がないシンプルな変換関数であり、不要。標準ライブラリ/言語機能への過剰な疑い。

---

#### Test 5: should return "??" for negative row

- **元のテストタイトル**: should return "??" for negative row
- **日本語タイトル**: 負の行に対して "??" を返すこと
- **テスト内容**: 範囲外の入力（負の行インデックス）に対してエラー値を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const position = { row: -1, col: 0 };
  expect(positionToNotation(position)).toBe('??');
  ```
- **期待値**: `expect(positionToNotation(position)).toBe('??')`
- **削除判定**: [x] 不要
- **削除理由**: リバーシのゲームルール上、負の行インデックスは発生し得ない。起こり得ないエッジケースをテストしている。

---

#### Test 6: should return "??" for negative col

- **元のテストタイトル**: should return "??" for negative col
- **日本語タイトル**: 負の列に対して "??" を返すこと
- **テスト内容**: 範囲外の入力（負の列インデックス）に対してエラー値を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const position = { row: 0, col: -1 };
  expect(positionToNotation(position)).toBe('??');
  ```
- **期待値**: `expect(positionToNotation(position)).toBe('??')`
- **削除判定**: [x] 不要
- **削除理由**: リバーシのゲームルール上、負の列インデックスは発生し得ない。起こり得ないエッジケースをテストしている。

---

#### Test 7: should return "??" for row >= 8

- **元のテストタイトル**: should return "??" for row >= 8
- **日本語タイトル**: 行>=8 に対して "??" を返すこと
- **テスト内容**: 範囲外の入力（行>=8）に対してエラー値を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const position = { row: 8, col: 0 };
  expect(positionToNotation(position)).toBe('??');
  ```
- **期待値**: `expect(positionToNotation(position)).toBe('??')`
- **削除判定**: [x] 不要
- **削除理由**: 8x8盤面を超える座標は発生し得ない。起こり得ないエッジケースをテストしている。

---

#### Test 8: should return "??" for col >= 8

- **元のテストタイトル**: should return "??" for col >= 8
- **日本語タイトル**: 列>=8 に対して "??" を返すこと
- **テスト内容**: 範囲外の入力（列>=8）に対してエラー値を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const position = { row: 0, col: 8 };
  expect(positionToNotation(position)).toBe('??');
  ```
- **期待値**: `expect(positionToNotation(position)).toBe('??')`
- **削除判定**: [x] 不要
- **削除理由**: 8x8盤面を超える座標は発生し得ない。起こり得ないエッジケースをテストしている。

---

#### Test 9: should return "??" for both row and col out of range

- **元のテストタイトル**: should return "??" for both row and col out of range
- **日本語タイトル**: 行と列の両方が範囲外の場合に "??" を返すこと
- **テスト内容**: 範囲外の入力（両方）に対してエラー値を返すことを確認
- **テストコード抜粋**:
  ```typescript
  expect(positionToNotation({ row: -1, col: -1 })).toBe('??');
  expect(positionToNotation({ row: 9, col: 9 })).toBe('??');
  ```
- **期待値**: `expect(positionToNotation({ row: -1, col: -1 })).toBe('??')`
- **削除判定**: [x] 不要
- **削除理由**: 起こり得ないエッジケース。

---

#### Test 10: should return "??" for row = 100

- **元のテストタイトル**: should return "??" for row = 100
- **日本語タイトル**: 行=100 に対して "??" を返すこと
- **テスト内容**: 極端に大きい行インデックスに対してエラー値を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const position = { row: 100, col: 0 };
  expect(positionToNotation(position)).toBe('??');
  ```
- **期待値**: `expect(positionToNotation(position)).toBe('??')`
- **削除判定**: [x] 不要
- **削除理由**: 起こり得ない極端なエッジケース。

---

#### Test 11: should return "??" for col = 100

- **元のテストタイトル**: should return "??" for col = 100
- **日本語タイトル**: 列=100 に対して "??" を返すこと
- **テスト内容**: 極端に大きい列インデックスに対してエラー値を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const position = { row: 0, col: 100 };
  expect(positionToNotation(position)).toBe('??');
  ```
- **期待値**: `expect(positionToNotation(position)).toBe('??')`
- **削除判定**: [x] 不要
- **削除理由**: 起こり得ない極端なエッジケース。

---

#### Test 12: should output console.warn in development

- **元のテストタイトル**: should output console.warn in development
- **日本語タイトル**: 開発環境でconsole.warnを出力すること
- **テスト内容**: 範囲外入力時に開発環境でconsole.warnが呼ばれることを確認
- **テストコード抜粋**:
  ```typescript
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  positionToNotation({ row: -1, col: 0 });
  expect(consoleWarnSpy).toHaveBeenCalled();
  ```
- **期待値**: `expect(consoleWarnSpy).toHaveBeenCalled()`
- **削除判定**: [x] 不要
- **削除理由**: console.warnの挙動をテストしているが、これはNode.js/ブラウザのランタイム機能。また起こり得ないエラーケースのロギングをテストする意味がない。

---

#### Test 13: should not output console.warn in production

- **元のテストタイトル**: should not output console.warn in production
- **日本語タイトル**: 本番環境ではconsole.warnを出力しないこと
- **テスト内容**: 本番環境でconsole.warnが呼ばれないことを確認
- **テストコード抜粋**:
  ```typescript
  process.env.NODE_ENV = 'production';
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  positionToNotation({ row: -1, col: 0 });
  expect(consoleWarnSpy).not.toHaveBeenCalled();
  ```
- **期待値**: `expect(consoleWarnSpy).not.toHaveBeenCalled()`
- **削除判定**: [x] 不要
- **削除理由**: 同上。console.warnの環境依存挙動をテストしている。

---

### generateNotationString 関数のテスト

#### Test 14: should return empty string for empty array

- **元のテストタイトル**: should return empty string for empty array
- **日本語タイトル**: 空配列に対して空文字列を返すこと
- **テスト内容**: 空の履歴に対して正しく空文字列を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const history: Position[] = [];
  expect(generateNotationString(history)).toBe('');
  ```
- **期待値**: `expect(generateNotationString(history)).toBe('')`
- **削除判定**: [ ] 不要
- **備考**: エッジケースとして重要

---

#### Test 15: should concatenate multiple moves without separator

- **元のテストタイトル**: should concatenate multiple moves without separator
- **日本語タイトル**: 複数の手をセパレータなしで連結すること
- **テスト内容**: 複数の手が正しく連結されることを確認
- **テストコード抜粋**:
  ```typescript
  const history = [
    { row: 4, col: 5 }, // e6
    { row: 5, col: 5 }, // f6
    { row: 4, col: 4 }, // f5
  ];
  expect(generateNotationString(history)).toBe('e6f6f5');
  ```
- **期待値**: `expect(generateNotationString(history)).toBe('e6f6f5')`
- **削除判定**: [ ] 不要
- **備考**: 基本的な動作確認として重要

---

#### Test 16: should handle long history (60+ moves) correctly

- **元のテストタイトル**: should handle long history (60+ moves) correctly
- **日本語タイトル**: 長い履歴（60手以上）を正しく処理すること
- **テスト内容**: 長い手順でも正しく動作することを確認
- **テストコード抜粋**:
  ```typescript
  const history = Array.from({ length: 64 }, (_, i) => ({
    row: Math.floor(i / 8),
    col: i % 8,
  }));
  const result = generateNotationString(history);
  expect(result).toHaveLength(128); // 64 moves * 2 chars
  expect(result.startsWith('a1a2a3'));
  ```
- **期待値**: `expect(result).toHaveLength(128)`
- **削除判定**: [ ] 不要
- **備考**: パフォーマンス・境界値テストとして重要

---

#### Test 17: should return the same output for the same input

- **元のテストタイトル**: should return the same output for the same input
- **日本語タイトル**: 同じ入力に対して同じ出力を返すこと
- **テスト内容**: 関数の純粋性を確認（冪等性）
- **テストコード抜粋**:
  ```typescript
  const history = [{ row: 2, col: 3 }];
  const result1 = generateNotationString(history);
  const result2 = generateNotationString(history);
  expect(result1).toBe(result2);
  ```
- **期待値**: `expect(result1).toBe(result2)`
- **削除判定**: [x] 不要
- **削除理由**: JavaScriptのArray.joinなどの標準機能の挙動を疑ってテストしている。シンプルな文字列連結関数の純粋性を繰り返しテストする必要はない。

---

#### Test 18: should have no side effects on global state

- **元のテストタイトル**: should have no side effects on global state
- **日本語タイトル**: グローバル状態に副作用がないこと
- **テスト内容**: グローバル状態に副作用がないことを確認
- **テストコード抜粋**:
  ```typescript
  const history = [{ row: 2, col: 3 }];
  generateNotationString(history);
  expect(typeof String.prototype.concat).toBe('function');
  ```
- **期待値**: `expect(typeof String.prototype.concat).toBe('function')`
- **削除判定**: [x] 不要
- **削除理由**: 標準ライブラリの挙動を疑っている。String.prototype.concatの存在をテストする意味がない。

---

#### Test 19: should not modify input history array

- **元のテストタイトル**: should not modify input history array
- **日本語タイトル**: 入力配列を変更しないこと
- **テスト内容**: 入力配列が変更されないことを確認
- **テストコード抜粋**:
  ```typescript
  const history = [{ row: 2, col: 3 }];
  const copyBefore = [...history];
  generateNotationString(history);
  expect(history).toEqual(copyBefore);
  ```
- **期待値**: `expect(history).toEqual(copyBefore)`
- **削除判定**: [x] 不要
- **削除理由**: Array操作の副作用を疑っている。シンプルな関数に対して過剰。

---

#### Test 20: should accept readonly array

- **元のテストタイトル**: should accept readonly array
- **日本語タイトル**: readonly配列を受け入れること
- **テスト内容**: readonly配列を受け入れることを確認
- **テストコード抜粋**:
  ```typescript
  const readonlyHistory: readonly Position[] = [{ row: 2, col: 3 }];
  expect(() => generateNotationString(readonlyHistory)).not.toThrow();
  ```
- **期待値**: `expect(() => generateNotationString(readonlyHistory)).not.toThrow()`
- **削除判定**: [x] 不要
- **削除理由**: 型安全性はTypeScriptコンパイラが保証する。ランタイムテストは不要。

---

#### Test 21: should return string type

- **元のテストタイトル**: should return string type
- **日本語タイトル**: 文字列型を返すこと
- **テスト内容**: 文字列型を返すことを確認
- **テストコード抜粋**:
  ```typescript
  const history = [{ row: 2, col: 3 }];
  const result = generateNotationString(history);
  expect(typeof result).toBe('string');
  ```
- **期待値**: `expect(typeof result).toBe('string')`
- **削除判定**: [x] 不要
- **削除理由**: 型安全性はTypeScriptコンパイラが保証する。ランタイムテストは不要。

---

#### Test 22: should generate 60-move notation string in less than 1ms

- **元のテストタイトル**: should generate 60-move notation string in less than 1ms
- **日本語タイトル**: 60手の記法文字列を1ms未満で生成すること
- **テスト内容**: パフォーマンステスト
- **テストコード抜粋**:
  ```typescript
  const history = Array.from({ length: 60 }, (_, i) => ({
    row: Math.floor(i / 8),
    col: i % 8,
  }));
  const startTime = performance.now();
  generateNotationString(history);
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(1);
  ```
- **期待値**: `expect(duration).toBeLessThan(1)`
- **削除判定**: [ ] 不要
- **備考**: パフォーマンステストとして有用（ただし1つあれば十分）

---

#### Test 23: should handle multiple consecutive calls efficiently

- **元のテストタイトル**: should handle multiple consecutive calls efficiently
- **日本語タイトル**: 複数の連続呼び出しを効率的に処理すること
- **テスト内容**: 複数呼び出しのパフォーマンステスト
- **テストコード抜粋**:
  ```typescript
  const history = Array.from({ length: 30 }, (_, i) => ({
    row: Math.floor(i / 8),
    col: i % 8,
  }));
  for (let i = 0; i < 1000; i++) {
    generateNotationString(history);
  }
  expect(averageDuration).toBeLessThan(1);
  ```
- **期待値**: `expect(averageDuration).toBeLessThan(1)`
- **削除判定**: [x] 不要
- **削除理由**: 単純な文字列連結関数に対して過剰なパフォーマンステスト。Test 22で基本的なパフォーマンスは確認済み。

---

## サマリー

### 保持推奨テスト: 3件

- Test 1: 基本的な変換テスト（境界値）
- Test 14: 空配列のエッジケース
- Test 15: 基本的な連結動作
- Test 16: 長い履歴の処理
- Test 22: パフォーマンステスト（1つで十分）

### 削除推奨テスト: 20件

**起こり得ないエッジケース（8件）:**

- Test 5-11: 範囲外の座標値テスト

**標準ライブラリへの過剰な疑い（9件）:**

- Test 3, 4: 純粋関数の冪等性・副作用なしテスト
- Test 12, 13: console.warn の挙動テスト
- Test 17-21: Array/String の標準機能への疑いテスト
- Test 23: 過剰なパフォーマンステスト

**重複テスト（1件）:**

- Test 2: cell-id.test.ts と重複

**型安全性テスト（2件）:**

- Test 20, 21: TypeScript コンパイラが保証する内容

### 推奨事項

このファイルは**87%のテストが不要**であり、大幅なリファクタリングが必要です：

1. **Phase 1**: 起こり得ないエッジケーステストを削除（Test 5-11）
2. **Phase 2**: 標準ライブラリへの疑いテストを削除（Test 3, 4, 12, 13, 17-19, 23）
3. **Phase 3**: 型安全性テストを削除（Test 20, 21）
4. **Phase 4**: 重複テストを削除（Test 2）

リファクタリング後は、**5つの本質的なテスト**のみが残り、保守性が大幅に向上します。
