# page.test.tsx

## ファイル情報

- **テストファイル**: `app/__tests__/page.test.tsx`
- **テスト対象コード**: `app/page.tsx`
- **テスト数**: 4
- **削除推奨テスト数**: 0

## テストケース一覧

### Page (Server Component)

#### Test 1: レンダリングされること

- **元のテストタイトル**: レンダリングされること
- **日本語タイトル**: レンダリングされること
- **テスト内容**: ページが正常にレンダリングされることを確認
- **テストコード抜粋**:
  ```typescript
  render(<Page />);
  expect(screen.getByTestId('game-board')).toBeInTheDocument();
  ```
- **期待値**:
  ```typescript
  expect(screen.getByTestId('game-board')).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 2: ページタイトルを表示すること

- **元のテストタイトル**: ページタイトルを表示すること
- **日本語タイトル**: ページタイトルを表示すること
- **テスト内容**: ヘッダーに「リバーシ」タイトルが表示されることを確認
- **テストコード抜粋**:
  ```typescript
  render(<Page />);
  const title = screen.getByRole('heading', { level: 1 });
  expect(title).toBeInTheDocument();
  expect(title).toHaveTextContent('リバーシ');
  ```
- **期待値**:
  ```typescript
  expect(title).toBeInTheDocument();
  expect(title).toHaveTextContent('リバーシ');
  ```
- **削除判定**: [ ] 不要

---

#### Test 3: GameBoardコンポーネントをマウントすること

- **元のテストタイトル**: GameBoardコンポーネントをマウントすること
- **日本語タイトル**: GameBoardコンポーネントをマウントすること
- **テスト内容**: GameBoardコンポーネントがマウントされ、モックの内容が表示されることを確認
- **テストコード抜粋**:
  ```typescript
  render(<Page />);
  const gameBoard = screen.getByTestId('game-board');
  expect(gameBoard).toBeInTheDocument();
  expect(gameBoard).toHaveTextContent('GameBoard Component');
  ```
- **期待値**:
  ```typescript
  expect(gameBoard).toBeInTheDocument();
  expect(gameBoard).toHaveTextContent('GameBoard Component');
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: 正しいHTMLセマンティクスを持つこと

- **元のテストタイトル**: 正しいHTMLセマンティクスを持つこと
- **日本語タイトル**: 正しいHTMLセマンティクスを持つこと
- **テスト内容**: main要素とheader要素が正しく存在することを確認
- **テストコード抜粋**:
  ```typescript
  const { container } = render(<Page />);
  const main = container.querySelector('main');
  expect(main).toBeInTheDocument();
  const header = container.querySelector('header');
  expect(header).toBeInTheDocument();
  ```
- **期待値**:
  ```typescript
  expect(main).toBeInTheDocument();
  expect(header).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 4件（全て）

このファイルは**Next.jsのPageコンポーネント（Server Component）**をテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- レンダリング検証（1件）: 基本的なレンダリング成功
- コンテンツ検証（1件）: タイトル表示
- コンポーネント統合（1件）: GameBoardのマウント
- セマンティックHTML（1件）: main, header要素の存在

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、良好な状態です。

Pageコンポーネントのテストは以下の理由で重要です：

- Server Componentの基本動作確認
- 主要コンポーネント（GameBoard）の統合確認
- セマンティックHTMLの保証
- アクセシビリティの基礎確認

変更不要です。
