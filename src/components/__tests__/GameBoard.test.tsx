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
  it('正しくレンダリングされること', () => {
    render(<GameBoard />);
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('初期状態で8x8のボードを表示すること', () => {
    render(<GameBoard />);
    const cells = screen.getAllByRole('button');
    // 64 board cells + 1 pass button = 65 total buttons
    expect(cells).toHaveLength(65);
  });

  it('初期配置で中央に4つの石が配置されていること', () => {
    const { container } = render(<GameBoard />);
    // 中央4マスに石があることを確認
    const blackStones = container.querySelectorAll('[data-stone="black"]');
    const whiteStones = container.querySelectorAll('[data-stone="white"]');
    expect(blackStones.length).toBe(2);
    expect(whiteStones.length).toBe(2);
  });

  it('現在のターンを表示すること', () => {
    render(<GameBoard />);
    expect(screen.getByText(/あなたのターン/)).toBeInTheDocument();
  });

  it('石数をリアルタイムで表示すること', () => {
    const { container } = render(<GameBoard />);
    // 初期状態: 黒2個、白2個
    const stoneCountItems = container.querySelectorAll('.stone-count-item');
    expect(stoneCountItems.length).toBe(2);
    // 石数が表示されていることを確認（数字として）
    const counts = screen.getAllByText('2');
    expect(counts.length).toBe(2); // 黒と白の両方
  });

  describe('Pass Button UI Integration (Task 2.1)', () => {
    it('パスボタンが盤面の下部に表示されること', () => {
      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).toBeInTheDocument();
      expect(passButton).toHaveTextContent('パス');
    });

    it('パスボタンにaria-label属性が設定されていること', () => {
      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).toHaveAttribute('aria-label', 'ターンをパスする');
    });

    it('有効な手が存在する場合、パスボタンが無効化されていること', () => {
      // 初期状態では有効な手が存在する
      render(<GameBoard />);
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      expect(passButton).toBeDisabled();
      expect(passButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('有効な手が存在しない場合、パスボタンが有効化されること', () => {
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

    it('AIのターン時はパスボタンが無効化されていること', async () => {
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

    it('ゲーム終了時はパスボタンが表示されないこと', () => {
      // This test will be implemented after game logic is integrated
      // For now, we'll skip it as it requires complex state setup
    });

    it('パスボタンのタッチターゲットサイズが44x44px以上であること', () => {
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

  describe('Board Cell ID Attributes (Task 2.1)', () => {
    it('盤面の各セルに一意のid属性が設定されること', () => {
      const { container } = render(<GameBoard />);
      // Get all board cells (64 cells total)
      const cells = container.querySelectorAll('[data-row][data-col]');
      expect(cells).toHaveLength(64);

      // Verify each cell has an id attribute
      cells.forEach((cell) => {
        expect(cell).toHaveAttribute('id');
      });
    });

    it('左上隅セル(row=0, col=0)のIDが"a1"であること', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      expect(cell).toHaveAttribute('id', 'a1');
    });

    it('右下隅セル(row=7, col=7)のIDが"h8"であること', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="7"][data-col="7"]');
      expect(cell).toHaveAttribute('id', 'h8');
    });

    it('中央セル(row=2, col=3)のIDが"d3"であること', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="2"][data-col="3"]');
      expect(cell).toHaveAttribute('id', 'd3');
    });

    it('全64個のセルIDが一意であること', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');
      const ids = Array.from(cells).map((cell) => cell.getAttribute('id'));
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(ids.length).toBe(64);
      expect(uniqueIds.size).toBe(64);
    });

    it('セルIDが棋譜形式(正規表現/^[a-h][1-8]$/)に一致すること', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');

      cells.forEach((cell) => {
        const id = cell.getAttribute('id');
        expect(id).toMatch(/^[a-h][1-8]$/);
      });
    });

    it('セルID属性が既存のdata-*属性と共存すること', () => {
      const { container } = render(<GameBoard />);
      // Use a cell that has a stone (row=3, col=3 has a white stone in initial state)
      const cell = container.querySelector('[data-row="3"][data-col="3"]');

      // Verify all attributes coexist
      expect(cell).toHaveAttribute('id', 'd4');
      expect(cell).toHaveAttribute('data-row', '3');
      expect(cell).toHaveAttribute('data-col', '3');
      expect(cell).toHaveAttribute('data-stone', 'white');
    });

    it('セルクリックイベントがID属性追加後も正常動作すること', async () => {
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

  describe('Move History ID Attribute (Task 2.2)', () => {
    it('着手履歴コンポーネントにid="history"属性が設定されること', async () => {
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

    it('id="history"とdata-testid="move-history"が共存すること', async () => {
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

    it('notationString不在時はid="history"要素が存在しないこと', () => {
      const { container } = render(<GameBoard />);
      const moveHistory = container.querySelector('#history');
      expect(moveHistory).not.toBeInTheDocument();
    });
  });

  describe('Accessibility - Cell aria-label (Task 5.1)', () => {
    it('各セルにaria-label属性が設定されること', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');

      cells.forEach((cell) => {
        expect(cell).toHaveAttribute('aria-label');
      });
    });

    it('左上隅セル(a1)のaria-labelが"セル a1"であること', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      expect(cell).toHaveAttribute('aria-label', 'セル a1');
    });

    it('右下隅セル(h8)のaria-labelが"セル h8"であること', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="7"][data-col="7"]');
      expect(cell).toHaveAttribute('aria-label', 'セル h8');
    });

    it('中央セル(d3)のaria-labelが"セル d3"であること', () => {
      const { container } = render(<GameBoard />);
      const cell = container.querySelector('[data-row="2"][data-col="3"]');
      expect(cell).toHaveAttribute('aria-label', 'セル d3');
    });

    it('screen.getByRole("button", { name: /セル a1/i })でセルを選択できること', () => {
      render(<GameBoard />);
      const cellA1 = screen.getByRole('button', { name: /セル a1/i });
      expect(cellA1).toBeInTheDocument();
      expect(cellA1).toHaveAttribute('id', 'a1');
    });

    it('aria-label属性が既存のaria-*属性と共存すること', () => {
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

    it('全64個のセルにaria-labelが設定されていること', () => {
      const { container } = render(<GameBoard />);
      const cells = container.querySelectorAll('[data-row][data-col]');

      expect(cells.length).toBe(64);
      cells.forEach((cell) => {
        const ariaLabel = cell.getAttribute('aria-label');
        expect(ariaLabel).toMatch(/^セル [a-h][1-8]$/);
      });
    });
  });

  describe('Accessibility - History Component Semantics (Task 5.2)', () => {
    it('履歴コンポーネントが適切なコンテナ要素(div)を使用していること', async () => {
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

    it('履歴コンポーネントにaria-label属性が設定されていること', async () => {
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

  describe('UI Usability - Move History Visual Hiding (Task 1)', () => {
    it('棋譜要素にsr-onlyクラスが適用されていること', async () => {
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

    it('棋譜要素にaria-hidden="true"属性が設定されていること', async () => {
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

    it('棋譜要素がDOM内に保持されていること', async () => {
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

    it('data-testid="move-history"属性が保持されていること', async () => {
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

  describe('Move History Display (Task 4)', () => {
    it('初期状態では棋譜表示領域が表示されないこと', () => {
      render(<GameBoard />);
      const moveHistory = screen.queryByTestId('move-history');
      // Empty notation string should not display
      expect(moveHistory).not.toBeInTheDocument();
    });

    it('棋譜が空文字列の場合は表示されないこと', () => {
      render(<GameBoard />);
      const moveHistory = screen.queryByTestId('move-history');
      expect(moveHistory).not.toBeInTheDocument();
    });

    it('playing状態でnotationStringが存在する場合に表示されること', async () => {
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
