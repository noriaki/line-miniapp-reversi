# WASM Error Handling E2E Tests

## ファイル情報

- **テストファイル**: `e2e/wasm-error.spec.ts`
- **テスト対象**: WASM初期化失敗シナリオ
- **テスト数**: 4
- **削除推奨テスト数**: 0

## 概要

このファイルは**WASMの読み込み失敗時のエラーハンドリング**をE2Eテストしています。

テストの目的:

- WASMロード失敗時のエラーメッセージ表示確認
- リロードボタンの表示と動作確認
- アプリクラッシュ防止確認
- WASMタイムアウトシナリオの処理確認

## テストケース一覧

### Test 1: should display error message when WASM fails to load

- **元のテストタイトル**: should display error message when WASM fails to load
- **日本語タイトル**: WASMロード失敗時にエラーメッセージを表示すること
- **テスト内容**: WASMファイルのロードをブロックしてエラーをシミュレートし、エラーメッセージとリロードボタンが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  // WASM ファイルのロードをブロックしてエラーをシミュレート
  await context.route('**/ai.js', (route) => route.abort());
  await context.route('**/ai.wasm', (route) => route.abort());

  await page.goto('/');

  // エラーメッセージが表示される
  await expect(
    page.getByText(/エラー|読み込めませんでした|初期化に失敗/)
  ).toBeVisible({ timeout: 10000 });

  // リロードボタンが表示される
  const reloadButton = page.getByText(/リロード|再読み込み|もう一度/);
  await expect(reloadButton).toBeVisible();
  ```

- **期待値**:
  ```typescript
  expect(
    page.getByText(/エラー|読み込めませんでした|初期化に失敗/)
  ).toBeVisible();
  expect(reloadButton).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

### Test 2: should allow user to reload when WASM initialization fails

- **元のテストタイトル**: should allow user to reload when WASM initialization fails
- **日本語タイトル**: WASM初期化失敗時にユーザーがリロードできること
- **テスト内容**: 最初はWASMをブロックしてエラー表示、その後ルートをクリアしてリロードボタンをクリックし、正常にゲームボードが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  // 最初はWASMをブロック
  await context.route('**/ai.js', (route) => route.abort());
  await context.route('**/ai.wasm', (route) => route.abort());

  await page.goto('/');

  // エラーメッセージが表示される
  await expect(page.getByText(/エラー|読み込めませんでした/)).toBeVisible({
    timeout: 10000,
  });

  // ルートをクリアして正常なロードを許可
  await context.unroute('**/ai.js');
  await context.unroute('**/ai.wasm');

  // リロードボタンをクリック
  const reloadButton = page.getByText(/リロード|再読み込み|もう一度/);
  await reloadButton.click();

  // ページがリロードされ、正常にゲームボードが表示される
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible({
    timeout: 10000,
  });
  ```

- **期待値**:
  ```typescript
  expect(page.getByText(/エラー|読み込めませんでした/)).toBeVisible();
  expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

### Test 3: should not crash the app when WASM error occurs

- **元のテストタイトル**: should not crash the app when WASM error occurs
- **日本語タイトル**: WASMエラー発生時にアプリがクラッシュしないこと
- **テスト内容**: WASMロードを失敗させ、アプリがクラッシュせずエラーUIが表示され、ページがホワイトスクリーンにならないことを確認
- **テストコード抜粋**:

  ```typescript
  // WASMロードを失敗させる
  await context.route('**/ai.wasm', (route) => route.abort());

  await page.goto('/');

  // アプリがクラッシュせず、エラーUIが表示される
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByText(/エラー|失敗/)).toBeVisible({ timeout: 10000 });

  // ページ全体がホワイトスクリーンにならない
  const backgroundColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  ```

- **期待値**:
  ```typescript
  expect(page.locator('body')).toBeVisible();
  expect(page.getByText(/エラー|失敗/)).toBeVisible();
  expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  ```
- **削除判定**: [ ] 不要

---

### Test 4: should handle WASM timeout scenario

- **元のテストタイトル**: should handle WASM timeout scenario
- **日本語タイトル**: WASMタイムアウトシナリオを処理できること
- **テスト内容**: WASMロードを遅延させてタイムアウトをシミュレートし、タイムアウトエラーメッセージが表示されることを確認
- **テストコード抜粋**:

  ```typescript
  // WASMロードを遅延させてタイムアウトをシミュレート
  await context.route('**/ai.wasm', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 15000)); // 15秒遅延
    await route.abort();
  });

  await page.goto('/');

  // タイムアウトエラーメッセージが表示される
  await expect(page.getByText(/タイムアウト|時間切れ|エラー/)).toBeVisible({
    timeout: 20000,
  });
  ```

- **期待値**:
  ```typescript
  expect(page.getByText(/タイムアウト|時間切れ|エラー/)).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 4件（全て）

このファイルは**WASM初期化失敗シナリオ**をE2Eテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- エラーメッセージ表示（1件）: WASMロード失敗時
- リロード機能（1件）: エラー回復
- クラッシュ防止（1件）: グレースフルデグラデーション
- タイムアウト処理（1件）: 長時間ロード時

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

WASMエラーハンドリングE2Eテストは以下の理由で重要です：

- ネットワークエラー時の適切なエラー表示
- ユーザーへの回復手段提供（リロードボタン）
- アプリケーションの安定性確保
- タイムアウト時の適切な処理

変更不要です。

**備考**:

- Playwrightのrouteインターセプトでネットワークエラーをシミュレート
- context.route()でWASMファイルのロードを制御
- context.unroute()でエラー状態から回復
- タイムアウトは15秒遅延でシミュレート
