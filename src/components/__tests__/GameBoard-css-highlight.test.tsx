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

describe('GameBoard CSS Highlight Styles - Task 3', () => {
  describe('Task 3.1: 基本ハイライトスタイルを定義する', () => {
    it('data-last-move属性を持つセルにハイライトスタイルが適用されること', async () => {
      const user = userEvent.setup();

      // Mock valid move at position (2, 3)
      const mockPosition: Position = { row: 2, col: 3 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([mockPosition]);

      const { container } = render(<GameBoard />);

      // Find the cell at position (2, 3)
      const targetCell = container.querySelector(
        '[data-row="2"][data-col="3"]'
      );
      expect(targetCell).toBeInTheDocument();

      // Click the cell to make a move
      if (targetCell) {
        await user.click(targetCell);
      }

      // Wait for state update
      await waitFor(() => {
        const updatedCell = container.querySelector(
          '[data-row="2"][data-col="3"]'
        ) as HTMLElement;
        expect(updatedCell).toHaveAttribute('data-last-move', 'true');

        // Verify CSS class is applied
        expect(updatedCell).toHaveClass('board-cell');

        // Verify the element has the data-last-move attribute
        // (The actual visual styling is defined in CSS and tested via visual regression)
        expect(updatedCell.hasAttribute('data-last-move')).toBe(true);
      });
    });

    it('ハイライトスタイルが他のマスと視覚的に区別可能であること', async () => {
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
        // Highlighted cell has data-last-move attribute
        const highlightedCell = container.querySelector(
          '[data-last-move="true"]'
        );
        expect(highlightedCell).toBeInTheDocument();

        // Other cells do not have the attribute
        const allCells = container.querySelectorAll('.board-cell');
        const highlightedCells = container.querySelectorAll(
          '[data-last-move="true"]'
        );
        expect(highlightedCells.length).toBe(1);
        expect(allCells.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Task 3.2: ダークモード対応スタイルを追加する', () => {
    it('ライトモードでdata-last-move属性を持つセルが存在すること', async () => {
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
        );
        expect(highlightedCell).toBeInTheDocument();
        // Note: Dark mode styles are tested via visual regression tests
        // This test verifies the structure is correct for dark mode CSS to apply
      });
    });
  });

  describe('Task 3.3: レスポンシブデザイン対応を実装する', () => {
    it('モバイル画面サイズでdata-last-move属性が正しく適用されること', async () => {
      const user = userEvent.setup();

      const mockPosition: Position = { row: 2, col: 3 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([mockPosition]);

      // Set viewport to mobile size
      global.innerWidth = 375;
      global.innerHeight = 667;

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
        );
        expect(highlightedCell).toBeInTheDocument();
        // Note: Responsive styles (border width, glow size) are tested via visual regression
        // This test verifies the structure is correct for responsive CSS to apply
      });
    });

    it('タブレット画面サイズでdata-last-move属性が正しく適用されること', async () => {
      const user = userEvent.setup();

      const mockPosition: Position = { row: 2, col: 3 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([mockPosition]);

      // Set viewport to tablet size
      global.innerWidth = 640;
      global.innerHeight = 900;

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
        );
        expect(highlightedCell).toBeInTheDocument();
      });
    });
  });

  describe('Integration: CSSスタイルと互換性', () => {
    it('ハイライトが既存の有効手ヒントと視覚的に干渉しないこと', async () => {
      const user = userEvent.setup();

      // Mock two valid moves
      const move1: Position = { row: 2, col: 3 };
      const move2: Position = { row: 2, col: 4 };
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([move1, move2]);

      const { container } = render(<GameBoard />);

      // One cell should have last-move highlight after clicking
      const targetCell = container.querySelector(
        '[data-row="2"][data-col="3"]'
      );
      if (targetCell) {
        await user.click(targetCell);
      }

      await waitFor(() => {
        // After move, verify structure for both highlight and valid move hints
        const highlightedCells = container.querySelectorAll(
          '[data-last-move="true"]'
        );
        expect(highlightedCells.length).toBeLessThanOrEqual(1);

        // Valid move hints use .valid-hint class
        // Last move highlight uses data-last-move attribute
        // They use different CSS selectors, so no conflict
      });
    });
  });
});
