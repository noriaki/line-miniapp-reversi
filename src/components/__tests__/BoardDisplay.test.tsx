/**
 * BoardDisplay component tests
 * Tests the read-only board display for result page
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BoardDisplay } from '../BoardDisplay';
import { createInitialBoard } from '@/lib/game';
import type { Board } from '@/lib/game/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _React = React; // Suppress unused import warning while keeping React in scope for JSX

describe('BoardDisplay', () => {
  describe('rendering', () => {
    it('should render an 8x8 grid of cells', () => {
      const board = createInitialBoard();
      render(<BoardDisplay board={board} />);

      const container = screen.getByTestId('board-display');
      expect(container).toBeInTheDocument();

      // Check for all 64 cells
      const allCells = container.querySelectorAll('[data-row][data-col]');
      expect(allCells).toHaveLength(64);
    });

    it('should display initial board with 4 stones', () => {
      const board = createInitialBoard();
      render(<BoardDisplay board={board} />);

      const container = screen.getByTestId('board-display');

      // Check initial stones - 2 black and 2 white
      const blackStones = container.querySelectorAll('[data-stone="black"]');
      const whiteStones = container.querySelectorAll('[data-stone="white"]');

      expect(blackStones).toHaveLength(2);
      expect(whiteStones).toHaveLength(2);
    });

    it('should display custom board state correctly', () => {
      // Create a board with more stones
      const board: Board = Array(8)
        .fill(null)
        .map((_, row) =>
          Array(8)
            .fill(null)
            .map(() => {
              // Fill first row with black
              if (row === 0) return 'black';
              // Fill second row with white
              if (row === 1) return 'white';
              return null;
            })
        );

      render(<BoardDisplay board={board} />);

      const container = screen.getByTestId('board-display');
      const blackStones = container.querySelectorAll('[data-stone="black"]');
      const whiteStones = container.querySelectorAll('[data-stone="white"]');

      expect(blackStones).toHaveLength(8);
      expect(whiteStones).toHaveLength(8);
    });
  });

  describe('styling', () => {
    it('should have board grid styling', () => {
      const board = createInitialBoard();
      render(<BoardDisplay board={board} />);

      const container = screen.getByTestId('board-display');
      expect(container).toHaveClass('board-display-grid');
    });

    it('should not have interactive elements (no click handlers)', () => {
      const board = createInitialBoard();
      render(<BoardDisplay board={board} />);

      const container = screen.getByTestId('board-display');
      const cells = container.querySelectorAll('[data-row][data-col]');

      // Cells should be divs, not buttons
      cells.forEach((cell) => {
        expect(cell.tagName.toLowerCase()).toBe('div');
      });
    });
  });

  describe('accessibility', () => {
    it('should have accessible label', () => {
      const board = createInitialBoard();
      render(<BoardDisplay board={board} />);

      const container = screen.getByTestId('board-display');
      expect(container).toHaveAttribute('aria-label');
    });
  });
});
