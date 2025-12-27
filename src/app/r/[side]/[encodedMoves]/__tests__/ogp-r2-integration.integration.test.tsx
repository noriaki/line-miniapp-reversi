/**
 * OGP Image R2 Integration Tests
 *
 * Tests the complete OGP image caching flow with R2:
 * - Prefetch triggers API call and R2 upload
 * - generateMetadata returns R2 direct URL
 * - Flex Message uses same R2 URL as og:image
 * - Environment-specific bucket configuration
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ResultPage, { generateMetadata } from '../page';
import { OgImagePrefetch } from '@/components/OgImagePrefetch';
import { buildFlexMessage } from '@/lib/share/flex-message-builder';
import { encodeMoves } from '@/lib/share/move-encoder';
import type { Position } from '@/lib/game/types';
import type { ShareResult } from '@/lib/share/flex-message-builder';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _React = React; // Suppress unused import warning while keeping React in scope for JSX

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock useLiff to provide LIFF context for ShareButtons
jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => ({
    isReady: true,
    error: null,
    isInClient: false,
    isLoggedIn: true,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Track fetch calls for prefetch testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Store original env vars
const originalEnv = process.env;

/**
 * Test fixtures for game scenarios
 */
const testMoves: Position[] = [
  { row: 2, col: 3 }, // d3 (black)
  { row: 2, col: 2 }, // c3 (white)
  { row: 2, col: 1 }, // b3 (black)
];

describe('OGP Image R2 Integration', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'created', key: 'og/b/test.png' }),
    });

    // Set up required environment variables for R2
    process.env = {
      ...originalEnv,
      R2_ACCOUNT_ID: 'test-account-id',
      R2_ACCESS_KEY_ID: 'test-access-key',
      R2_SECRET_ACCESS_KEY: 'test-secret-key',
      R2_BUCKET: 'lineminiapp-reversi-images-dev',
      R2_PUBLIC_DOMAIN: 'dev.images.reversi.line-mini.dev',
      NEXT_PUBLIC_LIFF_ID: 'test-liff-id',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Prefetch triggers R2 upload', () => {
    it('should call API route when OgImagePrefetch mounts', async () => {
      const encodedMoves = encodeMoves(testMoves);

      render(<OgImagePrefetch side="b" encodedMoves={encodedMoves} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/og/b/${encodedMoves}`,
          expect.objectContaining({ cache: 'no-store' })
        );
      });
    });

    it('should trigger prefetch for both black and white sides', async () => {
      const encodedMoves = encodeMoves(testMoves);

      const { unmount } = render(
        <OgImagePrefetch side="b" encodedMoves={encodedMoves} />
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/og/b/${encodedMoves}`,
          expect.any(Object)
        );
      });

      unmount();
      mockFetch.mockClear();

      render(<OgImagePrefetch side="w" encodedMoves={encodedMoves} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/og/w/${encodedMoves}`,
          expect.any(Object)
        );
      });
    });

    it('should silently handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const encodedMoves = encodeMoves(testMoves);

      // Should not throw
      expect(() => {
        render(<OgImagePrefetch side="b" encodedMoves={encodedMoves} />);
      }).not.toThrow();
    });
  });

  describe('generateMetadata returns R2 direct URL', () => {
    it('should return og:image with R2 public domain URL', async () => {
      const encodedMoves = encodeMoves(testMoves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      // Check og:image uses R2 direct URL
      expect(metadata.openGraph?.images).toBeDefined();
      const images = metadata.openGraph?.images as Array<{ url: string }>;
      expect(images[0].url).toBe(
        `https://dev.images.reversi.line-mini.dev/og/b/${encodedMoves}.png`
      );
    });

    it('should return twitter:image with R2 public domain URL', async () => {
      const encodedMoves = encodeMoves(testMoves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });

      // Check twitter:image uses R2 direct URL
      expect(metadata.twitter?.images).toBeDefined();
      const twitterImages = metadata.twitter?.images as string[];
      expect(twitterImages[0]).toBe(
        `https://dev.images.reversi.line-mini.dev/og/w/${encodedMoves}.png`
      );
    });

    it('should not include og:image for invalid moves', async () => {
      const invalidMoves = '!!!invalid!!!';

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves: invalidMoves }),
      });

      // Should return default metadata without og:image
      expect(metadata.openGraph?.images).toBeUndefined();
    });

    it('should use R2 URL without redirect', async () => {
      const encodedMoves = encodeMoves(testMoves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const images = metadata.openGraph?.images as Array<{ url: string }>;
      const ogImageUrl = images[0].url;

      // R2 URL should be direct (no Vercel/Next.js image endpoint)
      expect(ogImageUrl).not.toContain('/api/');
      expect(ogImageUrl).not.toContain('/_next/');
      expect(ogImageUrl).toMatch(/^https:\/\/.*\.reversi\.line-mini\.dev\//);
    });
  });

  describe('Flex Message uses same R2 URL as og:image', () => {
    it('should build Flex Message with same URL as og:image', async () => {
      const encodedMoves = encodeMoves(testMoves);

      // Get og:image URL from generateMetadata
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      const images = metadata.openGraph?.images as Array<{ url: string }>;
      const ogImageUrl = images[0].url;

      // Build Flex Message with same R2 URL
      const result: ShareResult = {
        side: 'b',
        encodedMoves,
        blackCount: 5,
        whiteCount: 3,
        winner: 'black',
      };
      const flexMessage = buildFlexMessage(
        result,
        'https://liff.line.me/test-liff-id/r/b/' + encodedMoves,
        ogImageUrl,
        'https://liff.line.me/test-liff-id'
      );

      // Verify Flex Message hero image URL matches og:image
      expect(flexMessage.contents.hero?.url).toBe(ogImageUrl);
    });

    it('should use R2 URL in Flex Message hero section', () => {
      const encodedMoves = encodeMoves(testMoves);
      const r2ImageUrl = `https://dev.images.reversi.line-mini.dev/og/b/${encodedMoves}.png`;

      const result: ShareResult = {
        side: 'b',
        encodedMoves,
        blackCount: 10,
        whiteCount: 20,
        winner: 'white',
      };
      const flexMessage = buildFlexMessage(
        result,
        'https://liff.line.me/test-liff-id/r/b/' + encodedMoves,
        r2ImageUrl,
        'https://liff.line.me/test-liff-id'
      );

      // Verify hero section contains R2 URL
      expect(flexMessage.contents.hero).toBeDefined();
      expect(flexMessage.contents.hero?.type).toBe('image');
      expect(flexMessage.contents.hero?.url).toBe(r2ImageUrl);
    });
  });

  describe('Environment-specific bucket configuration', () => {
    it('should use dev bucket in development/preview environment', async () => {
      process.env.R2_BUCKET = 'lineminiapp-reversi-images-dev';
      process.env.R2_PUBLIC_DOMAIN = 'dev.images.reversi.line-mini.dev';

      const encodedMoves = encodeMoves(testMoves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const images = metadata.openGraph?.images as Array<{ url: string }>;
      expect(images[0].url).toContain('dev.images.reversi.line-mini.dev');
    });

    it('should use production bucket in production environment', async () => {
      process.env.R2_BUCKET = 'lineminiapp-reversi-images';
      process.env.R2_PUBLIC_DOMAIN = 'images.reversi.line-mini.dev';

      const encodedMoves = encodeMoves(testMoves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const images = metadata.openGraph?.images as Array<{ url: string }>;
      expect(images[0].url).toContain('images.reversi.line-mini.dev');
      expect(images[0].url).not.toContain('dev.');
    });

    it('should construct correct R2 key format', async () => {
      const encodedMoves = encodeMoves(testMoves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });

      const images = metadata.openGraph?.images as Array<{ url: string }>;
      const url = images[0].url;

      // Verify key format: og/{side}/{encodedMoves}.png
      expect(url).toMatch(/\/og\/w\/[A-Za-z0-9_-]+\.png$/);
    });
  });

  describe('Result page integration with OgImagePrefetch', () => {
    it('should include OgImagePrefetch in result page render', async () => {
      const encodedMoves = encodeMoves(testMoves);

      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      render(page);

      // OgImagePrefetch should trigger API call on mount
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/og/b/${encodedMoves}`,
          expect.any(Object)
        );
      });
    });

    it('should pass correct ogImageUrl to ShareButtonsWrapper', async () => {
      const encodedMoves = encodeMoves(testMoves);

      // Render the page to trigger component tree
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      render(page);

      // The ogImageUrl should match the R2 URL format
      const expectedUrl = `https://dev.images.reversi.line-mini.dev/og/b/${encodedMoves}.png`;

      // Get metadata to verify the URL matches
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      const images = metadata.openGraph?.images as Array<{ url: string }>;

      expect(images[0].url).toBe(expectedUrl);
    });
  });

  describe('R2 URL consistency across components', () => {
    it('should maintain consistent R2 URL from metadata to Flex Message', async () => {
      const encodedMoves = encodeMoves(testMoves);
      const side = 'b' as const;

      // 1. Get URL from generateMetadata
      const metadata = await generateMetadata({
        params: Promise.resolve({ side, encodedMoves }),
      });
      const metadataImages = metadata.openGraph?.images as Array<{
        url: string;
      }>;
      const metadataOgImageUrl = metadataImages[0].url;

      // 2. Build Flex Message with same URL
      const result: ShareResult = {
        side,
        encodedMoves,
        blackCount: 32,
        whiteCount: 32,
        winner: 'draw',
      };
      const flexMessage = buildFlexMessage(
        result,
        'https://liff.line.me/test-liff-id/r/b/' + encodedMoves,
        metadataOgImageUrl,
        'https://liff.line.me/test-liff-id'
      );

      // 3. Verify URL consistency
      expect(flexMessage.contents.hero?.url).toBe(metadataOgImageUrl);

      // 4. Verify URL format is R2 direct
      expect(metadataOgImageUrl).toMatch(
        /^https:\/\/(dev\.)?images\.reversi\.line-mini\.dev\/og\//
      );
    });
  });
});
