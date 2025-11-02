# cell-id.test.ts

## ファイル情報

- **テストファイル**: `src/lib/game/__tests__/cell-id.test.ts`
- **テスト対象コード**: `src/lib/game/cell-id.ts`
- **テスト数**: 8
- **削除推奨テスト数**: 4（50%）

## テストケース一覧

### Test 1: should generate "a1" for top-left corner (rowIndex=0, colIndex=0)

- **元のテストタイトル**: should generate "a1" for top-left corner (rowIndex=0, colIndex=0)
- **日本語タイトル**: 左上隅（rowIndex=0, colIndex=0）に対して"a1"を生成すること
- **テスト内容**: 左上隅の座標が正しくチェス記法の"a1"に変換されることを確認
- **テストコード抜粋**:
  ```typescript
  const cellId = generateCellId(0, 0);
  expect(cellId).toBe('a1');
  ```
- **期待値**: `expect(cellId).toBe('a1')`
- **削除判定**: [ ] 不要
- **備考**: 境界値テストとして重要

---

### Test 2: should generate "h8" for bottom-right corner (rowIndex=7, colIndex=7)

- **元のテストタイトル**: should generate "h8" for bottom-right corner (rowIndex=7, colIndex=7)
- **日本語タイトル**: 右下隅（rowIndex=7, colIndex=7）に対して"h8"を生成すること
- **テスト内容**: 右下隅の座標が正しくチェス記法の"h8"に変換されることを確認
- **テストコード抜粋**:
  ```typescript
  const cellId = generateCellId(7, 7);
  expect(cellId).toBe('h8');
  ```
- **期待値**: `expect(cellId).toBe('h8')`
- **削除判定**: [ ] 不要
- **備考**: 境界値テストとして重要

---

### Test 3: should convert colIndex (0-7) to column letters (a-h)

- **元のテストタイトル**: should convert colIndex (0-7) to column letters (a-h)
- **日本語タイトル**: colIndex（0-7）を列文字（a-h）に変換すること
- **テスト内容**: 列インデックスが正しくアルファベットに変換されることを確認
- **テストコード抜粋**:
  ```typescript
  expect(generateCellId(0, 0)).toBe('a1');
  expect(generateCellId(0, 1)).toBe('b1');
  expect(generateCellId(0, 7)).toBe('h1');
  ```
- **期待値**: `expect(generateCellId(0, 0)).toBe('a1')`
- **削除判定**: [x] 不要
- **削除理由**: 境界値テスト（Test 1, 2）と内容が重複。同じ変換ロジックを複数の観点から過剰にテストしている。重複テスト。

---

### Test 4: should convert rowIndex (0-7) to row numbers (1-8)

- **元のテストタイトル**: should convert rowIndex (0-7) to row numbers (1-8)
- **日本語タイトル**: rowIndex（0-7）を行番号（1-8）に変換すること
- **テスト内容**: 行インデックスが正しく数字に変換されることを確認
- **テストコード抜粋**:
  ```typescript
  expect(generateCellId(0, 0)).toBe('a1');
  expect(generateCellId(1, 0)).toBe('a2');
  expect(generateCellId(7, 0)).toBe('a8');
  ```
- **期待値**: `expect(generateCellId(0, 0)).toBe('a1')`
- **削除判定**: [x] 不要
- **削除理由**: 境界値テスト（Test 1, 2）と内容が重複。同じ変換ロジックを複数の観点から過剰にテストしている。重複テスト。

---

### Test 5: should generate unique IDs for all 64 cells

- **元のテストタイトル**: should generate unique IDs for all 64 cells
- **日本語タイトル**: 全64マスに対して一意のIDを生成すること
- **テスト内容**: 全マスのIDが重複せず一意であることを確認
- **テストコード抜粋**:
  ```typescript
  const ids = new Set<string>();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      ids.add(generateCellId(row, col));
    }
  }
  expect(ids.size).toBe(64);
  ```
- **期待値**: `expect(ids.size).toBe(64)`
- **削除判定**: [ ] 不要
- **備考**: 一意性の検証として重要

---

### Test 6: should match regex pattern /^[a-h][1-8]$/ for all generated IDs

- **元のテストタイトル**: should match regex pattern /^[a-h][1-8]$/ for all generated IDs
- **日本語タイトル**: 生成された全IDが正規表現 /^[a-h][1-8]$/ にマッチすること
- **テスト内容**: 全マスのIDが正しいフォーマットであることを確認
- **テストコード抜粋**:
  ```typescript
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cellId = generateCellId(row, col);
      expect(cellId).toMatch(/^[a-h][1-8]$/);
    }
  }
  ```
- **期待値**: `expect(cellId).toMatch(/^[a-h][1-8]$/)`
- **削除判定**: [x] 不要
- **削除理由**: Test 5（一意性テスト）と組み合わせれば十分。個別に正規表現テストを行う必要性は低い。一意性が保証されていれば、フォーマットも自動的に正しい。

---

### Test 7: should generate IDs matching expected chess notation for all cells

- **元のテストタイトル**: should generate IDs matching expected chess notation for all cells
- **日本語タイトル**: 全マスに対して期待されるチェス記法のIDを生成すること
- **テスト内容**: 全64マスのIDが期待される値と一致することを確認
- **テストコード抜粋**:
  ```typescript
  const expectedIds = [
    ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
    ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
    // ... 全8行
  ];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cellId = generateCellId(row, col);
      const expectedId = expectedIds[row][col];
      expect(cellId).toBe(expectedId);
    }
  }
  ```
- **期待値**: `expect(cellId).toBe(expectedId)`
- **削除判定**: [x] 不要
- **削除理由**: Test 5（一意性テスト）およびTest 1,2（境界値テスト）で実質的にカバーされている。全64マスを個別に検証するのは過剰。境界値が正しく、一意性が保証されていれば、中間の値も正しいと推測できる。

---

### Test 8: should handle edge cases for board boundaries

- **元のテストタイトル**: should handle edge cases for board boundaries
- **日本語タイトル**: 盤面の境界のエッジケースを処理すること
- **テスト内容**: 4隅の座標が正しく処理されることを確認
- **テストコード抜粋**:
  ```typescript
  expect(generateCellId(0, 0)).toBe('a1'); // top-left
  expect(generateCellId(0, 7)).toBe('h1'); // top-right
  expect(generateCellId(7, 0)).toBe('a8'); // bottom-left
  expect(generateCellId(7, 7)).toBe('h8'); // bottom-right
  ```
- **期待値**: `expect(generateCellId(0, 0)).toBe('a1')`
- **削除判定**: [ ] 不要
- **備考**: 境界値テストとして重要（ただしTest 1, 2と一部重複）

---

## サマリー

### 保持推奨テスト: 4件

- Test 1: 左上隅の境界値テスト
- Test 2: 右下隅の境界値テスト
- Test 5: 一意性テスト
- Test 8: 4隅の境界値テスト（Test 1, 2と一部重複だが、包括的なので保持）

### 削除推奨テスト: 4件

**重複テスト（4件）:**

- Test 3: 列変換テスト（境界値テストでカバー済み）
- Test 4: 行変換テスト（境界値テストでカバー済み）
- Test 6: 正規表現テスト（一意性テストで十分）
- Test 7: 全64マスの個別検証（境界値+一意性で十分）

### 推奨事項

このファイルは**50%のテストが不要**です。削除推奨テストは全て境界値テストと一意性テストで間接的にカバーされている内容であり、削除しても品質に影響しません。

リファクタリング後は、**4つの本質的なテスト**のみが残り、保守性が向上します：

1. 左上隅の境界値
2. 右下隅の境界値
3. 一意性（全64マス）
4. 4隅の境界値（包括的）

または、さらに最適化して**2つのテスト**に集約することも可能です：

1. 境界値テスト（4隅）
2. 一意性テスト（全64マス）
