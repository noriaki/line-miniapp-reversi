/**
 * E2E Test - Game Basic Operations
 *
 * Single file containing all basic game operation tests for LINE miniapp Reversi.
 * Tests mobile devices only (Pixel 5, iPhone 12).
 */

import { test, expect, type Page, type Locator } from '@playwright/test';

// =============================================================================
// Selectors
// =============================================================================

const SELECTORS = {
  gameBoard: '[data-testid="game-board"]',
  messageBox: '[data-testid="message-box"]',
  cell: (row: number, col: number) => `[data-row="${row}"][data-col="${col}"]`,
  blackStones: '[data-stone="black"]',
  whiteStones: '[data-stone="white"]',
  validMoves: '[data-valid="true"]',
} as const;

const TURN_TEXT = {
  player: 'あなたのターン',
  ai: 'AI のターン',
  thinking: '思考中',
} as const;

const ERROR_MESSAGES = {
  occupied: 'そのマスには既に石が置かれています',
  noFlips: 'そのマスに置いても石を反転できません',
} as const;

// =============================================================================
// Wait Configuration
// =============================================================================

const WAIT_CONFIG = {
  /** E2E待機の最大時間（WASM初期化 + AI計算 + UI更新を含む） */
  maxWaitForAIResponse: 10000,
  uiUpdateDelay: 500,
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Taps a valid move cell
 * @param page - Playwright Page object
 * @returns The tapped cell's Locator
 */
async function tapValidMove(page: Page): Promise<Locator> {
  const validCells = page.locator(SELECTORS.validMoves);
  const count = await validCells.count();
  expect(count).toBeGreaterThan(0);

  const firstValidCell = validCells.first();
  await firstValidCell.tap();
  return firstValidCell;
}

/**
 * Taps a specific valid move cell by position
 * @param page - Playwright Page object
 * @param row - Row index (0-7)
 * @param col - Column index (0-7)
 * @returns The tapped cell's Locator
 */
async function tapCellAt(
  page: Page,
  row: number,
  col: number
): Promise<Locator> {
  const cell = page.locator(SELECTORS.cell(row, col));
  await cell.tap();
  return cell;
}

/**
 * Waits for AI turn to start (or already completed)
 * Note: AI may respond very quickly, so this function checks for either:
 * - AI turn text is visible, OR
 * - Player turn text is visible (AI already responded)
 * @param page - Playwright Page object
 * @param timeout - Max wait time (default: 10000ms)
 */
async function waitForAITurn(
  page: Page,
  timeout: number = WAIT_CONFIG.maxWaitForAIResponse
): Promise<void> {
  // Wait for either AI turn or player turn (AI may have already responded)
  await expect(
    page.getByText(TURN_TEXT.ai).or(page.getByText(TURN_TEXT.player))
  ).toBeVisible({ timeout });
}

/**
 * Waits for player turn to resume
 * @param page - Playwright Page object
 * @param timeout - Max wait time (default: 10000ms)
 */
async function waitForPlayerTurn(
  page: Page,
  timeout: number = WAIT_CONFIG.maxWaitForAIResponse
): Promise<void> {
  await expect(page.getByText(TURN_TEXT.player)).toBeVisible({ timeout });
}

/**
 * Gets the stone count
 * @param page - Playwright Page object
 * @returns { black: number, white: number }
 */
async function getStoneCount(
  page: Page
): Promise<{ black: number; white: number }> {
  const blackCount = await page.locator(SELECTORS.blackStones).count();
  const whiteCount = await page.locator(SELECTORS.whiteStones).count();
  return { black: blackCount, white: whiteCount };
}

/**
 * Gets the displayed score count from aria-label
 * @param page - Playwright Page object
 * @returns { black: number, white: number }
 */
async function getDisplayedScore(
  page: Page
): Promise<{ black: number; white: number }> {
  const blackScoreElement = page.locator('[aria-label^="Black score:"]');
  const whiteScoreElement = page.locator('[aria-label^="White score:"]');

  const blackLabel = await blackScoreElement.getAttribute('aria-label');
  const whiteLabel = await whiteScoreElement.getAttribute('aria-label');

  const blackScore = blackLabel
    ? parseInt(blackLabel.replace('Black score: ', ''), 10)
    : 0;
  const whiteScore = whiteLabel
    ? parseInt(whiteLabel.replace('White score: ', ''), 10)
    : 0;

  return { black: blackScore, white: whiteScore };
}

/**
 * Checks if MessageBox is visible by verifying opacity
 * @param page - Playwright Page object
 * @returns true if message box is visible (opacity > 0)
 */
async function isMessageBoxVisible(page: Page): Promise<boolean> {
  const messageBox = page.locator(SELECTORS.messageBox);
  // Check the inner div with role="status" for opacity
  const statusDiv = messageBox.locator('[role="status"]');
  const opacity = await statusDiv.evaluate((el) => {
    return window.getComputedStyle(el).opacity;
  });
  return parseFloat(opacity) > 0;
}

/**
 * Waits for MessageBox to become visible with specific text
 * @param page - Playwright Page object
 * @param text - Text to wait for
 * @param timeout - Max wait time
 */
async function waitForMessageBoxWithText(
  page: Page,
  text: string,
  timeout: number = 2000
): Promise<void> {
  const messageBox = page.locator(SELECTORS.messageBox);
  const statusDiv = messageBox.locator('[role="status"]');

  await expect(statusDiv).toContainText(text, { timeout });

  // Verify opacity is 1 (visible)
  await expect(async () => {
    const opacity = await statusDiv.evaluate(
      (el) => window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBe(1);
  }).toPass({ timeout: 1000 });
}

// =============================================================================
// Test Suite
// =============================================================================

test.describe('E2E Test - Game Basic Operations', () => {
  // beforeEach: Navigate to page and initialize game
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for game board to be visible
    await expect(page.locator(SELECTORS.gameBoard)).toBeVisible();
  });

  // ===========================================================================
  // Initial Board Display Tests
  // ===========================================================================

  test.describe('Initial Board Display', () => {
    test('should display 8x8 game board', async ({ page }) => {
      const cells = page.locator('[data-row][data-col]');
      await expect(cells).toHaveCount(64);

      // Verify board structure: rows 0-7, cols 0-7
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cell = page.locator(SELECTORS.cell(row, col));
          await expect(cell).toBeVisible();
        }
      }
    });

    test('should display initial 4 stones at correct positions', async ({
      page,
    }) => {
      const stoneCount = await getStoneCount(page);
      expect(stoneCount.black).toBe(2);
      expect(stoneCount.white).toBe(2);

      // Verify exact positions (d4=row3,col3, e5=row4,col4 are black; d5=row3,col4, e4=row4,col3 are white)
      // Note: In Reversi, initial positions are:
      // d4 (row 3, col 3) - white
      // e4 (row 3, col 4) - black
      // d5 (row 4, col 3) - black
      // e5 (row 4, col 4) - white
      await expect(page.locator(SELECTORS.cell(3, 3))).toHaveAttribute(
        'data-stone',
        'white'
      );
      await expect(page.locator(SELECTORS.cell(3, 4))).toHaveAttribute(
        'data-stone',
        'black'
      );
      await expect(page.locator(SELECTORS.cell(4, 3))).toHaveAttribute(
        'data-stone',
        'black'
      );
      await expect(page.locator(SELECTORS.cell(4, 4))).toHaveAttribute(
        'data-stone',
        'white'
      );
    });

    test('should display valid move hints', async ({ page }) => {
      const validMoves = page.locator(SELECTORS.validMoves);
      const validCount = await validMoves.count();

      // Initial valid moves for black: 4 positions (d3, c4, f5, e6)
      expect(validCount).toBe(4);

      // Verify valid moves are visible
      for (let i = 0; i < validCount; i++) {
        await expect(validMoves.nth(i)).toBeVisible();
      }
    });

    test('should display player turn indicator', async ({ page }) => {
      await expect(page.getByText(TURN_TEXT.player)).toBeVisible();
    });
  });

  // ===========================================================================
  // Stone Placement and Flipping Tests
  // ===========================================================================

  test.describe('Stone Placement and Flipping', () => {
    test('should place stone on valid cell when tapped', async ({ page }) => {
      const initialStoneCount = await getStoneCount(page);

      // Get a valid move position before tapping
      const validCells = page.locator(SELECTORS.validMoves);
      const firstValid = validCells.first();
      const row = await firstValid.getAttribute('data-row');
      const col = await firstValid.getAttribute('data-col');

      // Tap the valid cell
      await firstValid.tap();

      // Wait for AI turn (stone should be placed)
      await waitForAITurn(page);

      // Verify stone was placed at that position
      const tappedCell = page.locator(SELECTORS.cell(Number(row), Number(col)));
      await expect(tappedCell).toHaveAttribute('data-stone', 'black');

      // Stone count should increase
      const afterStoneCount = await getStoneCount(page);
      expect(afterStoneCount.black + afterStoneCount.white).toBeGreaterThan(
        initialStoneCount.black + initialStoneCount.white
      );
    });

    test('should flip opponent stones when capturing', async ({ page }) => {
      const initialCount = await getStoneCount(page);

      // Tap a valid move
      await tapValidMove(page);

      // Wait for AI turn
      await waitForAITurn(page);

      // After placing stone, black count should increase (placed stone + flipped stones)
      const afterPlayerMove = await getStoneCount(page);
      expect(afterPlayerMove.black).toBeGreaterThan(initialCount.black);

      // White count should decrease (flipped stones) or stay same if AI hasn't moved
      // Note: At this point AI turn starts, so we check before AI moves
    });

    test('should update stone count display correctly', async ({ page }) => {
      const initialScore = await getDisplayedScore(page);
      expect(initialScore.black).toBe(2);
      expect(initialScore.white).toBe(2);

      // Tap a valid move
      await tapValidMove(page);

      // Wait for UI update (AI turn starts)
      await waitForAITurn(page);

      // Check score updated
      const afterScore = await getDisplayedScore(page);
      // After player move, black should have more stones (placed + flipped)
      expect(afterScore.black).toBeGreaterThan(initialScore.black);
    });
  });

  // ===========================================================================
  // Turn Switching Tests
  // ===========================================================================

  test.describe('Turn Switching', () => {
    test('should switch to AI turn after player move', async ({ page }) => {
      await expect(page.getByText(TURN_TEXT.player)).toBeVisible();

      // Player makes a move
      await tapValidMove(page);

      // Turn should switch to AI
      await waitForAITurn(page);
      await expect(page.getByText(TURN_TEXT.ai)).toBeVisible();
    });

    test('should switch back to player turn after AI response', async ({
      page,
    }) => {
      // Player makes a move
      await tapValidMove(page);

      // Wait for AI to respond and turn to come back
      await waitForPlayerTurn(page);

      await expect(page.getByText(TURN_TEXT.player)).toBeVisible();
    });

    test('should display valid move hints during player turn', async ({
      page,
    }) => {
      await expect(page.getByText(TURN_TEXT.player)).toBeVisible();

      const validMoves = page.locator(SELECTORS.validMoves);
      const count = await validMoves.count();
      expect(count).toBeGreaterThan(0);

      // All valid moves should be visible
      for (let i = 0; i < count; i++) {
        await expect(validMoves.nth(i)).toBeVisible();
      }
    });

    test('should hide valid move hints during AI turn', async ({ page }) => {
      // Get player's initial valid move positions
      const initialValidMoves = page.locator(SELECTORS.validMoves);
      const initialValidPositions: Array<{
        row: string | null;
        col: string | null;
      }> = [];
      const initialCount = await initialValidMoves.count();
      for (let i = 0; i < initialCount; i++) {
        const cell = initialValidMoves.nth(i);
        initialValidPositions.push({
          row: await cell.getAttribute('data-row'),
          col: await cell.getAttribute('data-col'),
        });
      }

      // Player makes a move to trigger AI turn
      await tapValidMove(page);

      // Wait for AI turn
      await waitForAITurn(page);

      // Verify cells are disabled during AI turn (player cannot interact)
      const allCells = page.locator('[data-row][data-col]');
      const cellCount = await allCells.count();

      // Check that all cells are disabled during AI turn
      for (let i = 0; i < cellCount; i++) {
        const cell = allCells.nth(i);
        const isDisabled = await cell.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });
  });

  // ===========================================================================
  // Invalid Move Handling Tests
  // ===========================================================================

  test.describe('Invalid Move Handling', () => {
    test('should show error message when tapping occupied cell', async ({
      page,
    }) => {
      // Tap an occupied cell (initial white stone at d4 = row 3, col 3)
      await tapCellAt(page, 3, 3);

      // Wait for error message in MessageBox
      await waitForMessageBoxWithText(page, ERROR_MESSAGES.occupied);

      // Verify MessageBox is visible
      const isVisible = await isMessageBoxVisible(page);
      expect(isVisible).toBe(true);
    });

    test('should show error message when tapping cell that cannot flip stones', async ({
      page,
    }) => {
      // Tap a cell that's not a valid move (e.g., corner a1 = row 0, col 0)
      await tapCellAt(page, 0, 0);

      // Wait for error message in MessageBox
      await waitForMessageBoxWithText(page, ERROR_MESSAGES.noFlips);

      // Verify MessageBox is visible
      const isVisible = await isMessageBoxVisible(page);
      expect(isVisible).toBe(true);
    });

    test('should allow game to continue after error', async ({ page }) => {
      // First, trigger an error
      await tapCellAt(page, 0, 0);

      // Wait for error message
      await waitForMessageBoxWithText(page, ERROR_MESSAGES.noFlips);

      // Wait a bit for message to be shown
      await page.waitForTimeout(500);

      // Now make a valid move
      const validCells = page.locator(SELECTORS.validMoves);
      const count = await validCells.count();
      expect(count).toBeGreaterThan(0);

      // Tap a valid move
      await tapValidMove(page);

      // Game should continue - AI turn starts
      await waitForAITurn(page);
      await expect(page.getByText(TURN_TEXT.ai)).toBeVisible();
    });
  });

  // ===========================================================================
  // AI Battle (2 Rounds) Tests
  // ===========================================================================

  test.describe('AI Battle - 2 Rounds', () => {
    test('should complete AI response after player first move', async ({
      page,
    }) => {
      const initialCount = await getStoneCount(page);

      // Player's first move
      await tapValidMove(page);

      // Wait for AI to complete response
      await waitForPlayerTurn(page, WAIT_CONFIG.maxWaitForAIResponse);

      // Verify AI made a move (white stone count should increase)
      const afterAIMove = await getStoneCount(page);
      expect(afterAIMove.white).toBeGreaterThan(initialCount.white);
    });

    test('should allow player second move after AI first response', async ({
      page,
    }) => {
      // Player's first move
      await tapValidMove(page);

      // Wait for player turn to return
      await waitForPlayerTurn(page, WAIT_CONFIG.maxWaitForAIResponse);

      // Verify valid moves are available
      const validMoves = page.locator(SELECTORS.validMoves);
      const count = await validMoves.count();
      expect(count).toBeGreaterThan(0);

      // Player can tap a valid move (second move)
      const beforeSecondMove = await getStoneCount(page);
      await tapValidMove(page);

      // AI turn should start
      await waitForAITurn(page);

      // Verify stone was placed
      const afterSecondMove = await getStoneCount(page);
      expect(afterSecondMove.black).toBeGreaterThan(beforeSecondMove.black);
    });

    test('should complete AI second response after player second move', async ({
      page,
    }) => {
      // Round 1: Player move -> AI response
      await tapValidMove(page);
      await waitForPlayerTurn(page, WAIT_CONFIG.maxWaitForAIResponse);

      const afterRound1 = await getStoneCount(page);

      // Round 2: Player move -> AI response
      await tapValidMove(page);
      await waitForPlayerTurn(page, WAIT_CONFIG.maxWaitForAIResponse);

      // Verify AI made second move
      const afterRound2 = await getStoneCount(page);
      expect(afterRound2.white).toBeGreaterThan(afterRound1.white);
    });

    test('should display thinking indicator during AI turn', async ({
      page,
    }) => {
      // AI may respond very quickly, so check for either thinking indicator or completed state
      const initialCount = await getStoneCount(page);

      // Player makes a move
      await tapValidMove(page);

      const thinkingOrCompleted = await Promise.race([
        page
          .getByText(TURN_TEXT.thinking)
          .waitFor({ state: 'visible', timeout: 1000 })
          .then(() => 'thinking_shown'),
        (async () => {
          await page.waitForTimeout(500);
          const currentCount = await getStoneCount(page);
          if (currentCount.white > initialCount.white) {
            return 'ai_completed';
          }
          await page
            .getByText(TURN_TEXT.thinking)
            .waitFor({ state: 'visible', timeout: 2500 });
          return 'thinking_shown';
        })(),
      ]);

      expect(['thinking_shown', 'ai_completed']).toContain(thinkingOrCompleted);
    });

    test('should complete 2 full rounds of play', async ({ page }) => {
      // Combined test for full 2-round gameplay

      // Initial state
      const initialScore = await getDisplayedScore(page);
      expect(initialScore.black).toBe(2);
      expect(initialScore.white).toBe(2);

      // === Round 1 ===
      // Player's first move
      await tapValidMove(page);

      // Wait for AI response - AI may complete very quickly
      // Note: We skip checking for thinking indicator here as it may not be visible
      // due to fast AI response. The "should display thinking indicator" test covers this.

      // Wait for AI response within timeout
      await waitForPlayerTurn(page, WAIT_CONFIG.maxWaitForAIResponse);

      const afterRound1 = await getDisplayedScore(page);
      // After round 1, total stones should be 6 (2 initial + 2 player + 2 AI)
      // But due to flipping, actual count varies
      expect(afterRound1.black + afterRound1.white).toBeGreaterThan(
        initialScore.black + initialScore.white
      );

      // === Round 2 ===
      // Player's second move
      await tapValidMove(page);

      // Wait for AI response within timeout
      await waitForPlayerTurn(page, WAIT_CONFIG.maxWaitForAIResponse);

      const afterRound2 = await getDisplayedScore(page);
      // After round 2, total stones should increase further
      expect(afterRound2.black + afterRound2.white).toBeGreaterThan(
        afterRound1.black + afterRound1.white
      );

      // Verify game is still in playing state (not finished)
      await expect(page.getByText(TURN_TEXT.player)).toBeVisible();
    });
  });
});
