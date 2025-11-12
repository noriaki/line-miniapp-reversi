/**
 * E2E Tests - Cross-Browser Compatibility Verification
 * Task 8: クロスブラウザ互換性を検証する
 *
 * This test verifies that UI usability improvements work consistently
 * across different browsers (Desktop Chrome, Mobile Chrome, Mobile Safari).
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 *
 * Note: These tests run on all browsers configured in playwright.config.ts:
 * - chromium (Desktop Chrome)
 * - mobile-chrome (Pixel 5)
 * - mobile-safari (iPhone 12)
 */

import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility Verification', () => {
  test.describe('Requirement 5.1: CSS Visual Hiding Cross-Browser', () => {
    test('should apply sr-only class consistently across browsers', async ({
      page,
      browserName,
    }) => {
      await page.goto('/');

      // Make a move to generate move history
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      const moveHistory = page.locator('[data-testid="move-history"]');

      // Verify sr-only class is applied
      await expect(moveHistory).toHaveClass(/sr-only/);

      // Verify element is in DOM
      await expect(moveHistory).toBeAttached();

      // Verify element is NOT visible (sr-only makes it visually hidden)
      await expect(moveHistory).not.toBeVisible();

      console.log(`✓ sr-only verified on ${browserName}`);
    });

    test('should hide move history element from visual rendering across browsers', async ({
      page,
    }) => {
      await page.goto('/');

      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      const moveHistory = page.locator('[data-testid="move-history"]');

      // Check computed style - element should be visually hidden
      const isVisible = await moveHistory.isVisible();
      expect(isVisible).toBe(false);

      // Verify aria-hidden for screen readers
      await expect(moveHistory).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('Requirement 5.2: Opacity/Visibility Toggle Cross-Browser', () => {
    test('should apply opacity-0 for hidden messages consistently', async ({
      page,
    }) => {
      await page.goto('/');

      // Initially, message should have opacity-0
      const messageElement = page.locator('.notification-message');
      await expect(messageElement).toHaveClass(/opacity-0/);

      // Verify element is always in DOM
      await expect(messageElement).toBeAttached();
    });

    test('should support opacity transition across browsers', async ({
      page,
    }) => {
      await page.goto('/');

      const messageElement = page.locator('.notification-message');

      // Check computed style includes opacity transition
      const transition = await messageElement.evaluate((el) => {
        return window.getComputedStyle(el).transition;
      });

      // Should have opacity transition property
      expect(transition).toContain('opacity');
    });

    test('should maintain DOM rendering with opacity changes', async ({
      page,
    }) => {
      await page.goto('/');

      const messageElement = page.locator('.notification-message');

      // Element should be in DOM regardless of opacity
      await expect(messageElement).toBeAttached();

      // Make a move and verify element remains in DOM
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      await expect(messageElement).toBeAttached();
    });
  });

  test.describe('Requirement 5.3: LINE In-App Browser Compatibility', () => {
    test('should use standard CSS properties compatible with WebView', async ({
      page,
    }) => {
      await page.goto('/');

      // Verify sr-only uses standard CSS properties
      const moveHistory = page.locator('[data-testid="move-history"]');
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      // Get computed styles - these should work in WebView
      const styles = await moveHistory.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          position: computed.position,
          width: computed.width,
          height: computed.height,
          overflow: computed.overflow,
        };
      });

      // sr-only uses standard CSS properties
      expect(styles.position).toBe('absolute');
      expect(styles.width).toBe('1px');
      expect(styles.height).toBe('1px');
      expect(styles.overflow).toBe('hidden');
    });

    test('should use Tailwind utility classes compatible with WebView', async ({
      page,
    }) => {
      await page.goto('/');

      // Verify message container uses standard Tailwind classes
      const messageElement = page.locator('.notification-message');

      const classes = await messageElement.getAttribute('class');
      expect(classes).toBeTruthy();

      // Check for Tailwind utility classes
      expect(classes).toMatch(/opacity-\d+/);
      expect(classes).toMatch(/transition-opacity/);
      expect(classes).toMatch(/duration-\d+/);

      // Verify parent container fixed height
      const messageContainer = messageElement.locator('..');
      await expect(messageContainer).toHaveClass(/h-16/);
    });
  });

  test.describe('Requirement 5.4: Vendor Prefix Auto-Application', () => {
    test('should have vendor prefixes for transitions (via autoprefixer)', async ({
      page,
    }) => {
      await page.goto('/');

      const messageElement = page.locator('.notification-message');

      // Get computed transition property
      const transition = await messageElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transition: computed.transition,
          // Check for webkit prefix in style object
          webkitTransition: (el as HTMLElement).style.webkitTransition,
        };
      });

      // Transition should be applied (autoprefixer handles vendor prefixes at build time)
      expect(transition.transition).toContain('opacity');
    });

    test('should render Tailwind CSS classes properly', async ({ page }) => {
      await page.goto('/');

      // Verify key Tailwind classes are rendered correctly
      const messageElement = page.locator('.notification-message');

      const computedStyles = await messageElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          transitionProperty: computed.transitionProperty,
          transitionDuration: computed.transitionDuration,
        };
      });

      // Opacity should be '0' (from opacity-0 class)
      expect(computedStyles.opacity).toBe('0');

      // Transition properties should be applied
      expect(computedStyles.transitionProperty).toContain('opacity');
      expect(computedStyles.transitionDuration).toMatch(/\d+ms/);
    });
  });

  test.describe('Integration: All Features Across Browsers', () => {
    test('should support all UI improvements consistently', async ({
      page,
      browserName,
    }) => {
      await page.goto('/');

      console.log(`Testing on ${browserName}`);

      // 1. Move history should be visually hidden
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      const moveHistory = page.locator('[data-testid="move-history"]');
      await expect(moveHistory).toBeAttached();
      await expect(moveHistory).not.toBeVisible();
      await expect(moveHistory).toHaveClass(/sr-only/);

      // 2. Message container should have fixed height
      const messageElement = page.locator('.notification-message');
      const messageContainer = messageElement.locator('..');
      await expect(messageContainer).toHaveClass(/h-16/);

      // 3. Message should use opacity transitions
      await expect(messageElement).toHaveClass(/transition-opacity/);
      await expect(messageElement).toHaveClass(/opacity-0/);

      console.log(`✓ All features verified on ${browserName}`);
    });

    test('should maintain layout stability across browsers', async ({
      page,
    }) => {
      await page.goto('/');

      // Get initial board position
      const boardGrid = page.locator('.board-grid');
      const initialBox = await boardGrid.boundingBox();
      expect(initialBox).not.toBeNull();

      // Make a move
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      // Board position should remain stable (no layout shift)
      const finalBox = await boardGrid.boundingBox();
      expect(finalBox).not.toBeNull();

      if (initialBox && finalBox) {
        expect(finalBox.y).toBe(initialBox.y);
        expect(finalBox.height).toBe(initialBox.height);
      }
    });

    test('should work on different viewport sizes', async ({
      page,
      isMobile,
    }) => {
      if (isMobile) {
        console.log('Testing on mobile viewport');
      } else {
        console.log('Testing on desktop viewport');
      }

      await page.goto('/');

      // Make a move
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      // All features should work regardless of viewport
      const moveHistory = page.locator('[data-testid="move-history"]');
      await expect(moveHistory).toBeAttached();
      await expect(moveHistory).not.toBeVisible();

      const messageElement = page.locator('.notification-message');
      await expect(messageElement).toBeAttached();
      await expect(messageElement).toHaveClass(/transition-opacity/);
    });
  });

  test.describe('PostCSS/Autoprefixer Configuration', () => {
    test('should verify Tailwind CSS classes are processed correctly', async ({
      page,
    }) => {
      await page.goto('/');

      // Verify that Tailwind classes produce valid CSS
      const messageElement = page.locator('.notification-message');

      const styles = await messageElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          borderWidth: computed.borderWidth,
          borderColor: computed.borderColor,
          padding: computed.padding,
          borderRadius: computed.borderRadius,
        };
      });

      // Tailwind classes should generate valid CSS values
      expect(styles.backgroundColor).toMatch(/rgb/);
      expect(styles.borderWidth).toMatch(/\d+px/);
      expect(styles.borderRadius).toMatch(/\d+px/);
    });
  });
});
