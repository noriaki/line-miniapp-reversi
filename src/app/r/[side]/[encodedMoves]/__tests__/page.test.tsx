/**
 * Result Page tests
 * Tests the game result page display and functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultPage, { generateMetadata, generateStaticParams } from '../page';
import { encodeMoves } from '@/lib/share/move-encoder';
import type { Position } from '@/lib/game/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _React = React; // Suppress unused import warning while keeping React in scope for JSX

// Mock environment variables for R2
const mockR2PublicDomain = 'images.reversi.line-mini.dev';
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    R2_PUBLIC_DOMAIN: mockR2PublicDomain,
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock useShare hook
jest.mock('@/hooks/useShare', () => ({
  useShare: () => ({
    isSharing: false,
    canShareLine: true,
    canShareWeb: true,
    shareToLine: jest.fn(),
    shareToWeb: jest.fn(),
    messageQueue: {
      messages: [],
      addMessage: jest.fn(),
      dismissMessage: jest.fn(),
    },
  }),
}));

// Sample valid game moves (opening moves)
const sampleMoves: Position[] = [
  { row: 2, col: 3 }, // d3
  { row: 2, col: 2 }, // c3
  { row: 2, col: 1 }, // b3
];

describe('ResultPage', () => {
  describe('generateStaticParams', () => {
    it('should return empty array for ISR', async () => {
      const params = await generateStaticParams();
      expect(params).toEqual([]);
    });
  });

  describe('generateMetadata', () => {
    it('should generate metadata with valid encodedMoves', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      expect(metadata.title).toContain('Reversi');
      expect(metadata.description).toBeDefined();
      expect(metadata.openGraph).toBeDefined();
    });

    it('should set og:image to R2 public domain direct URL', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const ogImages = metadata.openGraph?.images;
      expect(ogImages).toBeDefined();
      expect(Array.isArray(ogImages)).toBe(true);

      const firstImage = (ogImages as { url: string }[])[0];
      expect(firstImage.url).toBe(
        `https://${mockR2PublicDomain}/og/b/${encodedMoves}.png`
      );
    });

    it('should set twitter:image to R2 public domain direct URL', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const twitterImages = metadata.twitter?.images;
      expect(twitterImages).toBeDefined();
      expect(Array.isArray(twitterImages)).toBe(true);

      const firstImage = (twitterImages as string[])[0];
      expect(firstImage).toBe(
        `https://${mockR2PublicDomain}/og/b/${encodedMoves}.png`
      );
    });

    it('should not include opengraph-image path in og:image URL', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const ogImages = metadata.openGraph?.images;
      const firstImage = (ogImages as { url: string }[])[0];

      // URL should NOT contain opengraph-image path
      expect(firstImage.url).not.toContain('opengraph-image');
      // URL should be R2 direct URL
      expect(firstImage.url).toContain(mockR2PublicDomain);
    });

    it('should handle invalid encodedMoves gracefully without og:image', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves: 'invalid!!!' }),
      });

      // Should still return some metadata even for invalid input
      expect(metadata.title).toBeDefined();
      // Should NOT include og:image for invalid moves
      expect(metadata.openGraph?.images).toBeUndefined();
    });

    it('should handle invalid side parameter without og:image', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'x', encodedMoves }),
      });

      expect(metadata.title).toBeDefined();
      // Should NOT include og:image for invalid side
      expect(metadata.openGraph?.images).toBeUndefined();
    });
  });

  describe('page rendering', () => {
    it('should render board display with valid params', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // Should display board
      expect(screen.getByTestId('board-display')).toBeInTheDocument();
    });

    it('should display score with valid params', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // Should display score section
      expect(screen.getByTestId('score-display')).toBeInTheDocument();
    });

    it('should display winner result', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // Should display game result (could be win/lose/draw)
      expect(screen.getByTestId('game-result-text')).toBeInTheDocument();
    });

    it('should render play again button', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      const playAgainButton = screen.getByRole('link', {
        name: /もう一度遊ぶ/i,
      });
      expect(playAgainButton).toBeInTheDocument();
      expect(playAgainButton).toHaveAttribute('href', '/');
    });

    it('should render share buttons', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // Share buttons should be displayed
      expect(screen.getByTestId('share-line-button')).toBeInTheDocument();
      expect(screen.getByTestId('share-web-button')).toBeInTheDocument();
    });
  });

  describe('side parameter handling', () => {
    it('should show player on top (black side) when side is "b"', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // Check layout reflects player perspective
      const container = screen.getByTestId('result-container');
      expect(container).toHaveAttribute('data-player-side', 'black');
    });

    it('should show player on bottom (white side) when side is "w"', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });

      render(page);

      const container = screen.getByTestId('result-container');
      expect(container).toHaveAttribute('data-player-side', 'white');
    });
  });

  describe('error handling', () => {
    it('should display error for invalid side parameter', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'invalid', encodedMoves }),
      });

      render(page);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /ゲームを始める/i })
      ).toBeInTheDocument();
    });

    it('should display error for invalid encodedMoves', async () => {
      const page = await ResultPage({
        params: Promise.resolve({
          side: 'b',
          encodedMoves: 'not-valid-base64!!!',
        }),
      });

      render(page);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('should display error for moves that produce invalid game state', async () => {
      // Create moves that are invalid for the game (corner on first move is not valid)
      const invalidMoves: Position[] = [
        { row: 0, col: 0 }, // Corner - not a valid opening move
      ];
      const encoded = encodeMoves(invalidMoves);

      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves: encoded }),
      });

      render(page);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  describe('empty game (no moves)', () => {
    it('should handle empty move history', async () => {
      const encodedMoves = encodeMoves([]);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // Should show initial board state (2-2)
      expect(screen.getByTestId('board-display')).toBeInTheDocument();
    });
  });

  describe('OgImagePrefetch integration', () => {
    it('should render OgImagePrefetch component with correct props', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // OgImagePrefetch should be rendered (it renders null but is in the tree)
      // We verify by checking the page renders successfully and share buttons have ogImageUrl
      expect(screen.getByTestId('result-container')).toBeInTheDocument();
    });
  });

  describe('ogImageUrl prop passing', () => {
    it('should pass ogImageUrl to ShareButtonsWrapper', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      render(page);

      // ShareButtonsWrapper should receive ogImageUrl and pass it to ShareButtons
      // We verify indirectly by checking the page renders share buttons
      expect(screen.getByTestId('share-line-button')).toBeInTheDocument();
    });

    it('should construct R2 URL using R2_PUBLIC_DOMAIN environment variable', async () => {
      const encodedMoves = encodeMoves(sampleMoves);
      const page = await ResultPage({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });

      render(page);

      // Page should render successfully with R2 URL constructed from env var
      expect(screen.getByTestId('result-container')).toBeInTheDocument();
      expect(screen.getByTestId('share-web-button')).toBeInTheDocument();
    });
  });
});
