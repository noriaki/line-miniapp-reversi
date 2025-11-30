/**
 * ShareImagePreview Component Tests
 *
 * TDD: RED phase - Tests written before implementation
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ShareImagePreview from '../ShareImagePreview';
import type { Board, Player } from '@/lib/game/types';

// Helper to create a test board
function createTestBoard(blackCount: number, whiteCount: number): Board {
  const board: (Player | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place black stones
  let blackPlaced = 0;
  for (let row = 0; row < 8 && blackPlaced < blackCount; row++) {
    for (let col = 0; col < 8 && blackPlaced < blackCount; col++) {
      board[row][col] = 'black';
      blackPlaced++;
    }
  }

  // Place white stones
  let whitePlaced = 0;
  for (let row = 7; row >= 0 && whitePlaced < whiteCount; row--) {
    for (let col = 7; col >= 0 && whitePlaced < whiteCount; col--) {
      if (board[row][col] === null) {
        board[row][col] = 'white';
        whitePlaced++;
      }
    }
  }

  return board;
}

describe('ShareImagePreview', () => {
  const mockRef = React.createRef<HTMLDivElement>();

  describe('Layout and Size', () => {
    it('should render with fixed OGP size (1200x630px)', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const container = screen.getByTestId('share-image-preview');
      expect(container).toHaveStyle({
        width: '1200px',
        height: '630px',
      });
    });

    it('should be hidden with visibility: hidden', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const container = screen.getByTestId('share-image-preview');
      expect(container).toHaveStyle({ visibility: 'hidden' });
    });

    it('should have dark green background color (#1a2f14)', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const container = screen.getByTestId('share-image-preview');
      expect(container).toHaveStyle({ backgroundColor: '#1a2f14' });
    });

    it('should forward ref to container element', () => {
      const board = createTestBoard(36, 28);
      const ref = React.createRef<HTMLDivElement>();

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={ref}
        />
      );

      expect(ref.current).not.toBeNull();
      expect(ref.current?.getAttribute('data-testid')).toBe(
        'share-image-preview'
      );
    });
  });

  describe('Board Display', () => {
    it('should render 8x8 game board grid', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const boardElement = screen.getByTestId('share-image-board');
      expect(boardElement).toBeInTheDocument();

      // Should have 64 cells (8x8)
      const cells = screen.getAllByTestId(/^share-image-cell-/);
      expect(cells).toHaveLength(64);
    });

    it('should render board with 560x560px size', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const boardElement = screen.getByTestId('share-image-board');
      expect(boardElement).toHaveStyle({
        width: '560px',
        height: '560px',
      });
    });

    it('should display black and white stones correctly', () => {
      const board = createTestBoard(10, 5);

      render(
        <ShareImagePreview
          board={board}
          blackCount={10}
          whiteCount={5}
          winner="black"
          containerRef={mockRef}
        />
      );

      const blackStones = screen.getAllByTestId(/share-image-stone-black/);
      const whiteStones = screen.getAllByTestId(/share-image-stone-white/);

      expect(blackStones.length).toBe(10);
      expect(whiteStones.length).toBe(5);
    });
  });

  describe('Winner Text Display (Third-person perspective)', () => {
    it('should display "Player wins!" for black winner', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      expect(screen.getByText('プレーヤーの勝ち!')).toBeInTheDocument();
    });

    it('should display "Player loses..." for white winner', () => {
      const board = createTestBoard(28, 36);

      render(
        <ShareImagePreview
          board={board}
          blackCount={28}
          whiteCount={36}
          winner="white"
          containerRef={mockRef}
        />
      );

      expect(screen.getByText('プレーヤーの負け...')).toBeInTheDocument();
    });

    it('should display "Draw" for draw result', () => {
      const board = createTestBoard(32, 32);

      render(
        <ShareImagePreview
          board={board}
          blackCount={32}
          whiteCount={32}
          winner="draw"
          containerRef={mockRef}
        />
      );

      expect(screen.getByText('引き分け')).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('should display black stone count with black circle', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const scoreSection = screen.getByTestId('share-image-scores');
      expect(scoreSection).toHaveTextContent('36');
    });

    it('should display white stone count with white circle', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const scoreSection = screen.getByTestId('share-image-scores');
      expect(scoreSection).toHaveTextContent('28');
    });

    it('should show scores in format with stone indicators', () => {
      const board = createTestBoard(40, 24);

      render(
        <ShareImagePreview
          board={board}
          blackCount={40}
          whiteCount={24}
          winner="black"
          containerRef={mockRef}
        />
      );

      // Black score with indicator
      expect(screen.getByTestId('share-image-black-score')).toHaveTextContent(
        '40'
      );
      // White score with indicator
      expect(screen.getByTestId('share-image-white-score')).toHaveTextContent(
        '24'
      );
    });
  });

  describe('Branding', () => {
    it('should display brand name', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      expect(screen.getByText('かんたんリバーシ')).toBeInTheDocument();
    });
  });

  describe('html2canvas Compatibility', () => {
    it('should use inline styles for html2canvas compatibility', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const container = screen.getByTestId('share-image-preview');
      // Check that style attribute exists (inline styles)
      expect(container.getAttribute('style')).toBeTruthy();
    });

    it('should not use external images (CORS constraint)', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const images = screen.queryAllByRole('img');
      expect(images).toHaveLength(0);
    });
  });

  describe('Layout Structure', () => {
    it('should have horizontal layout with board on left and info on right', () => {
      const board = createTestBoard(36, 28);

      render(
        <ShareImagePreview
          board={board}
          blackCount={36}
          whiteCount={28}
          winner="black"
          containerRef={mockRef}
        />
      );

      const container = screen.getByTestId('share-image-preview');
      expect(container).toHaveStyle({ display: 'flex' });

      const boardSection = screen.getByTestId('share-image-board-section');
      const infoSection = screen.getByTestId('share-image-info-section');

      expect(boardSection).toBeInTheDocument();
      expect(infoSection).toBeInTheDocument();
    });
  });
});
