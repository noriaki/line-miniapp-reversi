/**
 * E2E Game State Injection Helper
 *
 * Provides utilities for injecting game state into E2E tests via sessionStorage.
 * Enables testing of game end scenarios without playing through entire games.
 *
 * Requirements: 8.1
 */

import type { Page } from '@playwright/test';
import type { GameStateSnapshot } from './test-fixtures';
import { E2E_GAME_STATE_KEY } from './test-fixtures';

/**
 * Inject a game end state into sessionStorage before page load
 *
 * This function uses page.addInitScript() to set sessionStorage before any
 * application code runs, enabling the app to detect and restore the injected state.
 *
 * IMPORTANT: This only works when NODE_ENV !== 'production'.
 * The application must have E2E state injection support implemented.
 *
 * @param page - Playwright Page object
 * @param state - Game state snapshot to inject
 *
 * @example
 * ```typescript
 * test('should display share buttons when game ends', async ({ page }) => {
 *   await injectGameEndState(page, TEST_GAME_STATES.blackWins);
 *   await page.goto('/');
 *   await expect(page.getByRole('button', { name: 'LINEでシェア' })).toBeVisible();
 * });
 * ```
 */
export async function injectGameEndState(
  page: Page,
  state: GameStateSnapshot
): Promise<void> {
  // Serialize the state for injection
  const serializedState = JSON.stringify(state);

  // Add init script that runs before page load
  await page.addInitScript(
    ([storageKey, stateJson]) => {
      sessionStorage.setItem(storageKey, stateJson);
    },
    [E2E_GAME_STATE_KEY, serializedState] as const
  );
}

/**
 * Clear any injected game state from sessionStorage
 *
 * @param page - Playwright Page object
 */
export async function clearInjectedGameState(page: Page): Promise<void> {
  await page.evaluate((storageKey) => {
    sessionStorage.removeItem(storageKey);
  }, E2E_GAME_STATE_KEY);
}

/**
 * Check if E2E game state injection is supported by the application
 *
 * This checks if the application has the E2E state injection feature enabled
 * (only available in development/test builds, not production).
 *
 * @param page - Playwright Page object
 * @returns true if E2E state injection is supported
 */
export async function isE2EStateInjectionSupported(
  page: Page
): Promise<boolean> {
  return page.evaluate(() => {
    // Check if we're not in production mode
    // The app sets window.__E2E_STATE_INJECTION_ENABLED__ when the feature is available
    return (
      typeof window !== 'undefined' &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__E2E_STATE_INJECTION_ENABLED__ === true
    );
  });
}

/**
 * Mock Web Share API availability
 *
 * Configures the page to report Web Share API as available or unavailable.
 * Useful for testing conditional UI rendering based on API availability.
 *
 * @param page - Playwright Page object
 * @param isAvailable - Whether Web Share API should be available
 */
export async function mockWebShareAPI(
  page: Page,
  isAvailable: boolean
): Promise<void> {
  await page.addInitScript((available) => {
    if (!available) {
      // Remove Web Share API
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'canShare', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    } else {
      // Mock Web Share API as available
      Object.defineProperty(navigator, 'share', {
        value: async () => {},
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'canShare', {
        value: () => true,
        writable: true,
        configurable: true,
      });
    }
  }, isAvailable);
}
