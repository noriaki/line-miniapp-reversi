# AI Game E2E Tests

## ファイル情報

- **テストファイル**: `e2e/ai-game.spec.ts`
- **テスト対象**: AIゲーム全体フロー
- **テスト数**: 7
- **削除推奨テスト数**: 0

## 概要

このファイルは**AIゲームの完全なフローとパフォーマンス**をE2Eテストしています。

テストの目的:

- ゲーム起動からAI対戦完了までの完全フロー検証
- AI計算中のUI応答性確認
- ローディングインジケーター表示確認
- WASMロード失敗シナリオ
- AI計算タイムアウト処理
- 複数ターンのゲーム状態整合性
- メモリリーク検出

## テストケース一覧

### Test 1: should complete full AI battle flow from startup to finish

- **元のテストタイトル**: should complete full AI battle flow from startup to finish
- **日本語タイトル**: 起動からAI対戦完了までの完全フローを実行できること
- **テスト内容**: ゲームボード表示、初期状態、ユーザーの手、AIターン、ローディング、ターン切り替え、石数変化を確認
- **テストコード抜粋**:

  ```typescript
  await page.goto('/');
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

  // 初期状態確認
  const blackStones = page.locator('[data-stone="black"]');
  const whiteStones = page.locator('[data-stone="white"]');
  await expect(blackStones).toHaveCount(2);
  await expect(whiteStones).toHaveCount(2);

  // ユーザの最初の手を実行
  const firstMove = page.locator('[data-row="2"][data-col="3"]');
  await firstMove.click();

  // AIターンの開始を待機
  await expect(page.getByText(/AI|相手|白/)).toBeVisible({ timeout: 5000 });

  // 石数が変化している
  expect(blackCount + whiteCount).toBeGreaterThan(4);
  ```

- **期待値**:
  ```typescript
  expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  expect(blackStones).toHaveCount(2);
  expect(whiteStones).toHaveCount(2);
  expect(page.getByText(/AI|相手|白/)).toBeVisible();
  expect(blackCount + whiteCount).toBeGreaterThan(4);
  ```
- **削除判定**: [ ] 不要

---

### Test 2: should verify UI responsiveness during AI calculation

- **元のテストタイトル**: should verify UI responsiveness during AI calculation
- **日本語タイトル**: AI計算中にUIが応答性を維持すること
- **テスト内容**: AI計算中もUI操作（スクロール等）が可能で、ページがフリーズしていないことを確認
- **テストコード抜粋**:

  ```typescript
  const move = page.locator('[data-row="2"][data-col="3"]');
  await move.click();

  // AI計算中もUIは応答する
  await expect(page.getByText(/AI|思考中/)).toBeVisible({ timeout: 5000 });

  // スクロールやその他のUI操作が可能
  await page.evaluate(() => window.scrollTo(0, 100));

  // ページがフリーズしていない
  const isResponsive = await page.evaluate(() => {
    return document.readyState === 'complete';
  });
  expect(isResponsive).toBe(true);
  ```

- **期待値**:
  ```typescript
  expect(page.getByText(/AI|思考中/)).toBeVisible();
  expect(isResponsive).toBe(true);
  ```
- **削除判定**: [ ] 不要

---

### Test 3: should display loading indicator during AI calculation

- **元のテストタイトル**: should display loading indicator during AI calculation
- **日本語タイトル**: AI計算中にローディングインジケーターを表示すること
- **テスト内容**: AI計算中にローディングインジケーター（「思考中」「計算中」等）が表示され、計算完了後に消えることを確認
- **テストコード抜粋**:

  ```typescript
  const move = page.locator('[data-row="2"][data-col="3"]');
  await move.click();

  // ローディングインジケーターが表示される
  const loading = page.getByText(/思考中|計算中|AI/);
  await expect(loading).toBeVisible({ timeout: 5000 });

  // AI計算完了後、ローディングが消える
  await expect(loading).not.toBeVisible({ timeout: 5000 });
  ```

- **期待値**:
  ```typescript
  expect(loading).toBeVisible();
  expect(loading).not.toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

### Test 4: should handle WASM load failure scenario

- **元のテストタイトル**: should handle WASM load failure scenario
- **日本語タイトル**: WASMロード失敗シナリオを処理できること
- **テスト内容**: WASMファイルのロードを意図的に失敗させ、エラーメッセージが表示され、ゲームが開始できないことを確認
- **テストコード抜粋**:

  ```typescript
  // WASMファイルのロードを失敗させる
  await context.route('**/ai.wasm', (route) => route.abort());

  await page.goto('/');

  // エラーメッセージが表示される
  await expect(
    page.getByText(/エラー|読み込めませんでした|初期化に失敗/)
  ).toBeVisible({ timeout: 10000 });

  // ゲームは開始できない
  const cell = page.locator('[data-row="2"][data-col="3"]');
  await cell.click();

  // エラー状態が継続
  await expect(page.getByText(/エラー/)).toBeVisible();
  ```

- **期待値**:
  ```typescript
  expect(
    page.getByText(/エラー|読み込めませんでした|初期化に失敗/)
  ).toBeVisible();
  expect(page.getByText(/エラー/)).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

### Test 5: should handle AI calculation timeout scenario

- **元のテストタイトル**: should handle AI calculation timeout scenario
- **日本語タイトル**: AI計算タイムアウトシナリオを処理できること
- **テスト内容**: AI計算が最大3秒以内に完了するか、タイムアウトした場合はフォールバック処理が実行されることを確認（要件8.3）
- **テストコード抜粋**:

  ```typescript
  const move = page.locator('[data-row="2"][data-col="3"]');
  await move.click();

  // AI計算が開始
  await expect(page.getByText(/AI|思考中/)).toBeVisible({ timeout: 5000 });

  // 最大3秒以内にAI計算が完了する（要件8.3）
  // タイムアウトした場合はフォールバック処理が実行される

  // 5秒以内にターンが戻る（3秒計算 + フォールバック処理）
  await expect(page.getByText(/あなたのターン|黒/)).toBeVisible({
    timeout: 5000,
  });
  ```

- **期待値**:
  ```typescript
  expect(page.getByText(/AI|思考中/)).toBeVisible();
  expect(page.getByText(/あなたのターン|黒/)).toBeVisible();
  ```
- **削除判定**: [ ] 不要

---

### Test 6: should maintain game state consistency across multiple AI turns

- **元のテストタイトル**: should maintain game state consistency across multiple AI turns
- **日本語タイトル**: 複数のAIターンにわたってゲーム状態の整合性を維持すること
- **テスト内容**: 3ターン分のプレイを通じてゲーム状態が正しく維持され、石数が増加していることを確認
- **テストコード抜粋**:

  ```typescript
  // 3ターン分のプレイ
  for (let turn = 0; turn < 3; turn++) {
    // 有効手を探してクリック
    const validMove = page.locator('.valid-move, [data-valid="true"]').first();
    await validMove.click();

    // AIターンを待機
    await expect(page.getByText(/AI|相手|白/)).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(3500);

    // ターンが戻る
    await expect(page.getByText(/あなたのターン|黒/)).toBeVisible({
      timeout: 5000,
    });
  }

  // 石数が増加している
  expect(blackCount + whiteCount).toBeGreaterThan(4);
  ```

- **期待値**:
  ```typescript
  expect(page.getByText(/AI|相手|白/)).toBeVisible();
  expect(page.getByText(/あなたのターン|黒/)).toBeVisible();
  expect(blackCount + whiteCount).toBeGreaterThan(4);
  ```
- **削除判定**: [ ] 不要

---

### Test 7: should not have memory leaks during gameplay

- **元のテストタイトル**: should not have memory leaks during gameplay
- **日本語タイトル**: ゲームプレイ中にメモリリークが発生しないこと
- **テスト内容**: 5ターン分のプレイ後、メモリ使用量が極端に増加していないことを確認（50%未満の増加）
- **テストコード抜粋**:

  ```typescript
  // 初期メモリ使用量（おおよそ）
  const initialMetrics = await page.evaluate(() => {
    interface PerformanceWithMemory extends Performance {
      memory?: {
        usedJSHeapSize: number;
      };
    }
    const perf = performance as PerformanceWithMemory;
    if ('memory' in perf && perf.memory) {
      return perf.memory.usedJSHeapSize;
    }
    return null;
  });

  // 5ターン分のプレイ
  for (let turn = 0; turn < 5; turn++) {
    const validMove = page.locator('.valid-move, [data-valid="true"]').first();
    await validMove.click();
    await page.waitForTimeout(4000);
  }

  // 最終メモリ使用量
  // ...

  // メモリ使用量が極端に増加していないことを確認
  if (initialMetrics && finalMetrics) {
    const memoryIncrease = finalMetrics - initialMetrics;
    const memoryIncreasePercent = (memoryIncrease / initialMetrics) * 100;

    // 5ターンで50%以上のメモリ増加は異常
    expect(memoryIncreasePercent).toBeLessThan(50);
  }
  ```

- **期待値**:
  ```typescript
  expect(memoryIncreasePercent).toBeLessThan(50);
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 7件（全て）

このファイルは**AIゲームの完全フローとパフォーマンス**をE2Eテストしており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 完全フロー（1件）: 起動からAI対戦完了まで
- UI応答性（1件）: AI計算中のUI操作
- ローディング表示（1件）: インジケーター表示・非表示
- エラーハンドリング（1件）: WASMロード失敗
- タイムアウト処理（1件）: AI計算タイムアウト
- 状態整合性（1件）: 複数ターンの状態管理
- パフォーマンス（1件）: メモリリーク検出

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

AIゲームE2Eテストは以下の理由で重要です：

- エンドツーエンドの完全フロー検証
- Web Worker経由のWASMエンジン統合確認
- UI/UXの実際の動作確認
- パフォーマンスとメモリ管理の検証
- エラーケースの実際の動作確認

変更不要です。

**備考**:

- Playwrightを使用した実ブラウザテスト
- Web Worker経由のAIエンジン統合テスト
- performance.memory APIを使用したメモリリーク検出
- contextのrouteインターセプトによるエラーシミュレーション
