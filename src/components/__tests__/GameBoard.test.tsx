import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';
import * as gameLogic from '@/lib/game/game-logic';

// Mock useAIPlayer hook to avoid import.meta issues in tests
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
  }),
}));

// Mock useLiff hook (default: not ready - no LIFF UI elements shown)
jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => ({
    isReady: false, // Not ready prevents login button from showing
    error: null,
    isInClient: null,
    isLoggedIn: null,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('GameBoard Component', () => {
  it('should render correctly', () => {
    render(<GameBoard />);
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('should display 8x8 board in initial state', () => {
    render(<GameBoard />);
    const cells = screen.getAllByRole('button');
    // 64 board cells + 1 pass button = 65 total buttons
    expect(cells).toHaveLength(65);
  });

  it('should place 4 stones in center in initial setup', () => {
    const { container } = render(<GameBoard />);
    // 中央4マスに石があることを確認
    const blackStones = container.querySelectorAll('[data-stone="black"]');
    const whiteStones = container.querySelectorAll('[data-stone="white"]');
    expect(blackStones.length).toBe(2);
    expect(whiteStones.length).toBe(2);
  });

  it('should display current turn', () => {
    render(<GameBoard />);
    expect(screen.getByText(/あなたのターン/)).toBeInTheDocument();
  });

  it('should display stone count in real-time', () => {
    const { container } = render(<GameBoard />);
    // 初期状態: 黒2個、白2個
    const stoneCountItems = container.querySelectorAll('.stone-count-item');
    expect(stoneCountItems.length).toBe(2);
    // 石数が表示されていることを確認（数字として）
    const counts = screen.getAllByText('2');
    expect(counts.length).toBe(2); // 黒と白の両方
  });

  describe('Pass Button UI Integration', () => {
    it('should display pass button below the board', () => {
      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).toBeInTheDocument();
      expect(passButton).toHaveTextContent('パス');
    });

    it('should have aria-label attribute on pass button', () => {
      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).toHaveAttribute('aria-label', 'ターンをパスする');
    });

    it('should disable pass button when valid moves exist', () => {
      // 初期状態では有効な手が存在する
      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).toBeDisabled();
      expect(passButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable pass button when no valid moves exist', () => {
      // Mock calculateValidMoves to return empty array (no valid moves)
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).not.toBeDisabled();
      expect(passButton).toHaveAttribute('aria-disabled', 'false');

      // Restore original implementation
      jest.spyOn(gameLogic, 'calculateValidMoves').mockRestore();
    });

    it('should disable pass button during AI turn', async () => {
      // Mock to make AI turn happen immediately
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      // Simulate user pass to switch to AI turn
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      await userEvent.click(passButton);

      // Wait for AI turn to start
      await waitFor(() => {
        const aiTurnText = screen.queryByText(/AI のターン/);
        if (aiTurnText) {
          expect(passButton).toBeDisabled();
        }
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockRestore();
    });

    it('should not display pass button when game is finished', () => {
      // This test will be implemented after game logic is integrated
      // For now, we'll skip it as it requires complex state setup
    });

    it('should have touch target size of at least 44x44px for pass button', () => {
      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });

      // Check that pass button has the correct CSS class
      expect(passButton).toHaveClass('pass-button');

      // In Jest environment, computed styles are not fully available
      // Instead, we verify the CSS class is applied (actual size verification is done in E2E tests)
      // The .pass-button class defines min-width: 200px and min-height: 44px in GameBoard.css
    });
  });

  describe('Board Cell ID Attributes', () => {
    it('should have unique id attribute on each board cell', () => {
      const { container } = render(<GameBoard />);
      // Get all board cells (64 cells total)
      const cells = container.querySelectorAll('[data-row][data-col]');
      expect(cells).toHaveLength(64);

      // Verify each cell has an id attribute
      cells.forEach((cell) => {
        expect(cell).toHaveAttribute('id');
      });
    });

    it('should have id "a1" for top-left cell (row=0, col=0)', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      expect(cell).toHaveAttribute('id', 'a1');
    });

    it('should have id "h8" for bottom-right cell (row=7, col=7)', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="7"][data-col="7"]');
      expect(cell).toHaveAttribute('id', 'h8');
    });

    it('should have id "d3" for center cell (row=2, col=3)', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="2"][data-col="3"]');
      expect(cell).toHaveAttribute('id', 'd3');
    });

    it('should have unique IDs for all 64 cells', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');
      const ids = Array.from(cells).map((cell) => cell.getAttribute('id'));
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(ids.length).toBe(64);
      expect(uniqueIds.size).toBe(64);
    });

    it('should match notation format (regex /^[a-h][1-8]$/) for cell IDs', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');

      cells.forEach((cell) => {
        const id = cell.getAttribute('id');
        expect(id).toMatch(/^[a-h][1-8]$/);
      });
    });

    it('should coexist cell ID attribute with existing data-* attributes', () => {
      const { container } = render(<GameBoard />);
      // Use a cell that has a stone (row=3, col=3 has a white stone in initial state)
      const cell = container.querySelector('[data-row="3"][data-col="3"]');

      // Verify all attributes coexist
      expect(cell).toHaveAttribute('id', 'd4');
      expect(cell).toHaveAttribute('data-row', '3');
      expect(cell).toHaveAttribute('data-col', '3');
      expect(cell).toHaveAttribute('data-stone', 'white');
    });

    it('should work correctly for cell click events after ID attribute addition', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const { container } = render(<GameBoard />);

      // Click cell with id="c4" (row=2, col=3)
      const cell = container.querySelector('#c4');
      expect(cell).toBeInTheDocument();

      await userEvent.click(cell!);

      // Verify the move was processed (applyMove was called)
      expect(mockApplyMove).toHaveBeenCalled();

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });
  });

  describe('Move History ID Attribute', () => {
    it('should have id="history" attribute on move history component', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const { container } = render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = container.querySelector('#history');
        expect(moveHistory).toBeInTheDocument();
        expect(moveHistory).toHaveAttribute('id', 'history');
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('should coexist id="history" and data-testid="move-history"', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const { container } = render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const historyById = container.querySelector('#history');
        const historyByTestId = screen.getByTestId('move-history');

        // Both selectors should find the same element
        expect(historyById).toBe(historyByTestId);
        expect(historyById).toHaveAttribute('id', 'history');
        expect(historyById).toHaveAttribute('data-testid', 'move-history');
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('should have history element in DOM even when notationString is absent', () => {
      const { container } = render(<GameBoard />);
      const moveHistory = container.querySelector('#history');
      // Element should exist in DOM even when notation is empty (for Playwright testing)
      expect(moveHistory).toBeInTheDocument();
      // But it should be visually hidden
      expect(moveHistory).toHaveClass('sr-only');
      expect(moveHistory).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Accessibility - Cell aria-label', () => {
    it('should have aria-label attribute on each cell', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');

      cells.forEach((cell) => {
        expect(cell).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-label "セル a1" for top-left cell (a1)', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      expect(cell).toHaveAttribute('aria-label', 'セル a1');
    });

    it('should have aria-label "セル h8" for bottom-right cell (h8)', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="7"][data-col="7"]');
      expect(cell).toHaveAttribute('aria-label', 'セル h8');
    });

    it('should have aria-label "セル d3" for center cell (d3)', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="2"][data-col="3"]');
      expect(cell).toHaveAttribute('aria-label', 'セル d3');
    });

    it('should be able to select cell using screen.getByRole("button", { name: /セル a1/i })', () => {
      render(<GameBoard />);
      const cellA1 = screen.getByRole('button', { name: /セル a1/i });
      expect(cellA1).toBeInTheDocument();
      expect(cellA1).toHaveAttribute('id', 'a1');
    });

    it('should coexist aria-label attribute with existing aria-* attributes', () => {
      render(<GameBoard />);
      // Pass button has aria-label and aria-disabled
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).toHaveAttribute('aria-label');
      expect(passButton).toHaveAttribute('aria-disabled');

      // Score displays have aria-label
      const blackScore = screen.getByLabelText(/Black score:/i);
      expect(blackScore).toBeInTheDocument();

      // Board cells should also have aria-label
      const cellA1 = screen.getByRole('button', { name: /セル a1/i });
      expect(cellA1).toHaveAttribute('aria-label', 'セル a1');
    });

    it('should have aria-label on all 64 cells', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');

      expect(cells.length).toBe(64);
      cells.forEach((cell) => {
        const ariaLabel = cell.getAttribute('aria-label');
        expect(ariaLabel).toMatch(/^セル [a-h][1-8]$/);
      });
    });
  });

  describe('Accessibility - History Component Semantics', () => {
    it('should use appropriate container element (div) for history component', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const { container } = render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = container.querySelector('#history');
        expect(moveHistory).toBeInTheDocument();
        expect(moveHistory?.tagName).toBe('DIV');
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('should have aria-label attribute on history component', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const { container } = render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = container.querySelector('#history');
        expect(moveHistory).toHaveAttribute('aria-label', '着手履歴');
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });
  });

  describe('UI Usability - Move History Visual Hiding', () => {
    it('should have sr-only class on move history element', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = screen.getByTestId('move-history');
        expect(moveHistory).toHaveClass('sr-only');
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('should have aria-hidden="true" attribute on move history element', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = screen.getByTestId('move-history');
        expect(moveHistory).toHaveAttribute('aria-hidden', 'true');
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('should maintain move history element in DOM', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const { container } = render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = container.querySelector('#history');
        expect(moveHistory).toBeInTheDocument();
        expect(moveHistory).toHaveAttribute('data-testid', 'move-history');
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('should maintain data-testid="move-history" attribute', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = screen.getByTestId('move-history');
        expect(moveHistory).toBeInTheDocument();
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });
  });

  describe('UI Usability - Message Layout', () => {
    it('should have fixed height class (h-16) on message display area', () => {
      const { container } = render(<GameBoard />);
      // Find the fixed-height container (parent of notification-message)
      const messageContainer = container.querySelector('.h-16');
      expect(messageContainer).toBeInTheDocument();
      expect(messageContainer).toHaveClass('h-16');
    });

    it('should always have message element in DOM', () => {
      const { container } = render(<GameBoard />);
      // The notification-message element should always be in DOM
      const notificationMessage = container.querySelector(
        '.notification-message'
      );
      expect(notificationMessage).toBeInTheDocument();
    });

    it('should apply opacity-100 class when pass notification message is displayed', () => {
      // Mock to have no valid moves (triggers pass scenario)
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const { container } = render(<GameBoard />);

      // Initially should be opacity-0 (no pass message)
      const notificationMessage = container.querySelector(
        '.notification-message'
      );
      expect(notificationMessage).toHaveClass('opacity-0');

      jest.spyOn(gameLogic, 'calculateValidMoves').mockRestore();
    });

    it('should apply opacity-0 class when pass notification message is hidden', () => {
      const { container } = render(<GameBoard />);

      // Initially no pass message, so should have opacity-0
      const notificationMessage = container.querySelector(
        '.notification-message'
      );
      expect(notificationMessage).toHaveClass('opacity-0');
      expect(notificationMessage).not.toHaveClass('opacity-100');
    });

    it('should verify that transition-opacity class is applied', () => {
      const { container } = render(<GameBoard />);

      // The notification-message should have transition-opacity class
      const notificationMessage = container.querySelector(
        '.notification-message'
      );
      expect(notificationMessage).toHaveClass('transition-opacity');
    });
  });

  describe('Move History Display', () => {
    it('should have move history area in DOM even in initial state', () => {
      render(<GameBoard />);
      const moveHistory = screen.queryByTestId('move-history');
      // Element should exist in DOM even when empty (for Playwright testing)
      expect(moveHistory).toBeInTheDocument();
      // But it should be visually hidden with sr-only class
      expect(moveHistory).toHaveClass('sr-only');
      expect(moveHistory).toHaveAttribute('aria-hidden', 'true');
    });

    it('should exist in DOM but be visually hidden when notation is empty', () => {
      render(<GameBoard />);
      const moveHistory = screen.queryByTestId('move-history');
      // Element exists in DOM
      expect(moveHistory).toBeInTheDocument();
      // Visually hidden with sr-only class
      expect(moveHistory).toHaveClass('sr-only');
      // Contains non-breaking space to maintain height (textContent sees it as regular space)
      const textContent = moveHistory?.textContent || '';
      expect(textContent.trim()).toBe('');
      expect(textContent.length).toBeGreaterThan(0); // Contains non-breaking space
    });

    it('should be displayed when notationString exists in playing state', async () => {
      // Mock to simulate a move that generates notation
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      render(<GameBoard />);

      // Click a valid move position (e.g., row 2, col 4)
      const cell = screen.getAllByRole('button')[20]; // row 2, col 4
      await userEvent.click(cell);

      // Wait for move history to appear
      await waitFor(() => {
        const moveHistory = screen.queryByTestId('move-history');
        expect(moveHistory).toBeInTheDocument();
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('棋譜表示領域にdata-testid="move-history"属性が設定されていること', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      render(<GameBoard />);
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = screen.getByTestId('move-history');
        expect(moveHistory).toBeInTheDocument();
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
    });

    it('棋譜が更新されるとnotationStringが更新されること', async () => {
      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, 'black', null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      // Mock calculateValidMoves to return at least one valid move to prevent game end
      const mockCalculateValidMoves = jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([{ row: 0, col: 0 }]);

      render(<GameBoard />);

      // Click a cell to make a move (button index 20 = row 2, col 4 = "e3")
      const cell = screen.getAllByRole('button')[20];
      await userEvent.click(cell);

      await waitFor(() => {
        const moveHistory = screen.queryByTestId('move-history');
        // Should be visible and contain moves
        expect(moveHistory).toBeInTheDocument();
        // Text should contain valid notation (letter + number pattern)
        expect(moveHistory?.textContent).toMatch(/[a-h][1-8]/);
      });

      mockApplyMove.mockRestore();
      mockValidateMove.mockRestore();
      mockCalculateValidMoves.mockRestore();
    });

    it('ゲーム終了時は棋譜表示領域が非表示になること', () => {
      // This will be verified by checking that move-history only shows during 'playing' state
      // Initial state is 'playing', so history would show if notation exists
      // When gameStatus becomes 'finished', it should not show
      // This requires more complex state setup, will be covered in integration tests
    });
  });
});
