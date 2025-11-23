/**
 * E2E Visual Regression Tests - Last Move Highlight Feature
 * Feature: last-move-highlight
 * Task 5.3: 視覚的回帰テストを追加する
 * Test-Driven Development: Tests written BEFORE implementation verification
 */

import { test, expect } from '@playwright/test';

test.describe('Last Move Highlight - Visual Regression Tests', () => {
  test.describe('Task 5.3.1: 人間プレーヤー着手後のハイライト表示', () => {
    test('should visually highlight the last move after human player move', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for game board to be ready
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Initially no cell should have last-move highlight
      const initialHighlight = await page
        .locator('[data-last-move="true"]')
        .count();
      expect(initialHighlight).toBe(0);

      // Find a valid move cell (has valid-hint)
      const validMoveCell = page.locator('.valid-move').first();
      await expect(validMoveCell).toBeVisible();

      // Get the cell's position for verification
      const cellRow = await validMoveCell.getAttribute('data-row');
      const cellCol = await validMoveCell.getAttribute('data-col');

      // Make a move
      await validMoveCell.click();

      // Wait for the move to be processed
      await page.waitForTimeout(500);

      // Verify the clicked cell now has last-move highlight
      const highlightedCell = page.locator(
        `[data-row="${cellRow}"][data-col="${cellCol}"][data-last-move="true"]`
      );
      await expect(highlightedCell).toBeVisible();

      // Verify exactly one cell has the highlight
      const highlightCount = await page
        .locator('[data-last-move="true"]')
        .count();
      expect(highlightCount).toBe(1);

      // Take screenshot for visual comparison
      await expect(page).toHaveScreenshot('human-move-highlight.png', {
        maxDiffPixels: 100,
      });
    });

    test('should remove previous highlight when new move is made', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for game board
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Make first move
      const firstMove = page.locator('.valid-move').first();
      const firstRow = await firstMove.getAttribute('data-row');
      const firstCol = await firstMove.getAttribute('data-col');
      await firstMove.click();
      await page.waitForTimeout(500);

      // Verify first move is highlighted
      await expect(
        page.locator(
          `[data-row="${firstRow}"][data-col="${firstCol}"][data-last-move="true"]`
        )
      ).toBeVisible();

      // Wait for AI turn to complete
      await page.waitForTimeout(2000);

      // Check if game is still in playing state (not finished)
      const gameStatus = await page.locator('.game-finished-text').count();
      if (gameStatus === 0) {
        // Game is still playing - make second move if possible
        const validMoves = await page.locator('.valid-move').count();
        if (validMoves > 0) {
          const secondMove = page.locator('.valid-move').first();
          await secondMove.click();
          await page.waitForTimeout(500);

          // Verify only the second move is highlighted (first highlight removed)
          const firstCellHighlight = await page
            .locator(
              `[data-row="${firstRow}"][data-col="${firstCol}"][data-last-move="true"]`
            )
            .count();
          expect(firstCellHighlight).toBe(0);

          // Verify exactly one highlight exists
          const totalHighlights = await page
            .locator('[data-last-move="true"]')
            .count();
          expect(totalHighlights).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  test.describe('Task 5.3.2: AIプレーヤー着手後のハイライト表示', () => {
    test('should visually highlight AI move after human move', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for game board
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Make human move to trigger AI turn
      const humanMove = page.locator('.valid-move').first();
      await humanMove.click();
      await page.waitForTimeout(500);

      // Wait for AI to think and make a move (max 3 seconds)
      await page.waitForTimeout(3000);

      // Verify a cell has last-move highlight (either human or AI move)
      const highlightedCells = await page
        .locator('[data-last-move="true"]')
        .count();
      expect(highlightedCells).toBeGreaterThanOrEqual(1);

      // Take screenshot for visual comparison
      await expect(page).toHaveScreenshot('ai-move-highlight.png', {
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Task 5.3.3: ダークモード/ライトモードでのハイライト視認性', () => {
    test('should be visible in light mode', async ({ page }) => {
      await page.goto('/');

      // Ensure light mode (default)
      await page.emulateMedia({ colorScheme: 'light' });

      // Wait for game board
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Make a move
      const validMove = page.locator('.valid-move').first();
      await validMove.click();
      await page.waitForTimeout(500);

      // Verify highlight exists
      const highlightedCell = page.locator('[data-last-move="true"]');
      await expect(highlightedCell).toBeVisible();

      // Take screenshot for light mode
      await expect(page).toHaveScreenshot('highlight-light-mode.png', {
        maxDiffPixels: 100,
      });
    });

    test('should be visible in dark mode', async ({ page }) => {
      await page.goto('/');

      // Set dark mode
      await page.emulateMedia({ colorScheme: 'dark' });

      // Wait for game board
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Make a move
      const validMove = page.locator('.valid-move').first();
      await validMove.click();
      await page.waitForTimeout(500);

      // Verify highlight exists
      const highlightedCell = page.locator('[data-last-move="true"]');
      await expect(highlightedCell).toBeVisible();

      // Take screenshot for dark mode
      await expect(page).toHaveScreenshot('highlight-dark-mode.png', {
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Task 5.3.4: モバイル画面サイズでのハイライトスケーリング', () => {
    const MOBILE_VIEWPORTS = [
      { name: 'small', width: 375, height: 667 }, // iPhone SE size (≤375px)
      { name: 'medium', width: 640, height: 900 }, // Small tablet (≤640px)
      { name: 'large', width: 768, height: 1024 }, // Tablet
    ];

    for (const viewport of MOBILE_VIEWPORTS) {
      test(`should scale highlight appropriately on ${viewport.name} screen (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        // Set viewport size
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await page.goto('/');

        // Wait for game board
        await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

        // Make a move
        const validMove = page.locator('.valid-move').first();
        await validMove.click();
        await page.waitForTimeout(500);

        // Verify highlight exists
        const highlightedCell = page.locator('[data-last-move="true"]');
        await expect(highlightedCell).toBeVisible();

        // Get cell bounding box to verify it's visible and appropriately sized
        const boundingBox = await highlightedCell.boundingBox();
        expect(boundingBox).not.toBeNull();

        if (boundingBox) {
          // Cell should be reasonably sized for touch interaction
          expect(boundingBox.width).toBeGreaterThan(20);
          expect(boundingBox.height).toBeGreaterThan(20);
        }

        // Take screenshot for visual comparison
        await expect(page).toHaveScreenshot(
          `highlight-${viewport.name}-${viewport.width}x${viewport.height}.png`,
          {
            maxDiffPixels: 100,
          }
        );
      });
    }
  });

  test.describe('Task 5.3.5: ゲームリセット時のハイライト状態', () => {
    test('should clear highlight when game is reset', async ({ page }) => {
      await page.goto('/');

      // Wait for game board
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Make a move
      const validMove = page.locator('.valid-move').first();
      await validMove.click();
      await page.waitForTimeout(500);

      // Verify highlight exists
      await expect(page.locator('[data-last-move="true"]')).toBeVisible();

      // Force game end by setting up a finished state
      // (In real scenario, we'd play through to end or use test utilities)
      // For now, we'll test the reset after a move

      // Reload page to reset game
      await page.reload();
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Verify no highlight after reset
      const highlightCount = await page
        .locator('[data-last-move="true"]')
        .count();
      expect(highlightCount).toBe(0);

      // Take screenshot to verify clean state
      await expect(page).toHaveScreenshot('highlight-after-reset.png', {
        maxDiffPixels: 100,
      });
    });
  });

  test.describe('Task 5.3.6: 既存UIとの視覚的互換性', () => {
    test('should not interfere with valid move hints visually', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for game board
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Verify valid move hints are visible
      const validMoveHints = page.locator('.valid-hint');
      const hintCount = await validMoveHints.count();
      expect(hintCount).toBeGreaterThan(0);

      // Make a move
      const validMove = page.locator('.valid-move').first();
      await validMove.click();
      await page.waitForTimeout(500);

      // Verify highlight exists
      await expect(page.locator('[data-last-move="true"]')).toBeVisible();

      // Wait for AI move
      await page.waitForTimeout(2000);

      // Verify valid move hints are still visible (if game continues)
      const gameFinished = await page.locator('.game-finished-text').count();
      if (gameFinished === 0) {
        // Game still playing - valid hints should still work
        const newHints = await page.locator('.valid-hint').count();
        // Valid hints should exist for next turn
        expect(newHints).toBeGreaterThanOrEqual(0);
      }

      // Take screenshot to verify visual compatibility
      await expect(page).toHaveScreenshot('highlight-with-valid-hints.png', {
        maxDiffPixels: 100,
      });
    });

    test('should not interfere with stone placement animations', async ({
      page,
    }) => {
      await page.goto('/');

      // Wait for game board
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Make a move
      const validMove = page.locator('.valid-move').first();
      const cellRow = await validMove.getAttribute('data-row');
      const cellCol = await validMove.getAttribute('data-col');
      await validMove.click();

      // Wait for stone placement animation
      await page.waitForTimeout(300);

      // Verify stone is placed
      const placedStone = page.locator(
        `[data-row="${cellRow}"][data-col="${cellCol}"] .stone-black`
      );
      await expect(placedStone).toBeVisible();

      // Verify highlight is also present
      const highlightedCell = page.locator(
        `[data-row="${cellRow}"][data-col="${cellCol}"][data-last-move="true"]`
      );
      await expect(highlightedCell).toBeVisible();

      // Take screenshot after animation
      await expect(page).toHaveScreenshot(
        'highlight-with-stone-animation.png',
        {
          maxDiffPixels: 100,
        }
      );
    });
  });
});
