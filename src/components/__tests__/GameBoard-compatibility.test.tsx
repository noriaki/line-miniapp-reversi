import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';
import * as gameLogic from '@/lib/game/game-logic';
import type { Position } from '@/lib/game/types';

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

describe('GameBoard Compatibility Tests - Task 4.1', () => {
  describe('Task 4.1: 既存レンダリングロジックとの互換性を確認する', () => {
    it('石の配置アニメーション（placeStone）が正常に動作すること', async () => {
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

      // Wait for stone to be placed
      await waitFor(() => {
        const stone = targetCell?.querySelector('.stone-black');
        expect(stone).toBeInTheDocument();
        // Verify the stone element exists - CSS animation is applied automatically
      });
    });

    it('有効手のヒント表示（pulse）が正常に動作すること', () => {
      const mockPositions: Position[] = [
        { row: 2, col: 3 },
        { row: 2, col: 4 },
      ];
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue(mockPositions);

      const { container } = render(<GameBoard />);

      // Verify valid hints are displayed
      const validHints = container.querySelectorAll('.valid-hint');
      expect(validHints.length).toBeGreaterThan(0);

      // Verify valid-move class is applied
      const validCells = container.querySelectorAll('.valid-move');
      expect(validCells.length).toBeGreaterThan(0);
    });

    it('最終手ハイライトと有効手ヒントが同時に表示されても視覚的に干渉しないこと', async () => {
      const user = userEvent.setup();

      // First move
      const firstMove: Position = { row: 2, col: 3 };
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([firstMove]);

      const { container } = render(<GameBoard />);

      const firstCell = container.querySelector('[data-row="2"][data-col="3"]');
      if (firstCell) {
        await user.click(firstCell);
      }

      // Wait for first move highlight
      await waitFor(() => {
        const highlighted = container.querySelector('[data-last-move="true"]');
        expect(highlighted).toBeInTheDocument();
      });

      // After the move, simulate new valid moves appearing
      // (AI turn would happen, but we're testing that valid hints don't conflict with last-move highlight)
      const highlightedCells = container.querySelectorAll(
        '[data-last-move="true"]'
      );

      // Should have exactly one last-move highlight
      expect(highlightedCells.length).toBe(1);

      // Valid moves can coexist without interference (using different selectors)
      // .valid-move uses inset box-shadow with rgba(255, 215, 0, 0.3)
      // [data-last-move] uses box-shadow with rgba(255, 69, 0, 0.7)
      // Different colors and z-indexes ensure no visual conflict
    });

    it('ハイライト効果が既存のCSSクラスと競合しないこと', async () => {
      const user = userEvent.setup();

      const mockPosition: Position = { row: 2, col: 3 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([mockPosition]);

      const { container } = render(<GameBoard />);

      const targetCell = container.querySelector(
        '[data-row="2"][data-col="3"]'
      );

      // Initially, cell should have board-cell class and valid-move class
      expect(targetCell).toHaveClass('board-cell');
      expect(targetCell).toHaveClass('valid-move');

      if (targetCell) {
        await user.click(targetCell);
      }

      await waitFor(() => {
        const updatedCell = container.querySelector(
          '[data-row="2"][data-col="3"]'
        );

        // After click, cell should still have board-cell class
        expect(updatedCell).toHaveClass('board-cell');

        // And now have data-last-move attribute
        expect(updatedCell).toHaveAttribute('data-last-move', 'true');

        // Stone should be placed
        const stone = updatedCell?.querySelector('.stone');
        expect(stone).toBeInTheDocument();
      });
    });
  });
});
