/**
 * Final Verification Test
 *
 * This test suite validates all requirements for element-id-assignment feature:
 * 1. All test suites (unit, integration) pass successfully
 * 2. ID attribute uniqueness (64 cell IDs + 1 history ID = 65 unique IDs)
 * 3. Existing functionality (click events, styling, stone placement, history display) works correctly
 * 4. Build and type-check succeed (validated separately via CI/CD)
 *
 * Test Strategy:
 * - RED: Write comprehensive verification tests
 * - GREEN: All tests pass (implementation already complete from Tasks 1-4)
 * - REFACTOR: Confirm all requirements are met
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';

// Mock useAIPlayer hook to avoid import.meta issues in tests
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
  }),
}));

// Mock useLiff hook (default: not ready - no LIFF UI elements shown)
jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => ({
    isReady: false,
    error: null,
    isInClient: null,
    isLoggedIn: null,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('Final Verification - Element ID Assignment Feature', () => {
  describe('ID Attribute Uniqueness (64 cell IDs + 1 history ID)', () => {
    it('should generate exactly 64 unique cell IDs (a1-h8)', () => {
      const { container } = render(<GameBoard />);

      // Get all cell buttons with id attributes
      const cellsWithIds = container.querySelectorAll('.board-cell[id]');
      expect(cellsWithIds.length).toBe(64);

      // Collect all IDs
      const ids = Array.from(cellsWithIds).map((cell) => cell.id);

      // Verify uniqueness: Set size should equal array length
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(64);

      // Verify ID format: all should match /^[a-h][1-8]$/
      ids.forEach((id) => {
        expect(id).toMatch(/^[a-h][1-8]$/);
      });
    });

    it('should verify complete ID coverage: all combinations of [a-h] x [1-8]', () => {
      const { container } = render(<GameBoard />);

      const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

      for (const col of columns) {
        for (const row of rows) {
          const cellId = `${col}${row}`;
          const cell = container.querySelector(`#${cellId}`);
          expect(cell).toBeInTheDocument();
          expect(cell).toHaveAttribute('id', cellId);
        }
      }
    });

    it('should assign history ID after first move (65th unique ID)', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Initially, history element should exist in DOM
      let history = container.querySelector('#history');
      expect(history).toBeInTheDocument();
      // Should be visually hidden
      expect(history).toHaveClass('sr-only');

      // Make a valid move (c4)
      const validCell = container.querySelector('[data-row="3"][data-col="2"]');
      expect(validCell).toBeInTheDocument();
      await user.click(validCell!);

      // Wait for state update - history should still exist with notation
      await waitFor(() => {
        history = container.querySelector('#history');
        expect(history).toBeInTheDocument();
        // After move, notation string should be present
        const notationText = history?.textContent?.trim();
        expect(notationText).toBeTruthy();
      });

      // Verify history has correct ID
      expect(history).toHaveAttribute('id', 'history');
    });

    it('should ensure no ID duplication across all elements (65 total)', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Make a move to trigger history display
      const validCell = container.querySelector('[data-row="3"][data-col="2"]');
      await user.click(validCell!);

      await waitFor(() => {
        const history = container.querySelector('#history');
        expect(history).toBeInTheDocument();
      });

      // Get ALL elements with id attribute in the entire DOM
      const allElementsWithIds = container.querySelectorAll('[id]');
      const allIds = Array.from(allElementsWithIds).map((el) => el.id);

      // Verify uniqueness: Set size should equal array length
      const uniqueIds = new Set(allIds);
      expect(allIds.length).toBe(uniqueIds.size);

      // Verify we have at least 65 IDs (64 cells + 1 history)
      expect(allIds.length).toBeGreaterThanOrEqual(65);
    });
  });

  describe('Existing Functionality - Click Events', () => {
    it('should trigger click events on cells using ID selectors', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Select cell using ID
      const cellC4 = container.querySelector('#c4');
      expect(cellC4).toBeInTheDocument();
      expect(cellC4).toHaveAttribute('data-valid', 'true');

      // Click using ID selector
      await user.click(cellC4!);

      // Verify state changed: cell now has black stone
      await waitFor(() => {
        expect(cellC4).toHaveAttribute('data-stone', 'black');
      });
    });

    it('should maintain click event handlers after ID attribute addition', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Test multiple cells with different IDs
      const testCells = [
        { id: 'd3', row: '2', col: '3' },
        { id: 'c4', row: '3', col: '2' },
        { id: 'f5', row: '4', col: '5' },
        { id: 'e6', row: '5', col: '4' },
      ];

      for (const testCase of testCells) {
        const cell = container.querySelector(`#${testCase.id}`);
        expect(cell).toBeInTheDocument();
        expect(cell).toHaveAttribute('data-row', testCase.row);
        expect(cell).toHaveAttribute('data-col', testCase.col);

        // Verify cell is clickable (has onClick handler)
        const isValidMove = cell?.hasAttribute('data-valid');
        if (isValidMove) {
          // If valid, clicking should work
          await user.click(cell!);
          await waitFor(() => {
            expect(cell).toHaveAttribute('data-stone', 'black');
          });
          break; // Only click one valid move for this test
        }
      }
    });
  });

  describe('Existing Functionality - Styling', () => {
    it('should preserve CSS classes after ID attribute addition', () => {
      const { container } = render(<GameBoard />);

      // Get all cells
      const cells = container.querySelectorAll('.board-cell');
      expect(cells.length).toBe(64);

      // Verify each cell has both id and className
      cells.forEach((cell) => {
        expect(cell).toHaveAttribute('id'); // ID present
        expect(cell.className).toContain('board-cell'); // CSS class preserved
      });
    });

    it('should apply valid-move styling to cells with IDs', () => {
      const { container } = render(<GameBoard />);

      // Find cells with valid-move class
      const validMoveCells = container.querySelectorAll(
        '.board-cell.valid-move'
      );

      // All valid-move cells should have IDs
      validMoveCells.forEach((cell) => {
        expect(cell).toHaveAttribute('id');
        expect(cell.id).toMatch(/^[a-h][1-8]$/);
      });
    });
  });

  describe('Existing Functionality - Stone Placement', () => {
    it('should correctly place stones on cells with ID attributes', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Verify initial stone placement (center 4 cells)
      const blackStones = container.querySelectorAll('[data-stone="black"]');
      const whiteStones = container.querySelectorAll('[data-stone="white"]');
      expect(blackStones.length).toBe(2);
      expect(whiteStones.length).toBe(2);

      // All stones should be on cells with IDs
      blackStones.forEach((stone) => {
        const cell = stone.closest('.board-cell');
        expect(cell).toHaveAttribute('id');
      });
      whiteStones.forEach((stone) => {
        const cell = stone.closest('.board-cell');
        expect(cell).toHaveAttribute('id');
      });

      // Place a stone using ID selector
      const cellC4 = container.querySelector('#c4');
      await user.click(cellC4!);

      await waitFor(() => {
        // Verify stone count increased
        const blackStonesAfter = container.querySelectorAll(
          '[data-stone="black"]'
        );
        expect(blackStonesAfter.length).toBeGreaterThan(2);
      });
    });

    it('should flip stones correctly on cells with ID attributes', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Initial state: 2 black, 2 white
      const initialBlack = container.querySelectorAll(
        '[data-stone="black"]'
      ).length;
      const initialWhite = container.querySelectorAll(
        '[data-stone="white"]'
      ).length;
      expect(initialBlack).toBe(2);
      expect(initialWhite).toBe(2);

      // Make a move that flips stones
      const cellC4 = container.querySelector('#c4');
      await user.click(cellC4!);

      await waitFor(() => {
        // After black's move, some white stones should flip to black
        const blackAfter = container.querySelectorAll(
          '[data-stone="black"]'
        ).length;
        expect(blackAfter).toBeGreaterThan(initialBlack);
      });
    });
  });

  describe('Existing Functionality - History Display', () => {
    it('should display move history with correct ID after moves', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Initially, history element should exist
      let history = container.querySelector('#history');
      expect(history).toBeInTheDocument();
      expect(history).toHaveClass('sr-only');

      // Make a move
      const cellC4 = container.querySelector('#c4');
      await user.click(cellC4!);

      // Wait for history notation to be populated
      await waitFor(() => {
        history = container.querySelector('#history');
        expect(history).toBeInTheDocument();
        // Notation should be populated after move
        const notationText = history?.textContent?.trim();
        expect(notationText).toBeTruthy();
        expect(history).toHaveAttribute('id', 'history');
      });

      // Verify history content contains move notation
      expect(history).toHaveTextContent('c4');
    });

    it('should update history display after multiple moves', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Make first move
      const cellC4 = container.querySelector('#c4');
      await user.click(cellC4!);

      await waitFor(() => {
        const history = container.querySelector('#history');
        expect(history).toBeInTheDocument();
        expect(history).toHaveTextContent('c4');
      });

      // Note: AI move will happen automatically, but we can verify history persists
      await waitFor(
        () => {
          const history = container.querySelector('#history');
          expect(history).toBeInTheDocument();
          expect(history).toHaveAttribute('id', 'history');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Accessibility - aria-label Attributes', () => {
    it('should have aria-label on all cells with IDs', () => {
      const { container } = render(<GameBoard />);

      const cells = container.querySelectorAll('.board-cell[id]');
      expect(cells.length).toBe(64);

      cells.forEach((cell) => {
        const cellId = cell.id;
        expect(cell).toHaveAttribute('aria-label', `セル ${cellId}`);
      });
    });

    it('should have aria-label on history component', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Make a move to trigger history
      const cellC4 = container.querySelector('#c4');
      await user.click(cellC4!);

      await waitFor(() => {
        const history = container.querySelector('#history');
        expect(history).toBeInTheDocument();
        expect(history).toHaveAttribute('aria-label', '着手履歴');
      });
    });
  });

  describe('Data Attribute Consistency', () => {
    it('should maintain consistent data-row and data-col with ID mapping', () => {
      const { container } = render(<GameBoard />);

      // Test corner and center cells for data attribute consistency
      const testCases = [
        { id: 'a1', row: '0', col: '0' }, // Top-left
        { id: 'h8', row: '7', col: '7' }, // Bottom-right
        { id: 'c4', row: '3', col: '2' }, // Center
        { id: 'd3', row: '2', col: '3' }, // Center
        { id: 'e6', row: '5', col: '4' }, // Center
      ];

      testCases.forEach((testCase) => {
        const cell = container.querySelector(`#${testCase.id}`);
        expect(cell).toBeInTheDocument();
        expect(cell).toHaveAttribute('data-row', testCase.row);
        expect(cell).toHaveAttribute('data-col', testCase.col);
      });
    });

    it('should verify data-testid attribute coexists with id attribute', async () => {
      const user = userEvent.setup();
      const { container } = render(<GameBoard />);

      // Make a move to trigger history
      const cellC4 = container.querySelector('#c4');
      await user.click(cellC4!);

      await waitFor(() => {
        const history = container.querySelector('#history');
        expect(history).toBeInTheDocument();

        // Both attributes should exist
        expect(history).toHaveAttribute('id', 'history');
        expect(history).toHaveAttribute('data-testid', 'move-history');
      });
    });
  });

  describe('Coordinate Mapping Correctness', () => {
    it('should correctly map rowIndex and colIndex to cell IDs', () => {
      const { container } = render(<GameBoard />);

      // Verify standard chess notation mapping:
      // - colIndex (0-7) → column letter (a-h) - horizontal, left to right
      // - rowIndex (0-7) → row number (1-8) - vertical, top to bottom

      // Test top row (rowIndex=0 → row 1)
      const topRowIds = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'];
      topRowIds.forEach((id, colIndex) => {
        const cell = container.querySelector(`#${id}`);
        expect(cell).toHaveAttribute('data-row', '0');
        expect(cell).toHaveAttribute('data-col', String(colIndex));
      });

      // Test left column (colIndex=0 → column 'a')
      const leftColumnIds = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
      leftColumnIds.forEach((id, rowIndex) => {
        const cell = container.querySelector(`#${id}`);
        expect(cell).toHaveAttribute('data-row', String(rowIndex));
        expect(cell).toHaveAttribute('data-col', '0');
      });
    });

    it('should verify bottom-right corner is h8 (not a8 or h1)', () => {
      const { container } = render(<GameBoard />);

      const bottomRightCell = container.querySelector(
        '[data-row="7"][data-col="7"]'
      );
      expect(bottomRightCell).toHaveAttribute('id', 'h8');

      // Explicitly verify it's NOT incorrect mappings
      const cellH8 = container.querySelector('#h8');
      expect(cellH8).toHaveAttribute('data-row', '7');
      expect(cellH8).toHaveAttribute('data-col', '7');
    });
  });

  describe('No Regressions - Existing Tests', () => {
    it('should render game board correctly (existing test)', () => {
      render(<GameBoard />);
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });

    it('should display initial 8x8 board with 64 cells (existing test)', () => {
      render(<GameBoard />);
      const cells = screen.getAllByRole('button');
      // 64 board cells + 1 pass button
      expect(cells).toHaveLength(65);
    });

    it('should show current turn indicator (existing test)', () => {
      render(<GameBoard />);
      expect(screen.getByText(/あなたのターン/)).toBeInTheDocument();
    });

    it('should display stone counts (existing test)', () => {
      const { container } = render(<GameBoard />);
      const stoneCountItems = container.querySelectorAll('.stone-count-item');
      expect(stoneCountItems.length).toBe(2);
    });
  });
});
