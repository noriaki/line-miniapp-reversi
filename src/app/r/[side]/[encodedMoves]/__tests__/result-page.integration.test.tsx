/**
 * Integration tests for Result Page
 * Tests URL parameter handling, board restoration, and component integration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultPage, { generateMetadata, generateStaticParams } from '../page';
import {
  encodeMoves,
  replayMoves,
  determineWinner,
} from '@/lib/share/move-encoder';
import type { Position } from '@/lib/game/types';

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

/**
 * Test fixtures for various game scenarios
 * Note: These are valid Reversi move sequences that follow game rules
 */
const testScenarios = {
  // Standard opening: d3, c3, b3 (valid sequence)
  shortGame: [
    { row: 2, col: 3 }, // d3 (black)
    { row: 2, col: 2 }, // c3 (white)
    { row: 2, col: 1 }, // b3 (black)
  ] as Position[],

  // Longer valid sequence (all moves verified to be legal)
  mediumGame: [
    { row: 2, col: 3 }, // d3 (black) - flips d4
    { row: 2, col: 2 }, // c3 (white) - flips d3
    { row: 3, col: 2 }, // c4 (black) - flips d4
    { row: 4, col: 2 }, // c5 (white) - flips c4
    { row: 5, col: 3 }, // d6 (black) - flips d5
    { row: 2, col: 4 }, // e3 (white) - flips d3, e4
  ] as Position[],

  // Empty game (initial state)
  emptyGame: [] as Position[],
};

describe('Result Page Integration', () => {
  describe('URL parameter to board restoration flow', () => {
    it('should correctly restore board state from encoded URL', async () => {
      const moves = testScenarios.shortGame;
      const encodedMoves = encodeMoves(moves);

      // Verify the encoder produces valid output
      expect(encodedMoves).toBeTruthy();
      expect(typeof encodedMoves).toBe('string');

      // Render the page with encoded moves
      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      render(page);

      // Calculate expected state
      const replayResult = replayMoves(moves);
      expect(replayResult.success).toBe(true);

      if (replayResult.success) {
        // Verify board is displayed
        const boardDisplay = screen.getByTestId('board-display');
        expect(boardDisplay).toBeInTheDocument();

        // Verify score matches expected values
        const scoreDisplay = screen.getByTestId('score-display');
        expect(scoreDisplay).toBeInTheDocument();

        // The score should reflect the replayed game state
        expect(scoreDisplay.textContent).toContain(
          String(replayResult.blackCount)
        );
        expect(scoreDisplay.textContent).toContain(
          String(replayResult.whiteCount)
        );
      }
    });

    it('should handle medium-length games correctly', async () => {
      const moves = testScenarios.mediumGame;
      const encodedMoves = encodeMoves(moves);

      const page = await ResultPage({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });
      render(page);

      // Calculate expected state
      const replayResult = replayMoves(moves);
      expect(replayResult.success).toBe(true);

      if (replayResult.success) {
        // Verify board is displayed
        expect(screen.getByTestId('board-display')).toBeInTheDocument();

        // Verify correct player side is indicated
        const container = screen.getByTestId('result-container');
        expect(container).toHaveAttribute('data-player-side', 'white');
      }
    });

    it('should show initial board state for empty game', async () => {
      const encodedMoves = encodeMoves(testScenarios.emptyGame);

      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      render(page);

      // Verify initial state (2-2)
      const scoreDisplay = screen.getByTestId('score-display');
      expect(scoreDisplay).toBeInTheDocument();
    });
  });

  describe('metadata generation integration', () => {
    it('should generate correct metadata for black winning game', async () => {
      const moves = testScenarios.shortGame;
      const encodedMoves = encodeMoves(moves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const replayResult = replayMoves(moves);
      if (replayResult.success) {
        const winner = determineWinner(
          replayResult.blackCount,
          replayResult.whiteCount
        );
        const expectedWinnerText =
          winner === 'black'
            ? '黒の勝ち'
            : winner === 'white'
              ? '白の勝ち'
              : '引き分け';

        expect(metadata.title).toContain('Reversi');
        expect(metadata.description).toContain(expectedWinnerText);
        expect(metadata.openGraph).toBeDefined();
      }
    });

    it('should generate correct metadata including scores', async () => {
      const moves = testScenarios.shortGame;
      const encodedMoves = encodeMoves(moves);

      const metadata = await generateMetadata({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });

      const replayResult = replayMoves(moves);
      if (replayResult.success) {
        expect(metadata.title).toContain(String(replayResult.blackCount));
        expect(metadata.title).toContain(String(replayResult.whiteCount));
      }
    });
  });

  describe('error state integration', () => {
    it('should display error for corrupted encoded moves', async () => {
      // Create a string that looks like Base64 but contains invalid move data
      const corruptedMoves = 'OTk5OQ'; // Decodes to "9999" which is out of range

      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves: corruptedMoves }),
      });
      render(page);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    it('should display error and provide navigation for invalid side', async () => {
      const encodedMoves = encodeMoves(testScenarios.shortGame);

      const page = await ResultPage({
        params: Promise.resolve({ side: 'x', encodedMoves }),
      });
      render(page);

      // Should show error
      expect(screen.getByTestId('error-message')).toBeInTheDocument();

      // Should provide navigation to game
      const gameLink = screen.getByRole('link', { name: /ゲームを始める/i });
      expect(gameLink).toHaveAttribute('href', '/');
    });

    it('should handle completely invalid base64 gracefully', async () => {
      const page = await ResultPage({
        params: Promise.resolve({
          side: 'b',
          encodedMoves: '!!!not_valid_base64!!!',
        }),
      });
      render(page);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });
  });

  describe('ISR configuration', () => {
    it('should return empty array from generateStaticParams for on-demand generation', async () => {
      const params = await generateStaticParams();
      expect(params).toEqual([]);
    });
  });

  describe('player side layout integration', () => {
    it('should display player as black (top) when side is "b"', async () => {
      const encodedMoves = encodeMoves(testScenarios.shortGame);

      const page = await ResultPage({
        params: Promise.resolve({ side: 'b', encodedMoves }),
      });
      render(page);

      const container = screen.getByTestId('result-container');
      expect(container).toHaveAttribute('data-player-side', 'black');

      // Verify score labels match player perspective
      const scoreDisplay = screen.getByTestId('score-display');
      expect(scoreDisplay.textContent).toContain('プレーヤー');
      expect(scoreDisplay.textContent).toContain('AI');
    });

    it('should display player as white (bottom) when side is "w"', async () => {
      const encodedMoves = encodeMoves(testScenarios.shortGame);

      const page = await ResultPage({
        params: Promise.resolve({ side: 'w', encodedMoves }),
      });
      render(page);

      const container = screen.getByTestId('result-container');
      expect(container).toHaveAttribute('data-player-side', 'white');
    });
  });

  describe('action buttons integration', () => {
    it('should render play again button with correct href', async () => {
      const encodedMoves = encodeMoves(testScenarios.shortGame);

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
  });
});
