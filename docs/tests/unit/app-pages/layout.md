# layout.test.tsx

## ファイル情報

- **テストファイル**: `app/__tests__/layout.test.tsx`
- **テスト対象コード**: `app/layout.tsx`
- **テスト数**: 6
- **削除推奨テスト数**: 1

## テストケース一覧

### RootLayout (Server Component)

#### Test 1: 正しいメタデータを持つこと

- **元のテストタイトル**: 正しいメタデータを持つこと
- **日本語タイトル**: 正しいメタデータを持つこと
- **テスト内容**: エクスポートされたmetadataが正しい値を持つことを確認
- **テストコード抜粋**:
  ```typescript
  expect(metadata).toEqual({
    title: 'LINE Reversi - リバーシゲーム',
    description: 'LINEミニアプリで遊べるリバーシゲーム。AIと対戦しよう!',
  });
  ```
- **期待値**:
  ```typescript
  expect(metadata).toEqual({
    title: 'LINE Reversi - リバーシゲーム',
    description: 'LINEミニアプリで遊べるリバーシゲーム。AIと対戦しよう!',
  });
  ```
- **削除判定**: [ ] 不要
- **備考**: SEO設定の検証として重要

---

#### Test 2: 正しいviewport設定を持つこと

- **元のテストタイトル**: 正しいviewport設定を持つこと
- **日本語タイトル**: 正しいviewport設定を持つこと
- **テスト内容**: エクスポートされたviewportが正しい値を持つことを確認
- **テストコード抜粋**:
  ```typescript
  expect(viewport).toEqual({
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#06C755',
  });
  ```
- **期待値**:
  ```typescript
  expect(viewport).toEqual({
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#06C755',
  });
  ```
- **削除判定**: [ ] 不要
- **備考**: モバイルUX設定の検証として重要

---

#### Test 3: childrenを正しくレンダリングすること

- **元のテストタイトル**: childrenを正しくレンダリングすること
- **日本語タイトル**: childrenを正しくレンダリングすること
- **テスト内容**: Layout内の子要素が正しくレンダリングされ、html/body要素が存在することを確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(
    <RootLayout>
      <div data-testid="child">Test Content</div>
    </RootLayout>
  );

  expect(container.querySelector('html')).toBeInTheDocument();
  expect(container.querySelector('body')).toBeInTheDocument();
  expect(
    container.querySelector('[data-testid="child"]')
  ).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(container.querySelector('html')).toBeInTheDocument();
  expect(container.querySelector('body')).toBeInTheDocument();
  expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument();
  ```
- **削除判定**: [ ] 不要

---

#### Test 4: lang属性が"ja"であること

- **元のテストタイトル**: lang属性が"ja"であること
- **日本語タイトル**: lang属性が"ja"であること
- **テスト内容**: html要素のlang属性が"ja"（日本語）に設定されていることを確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(
    <RootLayout>
      <div>Test</div>
    </RootLayout>
  );

  const html = container.querySelector('html');
  expect(html).toHaveAttribute('lang', 'ja');
  ```

- **期待値**:
  ```typescript
  expect(html).toHaveAttribute('lang', 'ja');
  ```
- **削除判定**: [ ] 不要
- **備考**: アクセシビリティとSEOのための重要な設定

---

#### Test 5: LiffProviderでラップされていること

- **元のテストタイトル**: LiffProviderでラップされていること
- **日本語タイトル**: LiffProviderでラップされていること
- **テスト内容**: 子要素がLiffProviderでラップされていることを確認
- **テストコード抜粋**:

  ```typescript
  const { container } = render(
    <RootLayout>
      <div data-testid="child">Test Content</div>
    </RootLayout>
  );

  const liffProvider = container.querySelector(
    '[data-testid="liff-provider"]'
  );
  expect(liffProvider).toBeInTheDocument();

  const child = container.querySelector('[data-testid="child"]');
  expect(liffProvider).toContainElement(child as HTMLElement);
  ```

- **期待値**:
  ```typescript
  expect(liffProvider).toBeInTheDocument();
  expect(liffProvider).toContainElement(child as HTMLElement);
  ```
- **削除判定**: [ ] 不要

---

#### Test 6: ErrorBoundaryとLiffProviderの正しい順序を保つこと

- **元のテストタイトル**: ErrorBoundaryとLiffProviderの正しい順序を保つこと
- **日本語タイトル**: ErrorBoundaryとLiffProviderの正しい順序を保つこと
- **テスト内容**: プロバイダチェーンの正しい順序を確認（実際にはTest 5と同じ内容）
- **テストコード抜粋**:

  ```typescript
  const { container } = render(
    <RootLayout>
      <div data-testid="child">Test Content</div>
    </RootLayout>
  );

  const liffProvider = container.querySelector(
    '[data-testid="liff-provider"]'
  );
  expect(liffProvider).toBeInTheDocument();

  const child = container.querySelector('[data-testid="child"]');
  expect(child).toBeInTheDocument();
  ```

- **期待値**:
  ```typescript
  expect(liffProvider).toBeInTheDocument();
  expect(child).toBeInTheDocument();
  ```
- **削除判定**: [x] 不要
- **削除理由**: テストタイトルは「ErrorBoundaryとLiffProviderの正しい順序」だが、実際にはErrorBoundaryの存在や順序を全くテストしていない。単にLiffProviderと子要素の存在を確認しているだけで、Test 5と完全に重複している。

---

## サマリー

### 保持推奨テスト: 5件

このファイルは**Next.jsのRootLayoutコンポーネント（Server Component）**をテストしており、5件のテストが保持すべきです。

**主要テストカテゴリ:**

- 設定検証（2件）: metadata, viewport
- レンダリング検証（1件）: children, html, body
- 国際化（1件）: lang属性
- プロバイダ統合（1件）: LiffProvider

### 削除推奨テスト: 1件

**重複テスト（1件）:**

- Test 6: Test 5と完全に重複。タイトルは「ErrorBoundaryとLiffProviderの順序」だが、ErrorBoundaryを全くテストしておらず、Test 5と同じ内容。

### 推奨事項

このテストファイルは**削除推奨1件（約17%）**です。

RootLayoutのテストは以下の理由で重要です：

- SEO設定（metadata）の保証
- モバイルUX設定（viewport）の保証
- アクセシビリティ（lang属性）の保証
- プロバイダ統合の確認

Test 6はタイトルと実装が一致しておらず、Test 5と完全に重複しているため削除推奨です。
