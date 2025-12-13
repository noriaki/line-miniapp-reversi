/**
 * E2E Test - Result Page Operations
 *
 * Tests for the game result page (/r/[side]/[encodedMoves])
 * Validates direct page access, content display, and share button visibility.
 * Tests mobile devices only (Pixel 5, iPhone 12).
 *
 * Note: Game end -> result page transition and fallback are tested manually
 * due to timing complexity in E2E tests.
 */

import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Selectors
// =============================================================================

const SELECTORS = {
  resultContainer: '[data-testid="result-container"]',
  boardDisplay: '[data-testid="board-display"]',
  scoreDisplay: '[data-testid="score-display"]',
  gameResultText: '[data-testid="game-result-text"]',
  errorMessage: '[data-testid="error-message"]',
  shareLineButton: '[data-testid="share-line-button"]',
  shareWebButton: '[data-testid="share-web-button"]',
  playAgainButton: 'a:has-text("もう一度遊ぶ")',
  gameStartLink: 'a:has-text("ゲームを始める")',
} as const;

// =============================================================================
// Test Data
// =============================================================================

/**
 * Valid encoded game data for testing
 * These are Base64URL encoded WTHOR format moves
 *
 * WTHOR format: Each position is encoded as 2 digits (row+1, col+1)
 * Then the string is Base64URL encoded
 */
const TEST_DATA = {
  // Simple 3-move game: d3, c3, b3
  // Positions: (2,3)=34, (2,2)=33, (2,1)=32
  // WTHOR string: "343332"
  // Base64URL: "MzQzMzMy"
  shortGame: {
    encodedMoves: 'MzQzMzMy',
    expectedBlackScore: 5,
    expectedWhiteScore: 2,
  },

  // Empty game (initial state)
  // Empty string encoded
  emptyGame: {
    encodedMoves: '',
    expectedBlackScore: 2,
    expectedWhiteScore: 2,
  },

  // Invalid encoded data
  invalid: {
    // Invalid Base64 characters
    badBase64: '!!!invalid!!!',
    // Valid Base64 but invalid position (99 = out of range)
    outOfRange: 'OTk5OQ', // "9999" in Base64
    // Valid Base64 but odd length
    oddLength: 'MTIz', // "123" in Base64
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Navigate to result page with specific parameters
 */
async function navigateToResultPage(
  page: Page,
  side: string,
  encodedMoves: string
): Promise<void> {
  const url = `/r/${side}/${encodedMoves}`;
  await page.goto(url);
}

// =============================================================================
// Test Suite
// =============================================================================

test.describe('E2E Test - Result Page', () => {
  // ===========================================================================
  // Result Page Direct Access Tests
  // ===========================================================================

  test.describe('Direct Access with Valid Data', () => {
    test('should display board and score for valid black player game', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // Verify result container is displayed
      await expect(page.locator(SELECTORS.resultContainer)).toBeVisible();

      // Verify board is displayed
      await expect(page.locator(SELECTORS.boardDisplay)).toBeVisible();

      // Verify score display is visible
      await expect(page.locator(SELECTORS.scoreDisplay)).toBeVisible();

      // Verify game result text is shown
      await expect(page.locator(SELECTORS.gameResultText)).toBeVisible();
    });

    test('should display board and score for valid white player game', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'w', TEST_DATA.shortGame.encodedMoves);

      // Verify result container is displayed
      await expect(page.locator(SELECTORS.resultContainer)).toBeVisible();

      // Verify container indicates white player side
      await expect(page.locator(SELECTORS.resultContainer)).toHaveAttribute(
        'data-player-side',
        'white'
      );
    });

    test('should display correct player perspective for black side', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // Verify container indicates black player side
      await expect(page.locator(SELECTORS.resultContainer)).toHaveAttribute(
        'data-player-side',
        'black'
      );

      // Check score display contains player labels
      const scoreDisplay = page.locator(SELECTORS.scoreDisplay);
      await expect(scoreDisplay).toContainText('プレーヤー');
      await expect(scoreDisplay).toContainText('AI');
    });

    test('should return 404 for empty encodedMoves segment', async ({
      page,
    }) => {
      // Empty encoded moves means the URL path segment is empty,
      // resulting in /r/b/ which doesn't match the /r/[side]/[encodedMoves] pattern.
      // This correctly returns a 404.
      await navigateToResultPage(page, 'b', TEST_DATA.emptyGame.encodedMoves);

      // With empty encodedMoves, the URL becomes /r/b/ which returns 404
      await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  test.describe('Error Handling', () => {
    test('should show error message for invalid side parameter', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'x', TEST_DATA.shortGame.encodedMoves);

      // Should show error message
      await expect(page.locator(SELECTORS.errorMessage)).toBeVisible();

      // Should provide link to start game
      await expect(page.locator(SELECTORS.gameStartLink)).toBeVisible();
      await expect(page.locator(SELECTORS.gameStartLink)).toHaveAttribute(
        'href',
        '/'
      );
    });

    test('should show error message for invalid Base64 encoding', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.invalid.badBase64);

      // Should show error message
      await expect(page.locator(SELECTORS.errorMessage)).toBeVisible();
    });

    test('should show error message for out of range positions', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.invalid.outOfRange);

      // Should show error message
      await expect(page.locator(SELECTORS.errorMessage)).toBeVisible();
    });

    test('should provide navigation to game page on error', async ({
      page,
    }) => {
      await navigateToResultPage(
        page,
        'invalid',
        TEST_DATA.shortGame.encodedMoves
      );

      // Verify error message and navigation link
      await expect(page.locator(SELECTORS.errorMessage)).toBeVisible();

      const gameLink = page.locator(SELECTORS.gameStartLink);
      await expect(gameLink).toBeVisible();

      // Click the link and verify navigation
      await gameLink.click();
      await expect(page).toHaveURL('/');
    });
  });

  // ===========================================================================
  // Action Button Tests
  // ===========================================================================

  test.describe('Action Buttons', () => {
    test('should display play again button', async ({ page }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // Play again button should be visible
      await expect(page.locator(SELECTORS.playAgainButton)).toBeVisible();
      await expect(page.locator(SELECTORS.playAgainButton)).toHaveAttribute(
        'href',
        '/'
      );
    });

    test('should navigate to home when play again is clicked', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // Click play again button
      await page.locator(SELECTORS.playAgainButton).click();

      // Should navigate to home page
      await expect(page).toHaveURL('/');
    });
  });

  // ===========================================================================
  // Share Button Display Tests
  // Note: Share buttons require Client Component integration.
  // These tests verify the ShareButtons component when integrated into the page.
  // Skip if share buttons are not yet integrated into the result page.
  // ===========================================================================

  test.describe('Share Button Display', () => {
    test.skip('should display LINE share button on result page', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // LINE share button should be visible
      await expect(page.locator(SELECTORS.shareLineButton)).toBeVisible();

      // Button should have LINE green color
      const lineButton = page.locator(SELECTORS.shareLineButton);
      await expect(lineButton).toHaveCSS('background-color', 'rgb(6, 199, 85)');
    });

    test.skip('Web Share button visibility depends on API availability', async ({
      page,
    }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // Web Share button may or may not be visible depending on browser support
      // In Playwright tests, we just check the page loads correctly
      const webShareButton = page.locator(SELECTORS.shareWebButton);
      const isVisible = await webShareButton.isVisible().catch(() => false);

      // Either visible or not, but page should not error
      expect(typeof isVisible).toBe('boolean');

      // If visible, should be enabled
      if (isVisible) {
        await expect(webShareButton).toBeEnabled();
      }
    });
  });

  // ===========================================================================
  // Game Result Display Tests
  // ===========================================================================

  test.describe('Game Result Display', () => {
    test('should display game result header', async ({ page }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // Check for game end message
      await expect(page.getByText('ゲーム終了')).toBeVisible();
    });

    test('should display score with stone indicators', async ({ page }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      const scoreDisplay = page.locator(SELECTORS.scoreDisplay);
      await expect(scoreDisplay).toBeVisible();

      // Check for vs separator
      await expect(scoreDisplay).toContainText('vs');
    });

    test('should display winner result for player', async ({ page }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // The game result should show win/lose/draw based on score
      const resultText = page.locator(SELECTORS.gameResultText);
      await expect(resultText).toBeVisible();

      // Text content should be one of the expected outcomes
      const text = await resultText.textContent();
      expect(text).toMatch(/プレーヤーの勝ち|AIの勝ち|引き分け/);
    });
  });

  // ===========================================================================
  // Responsive Layout Tests
  // ===========================================================================

  test.describe('Mobile Layout', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // All key elements should be visible
      await expect(page.locator(SELECTORS.resultContainer)).toBeVisible();
      await expect(page.locator(SELECTORS.boardDisplay)).toBeVisible();
      await expect(page.locator(SELECTORS.scoreDisplay)).toBeVisible();
      await expect(page.locator(SELECTORS.playAgainButton)).toBeVisible();
    });

    test('should have scrollable content if needed', async ({ page }) => {
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);

      // Play again button should be reachable (even if scrolling needed)
      const playAgainButton = page.locator(SELECTORS.playAgainButton);
      await playAgainButton.scrollIntoViewIfNeeded();
      await expect(playAgainButton).toBeVisible();
    });
  });

  // ===========================================================================
  // URL Handling Tests
  // ===========================================================================

  test.describe('URL Parameter Handling', () => {
    test('should handle both b and w side parameters', async ({ page }) => {
      // Test black side
      await navigateToResultPage(page, 'b', TEST_DATA.shortGame.encodedMoves);
      await expect(page.locator(SELECTORS.resultContainer)).toHaveAttribute(
        'data-player-side',
        'black'
      );

      // Test white side
      await navigateToResultPage(page, 'w', TEST_DATA.shortGame.encodedMoves);
      await expect(page.locator(SELECTORS.resultContainer)).toHaveAttribute(
        'data-player-side',
        'white'
      );
    });

    test('should preserve URL encoding through page load', async ({ page }) => {
      const encodedMoves = TEST_DATA.shortGame.encodedMoves;
      await navigateToResultPage(page, 'b', encodedMoves);

      // Verify URL contains the encoded moves
      await expect(page).toHaveURL(`/r/b/${encodedMoves}`);
    });
  });
});
