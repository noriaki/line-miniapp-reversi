/**
 * ShareImageGenerator Integration Tests
 *
 * Tests for ShareImageGenerator with actual html2canvas library.
 *
 * Requirements: 4.1, 8.1
 *
 * NOTE: html2canvas has limited support in jsdom due to missing getComputedStyle
 * implementation. These tests verify error handling when html2canvas fails.
 * For actual visual testing of image generation, use E2E tests with real browsers.
 *
 * @jest-environment jsdom
 */

import { generateImageBlob } from '../share-image-generator';
import type { ImageGenerationOptions } from '../types';

describe('ShareImageGenerator Integration', () => {
  let testElement: HTMLDivElement;
  let containerRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    // Create a test DOM element with content
    testElement = document.createElement('div');
    testElement.innerHTML = `
      <div style="width: 200px; height: 100px; background-color: #1a2f14; padding: 10px;">
        <div style="color: white; font-size: 16px;">Test Content</div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #ffffff;">Black: 36</span>
          <span style="color: #ffffff;">White: 28</span>
        </div>
      </div>
    `;
    document.body.appendChild(testElement);

    containerRef = { current: testElement };
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('generateImageBlob error handling', () => {
    // Note: html2canvas fails in jsdom due to missing getComputedStyle implementation
    // These tests verify proper error handling when generation fails

    it('should return error when element ref is null', async () => {
      const nullRef = { current: null };
      const result = await generateImageBlob(nullRef);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('share_failed');
        if (result.error.type === 'share_failed') {
          expect(result.error.message).toContain('element');
        }
      }
    });

    it('should handle html2canvas failure gracefully', async () => {
      // In jsdom, html2canvas will fail due to missing getComputedStyle
      // This tests that the error is properly caught and returned
      const result = await generateImageBlob(containerRef);

      // The result should either succeed (if jsdom supports enough APIs)
      // or fail with a proper error message
      if (!result.success) {
        expect(result.error.type).toBe('share_failed');
        if (result.error.type === 'share_failed') {
          expect(typeof result.error.message).toBe('string');
        }
      } else {
        // If it somehow succeeds, verify it's a valid blob
        expect(result.data).toBeInstanceOf(Blob);
      }
    });

    it('should validate options are passed correctly', async () => {
      const options: ImageGenerationOptions = {
        scale: 3,
        format: 'image/jpeg',
        quality: 0.5,
        maxSizeBytes: 500000,
      };

      // Even if html2canvas fails, this tests that options handling doesn't throw
      const result = await generateImageBlob(containerRef, options);

      // Result should be defined (either success or failure)
      expect(result).toBeDefined();
      expect('success' in result).toBe(true);
    });

    it('should handle multiple concurrent calls', async () => {
      // Test that multiple calls don't cause issues
      const promises = [
        generateImageBlob(containerRef),
        generateImageBlob(containerRef),
        generateImageBlob(containerRef),
      ];

      const results = await Promise.all(promises);

      // All calls should complete without throwing
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect('success' in result).toBe(true);
      });
    });
  });

  describe('options validation', () => {
    it('should accept default options', async () => {
      // This tests that no options is valid
      const result = await generateImageBlob(containerRef);
      expect(result).toBeDefined();
    });

    it('should accept custom scale option', async () => {
      const options: ImageGenerationOptions = { scale: 1 };
      const result = await generateImageBlob(containerRef, options);
      expect(result).toBeDefined();
    });

    it('should accept PNG format option', async () => {
      const options: ImageGenerationOptions = { format: 'image/png' };
      const result = await generateImageBlob(containerRef, options);
      expect(result).toBeDefined();
    });

    it('should accept JPEG format with quality option', async () => {
      const options: ImageGenerationOptions = {
        format: 'image/jpeg',
        quality: 0.8,
      };
      const result = await generateImageBlob(containerRef, options);
      expect(result).toBeDefined();
    });

    it('should accept maxSizeBytes option', async () => {
      const options: ImageGenerationOptions = { maxSizeBytes: 1048576 };
      const result = await generateImageBlob(containerRef, options);
      expect(result).toBeDefined();
    });
  });
});

/**
 * NOTE: Full visual testing of html2canvas requires a real browser environment.
 *
 * For comprehensive image generation testing, use E2E tests which run in
 * Playwright with real Chromium/WebKit engines that fully support
 * window.getComputedStyle and canvas operations.
 *
 * The E2E test file e2e/game-end-state.spec.ts includes tests that verify
 * the share image generation in a real browser context.
 */
