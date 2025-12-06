/**
 * GameBoard + GameResultPanel Integration Tests
 *
 * TDD: RED phase - Tests written before implementation
 * Task 8.1: GameBoardにGameResultPanelを統合する
 * Requirements: 1.1, 1.2, 7.1, 7.2, 7.3, 7.4
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';
import * as gameLogic from '@/lib/game/game-logic';
import * as gameEnd from '@/lib/game/game-end';
import type { Board, Cell } from '@/lib/game/types';

// Mock useAIPlayer hook
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
  }),
}));

// Mock useLiff hook
jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => ({
    isReady: false,
    error: null,
    isInClient: null,
    isLoggedIn: false,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock useShare hook
const mockUseShare = {
  isShareReady: true,
  isSharing: false,
  canWebShare: true,
  shareImageUrl: 'https://example.com/share-image.png',
  hasPendingShare: false,
  handleLineShare: jest.fn(),
  handleWebShare: jest.fn(),
  prepareShareImage: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/hooks/useShare', () => ({
  useShare: () => mockUseShare,
}));

describe('GameBoard + GameResultPanel Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShare.isShareReady = true;
    mockUseShare.isSharing = false;
    mockUseShare.canWebShare = true;
    mockUseShare.prepareShareImage.mockResolvedValue(undefined);
  });

  describe('Task 8.1: GameResultPanel Integration', () => {
    describe('Rendering GameResultPanel when game is finished', () => {
      it('should NOT render GameResultPanel when game is playing', () => {
        render(<GameBoard />);

        // Should not find GameResultPanel during playing state
        expect(
          screen.queryByTestId('game-result-panel')
        ).not.toBeInTheDocument();
      });

      it('should render GameResultPanel when game status is finished', async () => {
        // Mock game end detection to return finished state
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        // Mock apply move to succeed
        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        // Mock calculateValidMoves to return no moves after game end
        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        // Click a cell to trigger game end
        const cells = screen.getAllByRole('button');
        const targetCell = cells.find(
          (cell) =>
            cell.getAttribute('data-row') === '2' &&
            cell.getAttribute('data-col') === '4'
        );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        // Wait for GameResultPanel to appear
        await waitFor(() => {
          expect(screen.getByTestId('game-result-panel')).toBeInTheDocument();
        });

        // Restore mocks
        jest.restoreAllMocks();
      });

      it('should display winner text in GameResultPanel', async () => {
        // Setup game end state
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          const resultPanel = screen.getByTestId('game-result-panel');
          expect(resultPanel).toHaveTextContent('あなたの勝ち!');
        });

        jest.restoreAllMocks();
      });
    });

    describe('Migrating existing game end UI to GameResultPanel', () => {
      it('should NOT display legacy game-result div when game is finished', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        const { container } = render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          // The old game-result div should be replaced by GameResultPanel
          // There should be game-result-panel, not game-result (legacy)
          expect(screen.getByTestId('game-result-panel')).toBeInTheDocument();

          // Legacy game-result should not exist separately from GameResultPanel
          const legacyGameResult = container.querySelector(
            '[data-testid="game-result"]'
          );
          expect(legacyGameResult).not.toBeInTheDocument();
        });

        jest.restoreAllMocks();
      });

      it('should display score in GameResultPanel', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          // GameResultPanel should display black and white scores
          expect(screen.getByTestId('black-score')).toBeInTheDocument();
          expect(screen.getByTestId('white-score')).toBeInTheDocument();
        });

        jest.restoreAllMocks();
      });
    });

    describe('Props passing to GameResultPanel', () => {
      it('should pass board prop to GameResultPanel', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          // Board should be passed - verify by checking ShareImagePreview
          expect(screen.getByTestId('share-image-preview')).toBeInTheDocument();
        });

        jest.restoreAllMocks();
      });

      it('should pass onReset handler that resets game', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        const mockApplyMove = jest
          .spyOn(gameLogic, 'applyMove')
          .mockReturnValue({
            success: true,
            value: createMockBoard(),
          });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        // Wait for game to end
        await waitFor(() => {
          expect(screen.getByTestId('game-result-panel')).toBeInTheDocument();
        });

        // Restore mocks before clicking reset to allow normal game reset
        mockApplyMove.mockRestore();
        jest.spyOn(gameEnd, 'checkGameEnd').mockRestore();
        jest.spyOn(gameLogic, 'validateMove').mockRestore();
        jest.spyOn(gameLogic, 'calculateValidMoves').mockRestore();

        // Click reset button
        const resetButton = screen.getByRole('button', {
          name: /新しいゲームを開始/i,
        });
        await userEvent.click(resetButton);

        // GameResultPanel should be hidden after reset
        await waitFor(() => {
          expect(
            screen.queryByTestId('game-result-panel')
          ).not.toBeInTheDocument();
        });

        // Game should be in playing state again
        expect(screen.getByText(/あなたのターン/)).toBeInTheDocument();
      });
    });

    describe('Share Buttons in GameResultPanel', () => {
      it('should render LINE share button when game is finished', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: /LINEでシェア/i })
          ).toBeInTheDocument();
        });

        jest.restoreAllMocks();
      });

      it('should render Web Share button when canWebShare is true', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        mockUseShare.canWebShare = true;

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: /その他でシェア/i })
          ).toBeInTheDocument();
        });

        jest.restoreAllMocks();
      });

      it('should NOT render Web Share button when canWebShare is false', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        mockUseShare.canWebShare = false;

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          expect(screen.getByTestId('game-result-panel')).toBeInTheDocument();
          expect(
            screen.queryByRole('button', { name: /その他でシェア/i })
          ).not.toBeInTheDocument();
        });

        jest.restoreAllMocks();
      });
    });

    describe('Winner display in GameResultPanel', () => {
      it('should display "Your win!" when black (player) wins', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          const panel = screen.getByTestId('game-result-panel');
          expect(panel).toHaveTextContent('あなたの勝ち!');
        });

        jest.restoreAllMocks();
      });

      it('should display "AI wins!" when white (AI) wins', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'white',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          const panel = screen.getByTestId('game-result-panel');
          expect(panel).toHaveTextContent('AIの勝ち!');
        });

        jest.restoreAllMocks();
      });

      it('should display "Draw" for draw result', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'draw',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          const panel = screen.getByTestId('game-result-panel');
          expect(panel).toHaveTextContent('引き分け');
        });

        jest.restoreAllMocks();
      });
    });

    describe('Removal of legacy turn indicator game finished text', () => {
      it('should NOT display legacy "Game Over!" text in turn-indicator when finished', async () => {
        jest.spyOn(gameEnd, 'checkGameEnd').mockReturnValue({
          ended: true,
          winner: 'black',
        });

        jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
          success: true,
          value: createMockBoard(),
        });

        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: true,
          value: true,
        });

        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        const { container } = render(<GameBoard />);

        const targetCell = screen
          .getAllByRole('button')
          .find(
            (cell) =>
              cell.getAttribute('data-row') === '2' &&
              cell.getAttribute('data-col') === '4'
          );

        if (targetCell) {
          await userEvent.click(targetCell);
        }

        await waitFor(() => {
          // GameResultPanel should be displayed
          expect(screen.getByTestId('game-result-panel')).toBeInTheDocument();

          // Legacy "game-finished-text" class should not be used for winner display
          const legacyGameFinishedText = container.querySelector(
            '.game-finished-text'
          );
          expect(legacyGameFinishedText).not.toBeInTheDocument();
        });

        jest.restoreAllMocks();
      });
    });
  });
});

/**
 * Helper to create a mock board for testing
 */
function createMockBoard(): Board {
  const board: Cell[][] = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, 'black', null, null, null],
    [null, null, null, 'black', 'black', null, null, null],
    [null, null, null, 'white', 'black', null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];
  return board;
}
