# Responsive Design E2E Tests

## ファイル情報

- **テストファイル**: `e2e/responsive.spec.ts`
- **テスト対象**: レスポンシブデザイン
- **テスト数**: 6
- **削除推奨テスト数**: 0

## 概要

このファイルは**様々なスマートフォン画面サイズでのゲーム表示と操作**をE2Eテストしています。

テストの目的:

- 複数のモバイルビューポート（iPhone SE、iPhone 12 Pro、Pixel 5、Samsung Galaxy S20、iPhone 12 Pro Max）での表示確認
- 横向き表示対応
- 小画面でのタッチターゲットサイズ確保
- 小画面での石数表示
- 全画面サイズでのターン表示
- ズーム・ピンチジェスチャー対応

## テストケース一覧

### Test 1: should display correctly on {viewport.name} ({viewport.width}x{viewport.height}) (5件のバリエーション)

- **元のテストタイトル**: should display correctly on {viewport.name} ({viewport.width}x{viewport.height})
- **日本語タイトル**: {viewport.name}（{viewport.width}x{viewport.height}）で正しく表示されること
- **テスト内容**: 5つの異なるモバイルビューポート（iPhone SE 375x667、iPhone 12 Pro 390x844、Pixel 5 393x851、Samsung Galaxy S20 360x800、iPhone 12 Pro Max 428x926）で、ボード表示、ビューポート内収まり、64セル表示、セルクリック・タップ操作を確認
- **テストコード抜粋**:

  ```typescript
  const MOBILE_VIEWPORTS = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Samsung Galaxy S20', width: 360, height: 800 },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  ];

  for (const viewport of MOBILE_VIEWPORTS) {
    test(`should display correctly on ${viewport.name}...`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/');

      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // ゲームボードがビューポート内に収まる
      const boardBoundingBox = await page
        .locator('[data-testid="game-board"]')
        .boundingBox();

      if (boardBoundingBox) {
        expect(boardBoundingBox.width).toBeLessThanOrEqual(viewport.width);
        expect(boardBoundingBox.height).toBeLessThanOrEqual(viewport.height);
      }

      // セルが表示される
      const cells = page.locator('[role="button"]');
      await expect(cells).toHaveCount(64);
    });
  }
  ```

- **期待値**:
  ```typescript
  expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  expect(boardBoundingBox.width).toBeLessThanOrEqual(viewport.width);
  expect(boardBoundingBox.height).toBeLessThanOrEqual(viewport.height);
  expect(cells).toHaveCount(64);
  ```
- **削除判定**: [ ] 不要
- **備考**: 5つのビューポートに対して同一テストを実行

---

### Test 2: should handle landscape orientation on mobile

- **元のテストタイトル**: should handle landscape orientation on mobile
- **日本語タイトル**: モバイルの横向き表示を処理できること
- **テスト内容**: 横向き表示（667x375）でボード表示とUIレイアウトが適切に動作することを確認
- **テストコード抜粋**:

  ```typescript
  // 横向き表示
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/');

  // ボードが表示される
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

  // UIが適切にレイアウトされる
  const cells = page.locator('[role="button"]');
  await expect(cells).toHaveCount(64);
  ```

- **期待値**:
  ```typescript
  expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  expect(cells).toHaveCount(64);
  ```
- **削除判定**: [ ] 不要

---

### Test 3: should maintain touch target size on small screens

- **元のテストタイトル**: should maintain touch target size on small screens
- **日本語タイトル**: 小画面でタッチターゲットサイズを維持すること
- **テスト内容**: 最小サイズのビューポート（320x568）でセルのタッチターゲットサイズが推奨値（44x44px）に準じていることを確認（最低30x30px）
- **テストコード抜粋**:

  ```typescript
  // 最小サイズのビューポート
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');

  // セルのサイズを確認
  const cell = page.locator('[data-row="0"][data-col="0"]');
  const boundingBox = await cell.boundingBox();

  expect(boundingBox).not.toBeNull();

  if (boundingBox) {
    // タッチターゲットサイズは44x44px以上が推奨
    expect(boundingBox.width).toBeGreaterThanOrEqual(30);
    expect(boundingBox.height).toBeGreaterThanOrEqual(30);
  }
  ```

- **期待値**:
  ```typescript
  expect(boundingBox).not.toBeNull();
  expect(boundingBox.width).toBeGreaterThanOrEqual(30);
  expect(boundingBox.height).toBeGreaterThanOrEqual(30);
  ```
- **削除判定**: [ ] 不要

---

### Test 4: should display stone count on small screens

- **元のテストタイトル**: should display stone count on small screens
- **日本語タイトル**: 小画面で石数を表示すること
- **テスト内容**: モバイルビューポート（375x667）で石数表示が見えることを確認
- **テストコード抜粋**:

  ```typescript
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // 石数表示が見える
  await expect(page.getByText(/2/)).toBeVisible();
  ```

- **期待値**:
  ```typescript
  expect(page.getByText(/2/)).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

### Test 5: should display turn indicator on all screen sizes

- **元のテストタイトル**: should display turn indicator on all screen sizes
- **日本語タイトル**: 全画面サイズでターン表示を行うこと
- **テスト内容**: 5つの異なるモバイルビューポート全てでターン表示（「あなたのターン」「黒」）が見えることを確認
- **テストコード抜粋**:

  ```typescript
  for (const viewport of MOBILE_VIEWPORTS) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto('/');

    // ターン表示が見える
    await expect(page.getByText(/あなたのターン|黒/)).toBeVisible();

    await page.waitForTimeout(100);
  }
  ```

- **期待値**:
  ```typescript
  expect(page.getByText(/あなたのターン|黒/)).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

### Test 6: should handle zoom and pinch gestures

- **元のテストタイトル**: should handle zoom and pinch gestures
- **日本語タイトル**: ズームとピンチジェスチャーを処理できること
- **テスト内容**: ズーム後もUIが崩れず、ボードが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // ズーム後もUIが崩れない
  await page.evaluate(() => {
    document.body.style.zoom = '1.5';
  });

  await page.waitForTimeout(500);

  // ボードが表示される
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  ```

- **期待値**:
  ```typescript
  expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 6件（全て）

このファイルは**レスポンシブデザイン**をE2Eテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 複数ビューポート（1件、5バリエーション）: iPhone SE、iPhone 12 Pro、Pixel 5、Samsung Galaxy S20、iPhone 12 Pro Max
- 横向き表示（1件）: ランドスケープモード
- タッチターゲット（1件）: 最小画面でのサイズ確保
- UI要素表示（2件）: 石数、ターン表示
- ズーム対応（1件）: ズーム時のUI崩れ防止

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

レスポンシブデザインE2Eテストは以下の理由で重要です：

- 複数デバイスでの表示確認
- モバイルファーストデザインの検証
- タッチ操作の快適性確保
- アクセシビリティの確保（タッチターゲットサイズ）
- 横向き表示対応

変更不要です。

**備考**:

- 5つの主要モバイルデバイスのビューポートをカバー
- 最小画面サイズ（320x568）での動作確認
- タッチターゲットサイズは44x44px推奨、最低30x30px確保
- ズーム機能はdocument.body.style.zoomで実装
