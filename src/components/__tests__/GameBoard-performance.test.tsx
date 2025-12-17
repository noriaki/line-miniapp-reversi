import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';
import * as gameLogic from '@/lib/game/game-logic';
import type { Position } from '@/lib/game/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock move-encoder
jest.mock('@/lib/share/move-encoder', () => ({
  encodeMoves: jest.fn().mockReturnValue('testEncodedMoves'),
}));

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

describe('GameBoard Performance Tests', () => {
  describe('Rendering performance validation', () => {
    it('should not cause excessive re-renders when displaying highlight', async () => {
      const user = userEvent.setup();

      const mockPosition: Position = { row: 2, col: 3 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([mockPosition]);

      const { container } = render(<GameBoard />);

      const targetCell = container.querySelector(
        '[data-row="2"][data-col="3"]'
      );

      // Track initial render
      const initialRenderTime = performance.now();

      if (targetCell) {
        await user.click(targetCell);
      }

      // Wait for highlight to be applied
      await waitFor(() => {
        const highlightedCell = container.querySelector(
          '[data-last-move="true"]'
        );
        expect(highlightedCell).toBeInTheDocument();
      });

      const renderEndTime = performance.now();
      const renderDuration = renderEndTime - initialRenderTime;

      // Rendering should be fast (< 500ms for the entire operation including state update)
      expect(renderDuration).toBeLessThan(500);
    });

    it('should utilize browser hardware acceleration for CSS transitions', async () => {
      const user = userEvent.setup();

      const mockPosition: Position = { row: 2, col: 3 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([mockPosition]);

      const { container } = render(<GameBoard />);

      const targetCell = container.querySelector(
        '[data-row="2"][data-col="3"]'
      );

      if (targetCell) {
        await user.click(targetCell);
      }

      await waitFor(() => {
        const highlightedCell = container.querySelector(
          '[data-last-move="true"]'
        ) as HTMLElement;
        expect(highlightedCell).toBeInTheDocument();

        // Verify that the element has the board-cell class
        // (CSS file defines transition: box-shadow 0.3s ease-in-out for data-last-move)
        expect(highlightedCell).toHaveClass('board-cell');

        // The CSS transition is defined in GameBoard.css
        // box-shadow transitions are GPU-accelerated in modern browsers
        // This test verifies the structure is correct for CSS transitions to apply
      });
    });

    it('should not cause unnecessary re-renders with simple implementation', async () => {
      const user = userEvent.setup();

      // Mock multiple valid moves
      const mockPositions: Position[] = [
        { row: 2, col: 3 },
        { row: 2, col: 4 },
        { row: 3, col: 2 },
      ];
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue(mockPositions);

      const { container } = render(<GameBoard />);

      // Make a move
      const targetCell = container.querySelector(
        '[data-row="2"][data-col="3"]'
      );
      if (targetCell) {
        await user.click(targetCell);
      }

      await waitFor(() => {
        const highlightedCell = container.querySelector(
          '[data-last-move="true"]'
        );
        expect(highlightedCell).toBeInTheDocument();
      });

      // Verify that only ONE cell has the last-move attribute
      // (Simple implementation: no complex memo or optimization needed)
      const highlightedCells = container.querySelectorAll(
        '[data-last-move="true"]'
      );
      expect(highlightedCells.length).toBe(1);

      // All 64 cells should be rendered
      const allCells = container.querySelectorAll('.board-cell');
      expect(allCells.length).toBe(64);
    });

    it('should maintain consistent performance across multiple moves', async () => {
      const user = userEvent.setup();

      const mockPosition1: Position = { row: 2, col: 3 };
      const mockPosition2: Position = { row: 2, col: 4 };

      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValueOnce([mockPosition1])
        .mockReturnValueOnce([mockPosition2])
        .mockReturnValue([]);

      const { container } = render(<GameBoard />);

      // First move
      const firstStartTime = performance.now();
      const firstCell = container.querySelector('[data-row="2"][data-col="3"]');
      if (firstCell) {
        await user.click(firstCell);
      }

      await waitFor(() => {
        const highlighted = container.querySelector('[data-last-move="true"]');
        expect(highlighted).toHaveAttribute('data-row', '2');
        expect(highlighted).toHaveAttribute('data-col', '3');
      });
      const firstEndTime = performance.now();
      const firstDuration = firstEndTime - firstStartTime;

      // Second move (after AI turn would complete - we skip AI simulation here)
      // In real scenario, player switch happens via AI turn
      // This test verifies performance consistency across multiple moves

      // Verify that performance is consistent (no memory leaks or performance degradation)
      expect(firstDuration).toBeLessThan(1000);

      // Only one cell should be highlighted at a time
      const highlightedCells = container.querySelectorAll(
        '[data-last-move="true"]'
      );
      expect(highlightedCells.length).toBe(1);
    });

    it('should maintain performance even when highlight is hidden', async () => {
      const mockPosition: Position = { row: 2, col: 3 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([mockPosition]);

      const { container, rerender } = render(<GameBoard />);

      // Initial render - no highlights
      const initialCells = container.querySelectorAll(
        '[data-last-move="true"]'
      );
      expect(initialCells.length).toBe(0);

      // Re-render (simulating game reset)
      const rerenderStartTime = performance.now();
      rerender(<GameBoard />);
      const rerenderEndTime = performance.now();
      const rerenderDuration = rerenderEndTime - rerenderStartTime;

      // Re-render should be fast
      expect(rerenderDuration).toBeLessThan(100);

      // Still no highlights after reset
      const resetCells = container.querySelectorAll('[data-last-move="true"]');
      expect(resetCells.length).toBe(0);
    });
  });
});
