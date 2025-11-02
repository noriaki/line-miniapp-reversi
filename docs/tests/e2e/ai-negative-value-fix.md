# AI Negative Value Fix E2E Tests

## ファイル情報

- **テストファイル**: `e2e/ai-negative-value-fix.spec.ts`
- **テスト対象**: AI負評価値修正の検証
- **テスト数**: 2
- **削除推奨テスト数**: 0

## 概要

このファイルは**AIが負の評価値を正しく処理できるようになったバグ修正**をE2Eテストで検証しています。

テストの目的:

- AI計算エラー（「AI calculation error」）が発生しないことを確認
- 負の評価値（value < 0）でもランダムムーブにフォールバックしないことを確認
- 特定ケース（policy=63、a1位置、負評価値）の正常処理確認
- resが100未満でもエラーにならないことを確認

**バグの背景**:
以前、AIが負の評価値を返す場合、エンコードされた結果（res）が100未満になることがあり、これが「Invalid response」エラーとして扱われ、ランダムムーブにフォールバックしていた。このバグ修正により、負評価値でも正常に処理できるようになった。

## テストケース一覧

### Test 1: should complete game without "AI calculation error" when AI has negative evaluation

- **元のテストタイトル**: should complete game without "AI calculation error" when AI has negative evaluation
- **日本語タイトル**: AIが負の評価値を持つ場合でも「AI calculation error」なしでゲームを完了できること
- **テスト内容**: AI scriptを使用して完全なゲームをプレイし、console警告に「AI calculation error」が含まれないこと、および56手（ply 56、28手/サイド）を超えることを確認
- **テストコード抜粋**:

  ```typescript
  // リスナーを設定してコンソールエラーを収集
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (
      msg.type() === 'warning' &&
      msg.text().includes('AI calculation error')
    ) {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/');
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

  // Play full game using AI script for moves
  let history = '';
  let moveCount = 0;
  const maxMoves = 60; // Maximum possible moves in Reversi

  while (moveCount < maxMoves) {
    // Get next move from AI script
    let nextMove: string;
    try {
      nextMove = execSync(`node scripts/ai-next-move.js "${history}"`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
      })
        .trim()
        .split(' ')[0]; // Extract just the move (e.g., "f5" from "f5 0 1ms")
    } catch {
      console.log(`Game ended after ${moveCount} moves`);
      break;
    }

    if (!nextMove || nextMove === '') {
      break;
    }

    // Click the move
    const cell = page.locator(`#${nextMove}`);
    if (!(await cell.isVisible())) {
      console.log(`Cell ${nextMove} not visible, game likely ended`);
      break;
    }

    await cell.click();
    history += nextMove;
    moveCount++;

    // Wait for AI response (max 5 seconds)
    await page.waitForTimeout(5000);

    // Check if game is over
    const gameOver = await page.getByText(/ゲーム終了|勝利|敗北/).isVisible();
    if (gameOver) {
      console.log(`Game ended after ${moveCount} moves`);
      break;
    }
  }

  // Verify no AI calculation errors occurred
  expect(consoleErrors).toHaveLength(0);

  // Verify game progressed beyond move 56 (where error previously occurred)
  expect(moveCount).toBeGreaterThan(28); // ply 56 = 28 moves per side
  ```

- **期待値**:
  ```typescript
  expect(consoleErrors).toHaveLength(0);
  expect(moveCount).toBeGreaterThan(28);
  ```
- **削除判定**: [ ] 不要

---

### Test 2: should handle policy=63 (position a1) with negative value correctly

- **元のテストタイトル**: should handle policy=63 (position a1) with negative value correctly
- **日本語タイトル**: policy=63（a1位置）を負評価値で正しく処理できること
- **テスト内容**: 特定ケース（policy=63、a1位置、負評価値でres<100）を30手プレイし、res<100でも「Invalid response」エラーが発生しないことを確認
- **テストコード抜粋**:

  ```typescript
  const consoleMessages: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  await page.goto('/');
  await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

  // Play game using the script
  let history = '';
  let resMessages: string[] = [];

  for (let i = 0; i < 30; i++) {
    const nextMove = execSync(`node scripts/ai-next-move.js "${history}"`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
    })
      .trim()
      .split(' ')[0];

    if (!nextMove) break;

    const cell = page.locator(`#${nextMove}`);
    if (!(await cell.isVisible())) break;

    await cell.click();
    history += nextMove;
    await page.waitForTimeout(5000);

    // Collect "res" messages from console
    const resMsgs = consoleMessages.filter(
      (m) => m.type === 'log' && m.text.startsWith('res ')
    );
    resMessages = [...resMessages, ...resMsgs.map((m) => m.text)];
  }

  // Verify that even if res < 100, no error occurred
  const lowResMessages = resMessages.filter((msg) => {
    const res = parseInt(msg.replace('res ', ''));
    return res < 100;
  });

  if (lowResMessages.length > 0) {
    console.log(
      `Found ${lowResMessages.length} responses with res < 100:`,
      lowResMessages
    );
    // These should NOT trigger errors anymore
    const errors = consoleMessages.filter(
      (m) =>
        m.type === 'warning' &&
        m.text.includes('AI calculation error') &&
        m.text.includes('Invalid response')
    );
    expect(errors).toHaveLength(0);
  }
  ```

- **期待値**:
  ```typescript
  // res < 100のメッセージが見つかった場合
  if (lowResMessages.length > 0) {
    expect(errors).toHaveLength(0); // エラーが発生しないこと
  }
  ```
- **削除判定**: [ ] 不要

---

## サマリー

### 保持推奨テスト: 2件（全て）

このファイルは**AI負評価値バグ修正**をE2Eテストで検証しており、全てのテストが保持すべきです。

**主要テストカテゴリ:**

- 完全ゲームプレイ（1件）: 56手超のプレイでエラー非発生を確認
- 特定ケース検証（1件）: policy=63、res<100のケースでエラー非発生を確認

### 削除推奨テスト: 0件

### 推奨事項

このテストファイルは**削除推奨テストなし（0%）**で、非常に良好な状態です。

AI負評価値バグ修正E2Eテストは以下の理由で重要です：

- 重大なバグ修正のリグレッション防止
- 負評価値での正常動作の保証
- AI計算エラーの非発生確認
- 長時間プレイでの安定性確認

変更不要です。

**備考**:

- execSync()でnode scripts/ai-next-move.jsを呼び出し
- console.on()でAI計算エラーを監視
- resメッセージ（res < 100）を収集して検証
- 以前のバグ: value=-2の場合res=98（100未満）となり「Invalid response」エラー
- 修正後: res<100でもエラーにならず正常処理
- ply 56（28手/サイド）で以前エラーが発生していた
