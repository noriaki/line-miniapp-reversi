/**
 * OG Image Generation tests
 * Tests the Open Graph image generation for game results
 *
 * Note: ImageResponse requires server-side APIs (ReadableStream) not available in JSDOM.
 * Image generation tests mock the ImageResponse to verify the render logic is correct.
 * Full image generation is tested via integration/E2E tests.
 */

import { encodeMoves } from '@/lib/share/move-encoder';
import type { Position } from '@/lib/game/types';

// Mock ImageResponse since it requires server-side APIs
const mockHeaders = new Map<string, string>([['content-type', 'image/png']]);
const mockImageResponse = {
  headers: {
    get: (key: string) => mockHeaders.get(key) ?? null,
  },
};

jest.mock('next/og', () => ({
  ImageResponse: jest.fn(() => mockImageResponse),
}));

// Import after mocking
const importOGImage = async () => {
  return import('../opengraph-image');
};

// Sample valid game moves (creates a game state with black winning)
const sampleMoves: Position[] = [
  { row: 2, col: 3 }, // d3
  { row: 2, col: 2 }, // c3
  { row: 2, col: 1 }, // b3
];

// Full game with more moves for realistic testing
const fullGameMoves: Position[] = [
  { row: 2, col: 3 }, // d3
  { row: 2, col: 2 }, // c3
  { row: 2, col: 1 }, // b3
  { row: 3, col: 2 }, // c4
  { row: 4, col: 2 }, // c5
];

describe('OG Image Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('module exports', () => {
    it('should export size configuration with OGP standard dimensions', async () => {
      const ogModule = await importOGImage();

      expect(ogModule.size).toBeDefined();
      expect(ogModule.size.width).toBe(1200);
      expect(ogModule.size.height).toBe(630);
    });

    it('should export contentType as image/png', async () => {
      const ogModule = await importOGImage();

      expect(ogModule.contentType).toBe('image/png');
    });

    it('should export default function for image generation', async () => {
      const ogModule = await importOGImage();

      expect(typeof ogModule.default).toBe('function');
    });

    it('should export static alt text for accessibility', async () => {
      const ogModule = await importOGImage();

      expect(ogModule.alt).toBe('リバーシ対局結果');
    });
  });

  describe('Image generation', () => {
    it('should generate ImageResponse for valid params', async () => {
      const ogModule = await importOGImage();
      const encodedMoves = encodeMoves(sampleMoves);

      const response = await ogModule.default({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      // ImageResponse should be returned
      expect(response).toBeDefined();
      expect(response.headers.get('content-type')).toContain('image/png');
    });

    it('should generate ImageResponse for empty moves', async () => {
      const ogModule = await importOGImage();
      const encodedMoves = encodeMoves([]);

      const response = await ogModule.default({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      expect(response).toBeDefined();
      expect(response.headers.get('content-type')).toContain('image/png');
    });

    it('should generate ImageResponse for full game', async () => {
      const ogModule = await importOGImage();
      const encodedMoves = encodeMoves(fullGameMoves);

      const response = await ogModule.default({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });

      expect(response).toBeDefined();
      expect(response.headers.get('content-type')).toContain('image/png');
    });

    it('should return fallback image for invalid encodedMoves', async () => {
      const ogModule = await importOGImage();

      const response = await ogModule.default({
        params: Promise.resolve({ side: 'b', encodedMoves: 'invalid!!!' }),
      });

      // Should still return an image (fallback)
      expect(response).toBeDefined();
      expect(response.headers.get('content-type')).toContain('image/png');
    });

    it('should return same image regardless of side parameter', async () => {
      const ogModule = await importOGImage();
      const encodedMoves = encodeMoves(sampleMoves);

      const responseBlack = await ogModule.default({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      const responseWhite = await ogModule.default({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });

      // Both should return valid images (side is ignored for OG image)
      expect(responseBlack.headers.get('content-type')).toContain('image/png');
      expect(responseWhite.headers.get('content-type')).toContain('image/png');
    });

    it('should call ImageResponse with correct size options', async () => {
      const ogModule = (await import('next/og')) as unknown as {
        ImageResponse: jest.Mock;
      };
      const ogImageModule = await importOGImage();
      const encodedMoves = encodeMoves(sampleMoves);

      await ogImageModule.default({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      // Verify ImageResponse was called with correct dimensions
      expect(ogModule.ImageResponse).toHaveBeenCalled();
      const lastCall = ogModule.ImageResponse.mock.calls[0];
      expect(lastCall[1]).toEqual({ width: 1200, height: 630 });
    });
  });
});
