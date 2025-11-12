/**
 * Integration Tests - Task 6: GameBoard + useGameErrorHandler Integration
 *
 * Tests the interaction between GameBoard and useGameErrorHandler:
 * - Pass message display timing (5 seconds)
 * - Timer reset on new pass operation
 * - No layout shift during message visibility toggle
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import GameBoard from '../GameBoard';
import * as gameLogic from '@/lib/game/game-logic';

// Mock useAIPlayer to avoid Worker issues in Jest
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 2, col: 3 }),
  }),
}));

// Mock useLiff hook
jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => ({
    isReady: true,
    error: null,
    isInClient: false,
    isLoggedIn: false,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('Integration Test: GameBoard + useGameErrorHandler - Message Display', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Mock board with no valid moves to enable pass button
    jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('パス操作後、メッセージが5秒間表示され自動消去されること (Requirements: 2.4, 3.2)', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<GameBoard />);

    // Pass button をクリック
    const passButton = container.querySelector('button[aria-label*="パス"]');
    expect(passButton).toBeInTheDocument();
    expect(passButton).toBeEnabled();

    if (passButton) {
      await user.click(passButton);
    }

    // メッセージが表示されること (opacity-100)
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-100');
      expect(messageElement?.textContent).toContain('パス');
    });

    // 4秒後もメッセージが表示されていること
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-100');
    });

    // 5秒後にメッセージが自動消去されること (opacity-0)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-0');
    });
  });

  it('メッセージ表示中に新しいパス操作が発生した場合、メッセージが更新されタイマーがリセットされること (Requirements: 2.5, 3.3)', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<GameBoard />);

    // First pass operation
    const passButton = container.querySelector('button[aria-label*="パス"]');
    expect(passButton).toBeEnabled();
    if (passButton) {
      await user.click(passButton);
    }

    // メッセージが表示されること
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-100');
    });

    // 3秒経過
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Second pass operation (while first message is still visible)
    if (passButton) {
      await user.click(passButton);
    }

    // メッセージが更新されていること (opacity-100 のまま)
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-100');
    });

    // 元のタイマーから4秒経過 (3秒 + 1秒)
    // リセットされていない場合は消えているはず
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      // タイマーがリセットされたので、まだ表示されているべき
      expect(messageElement).toHaveClass('opacity-100');
    });

    // 新しいタイマーから5秒後に消去されること
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-0');
    });
  });

  it('メッセージ表示/非表示切り替え時にレイアウトシフトが発生しないこと (Requirements: 2.4, 2.5, 3.2)', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<GameBoard />);

    // 初期状態のゲームボード位置を記録
    const gameBoard = container.querySelector(
      '.game-board, [data-testid="game-board"]'
    );
    const initialBoundingBox = gameBoard?.getBoundingClientRect();

    // メッセージ領域のコンテナを取得
    const messageContainer = container.querySelector('.h-16');
    expect(messageContainer).toBeInTheDocument();
    const initialContainerHeight =
      messageContainer?.getBoundingClientRect().height;

    // Pass button をクリック (メッセージ表示)
    const passButton = container.querySelector('button[aria-label*="パス"]');
    expect(passButton).toBeEnabled();
    if (passButton) {
      await user.click(passButton);
    }

    // メッセージが表示された後、レイアウトが変化していないことを確認
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-100');
    });

    const afterShowBoundingBox = gameBoard?.getBoundingClientRect();
    const afterShowContainerHeight =
      messageContainer?.getBoundingClientRect().height;

    // ゲームボードの位置が変化していないこと
    expect(afterShowBoundingBox?.top).toBe(initialBoundingBox?.top);
    expect(afterShowBoundingBox?.left).toBe(initialBoundingBox?.left);
    expect(afterShowBoundingBox?.width).toBe(initialBoundingBox?.width);
    expect(afterShowBoundingBox?.height).toBe(initialBoundingBox?.height);

    // メッセージコンテナの高さが固定されていること
    expect(afterShowContainerHeight).toBe(initialContainerHeight);

    // 5秒後にメッセージが非表示になる
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-0');
    });

    const afterHideBoundingBox = gameBoard?.getBoundingClientRect();
    const afterHideContainerHeight =
      messageContainer?.getBoundingClientRect().height;

    // メッセージ非表示後もゲームボードの位置が変化していないこと
    expect(afterHideBoundingBox?.top).toBe(initialBoundingBox?.top);
    expect(afterHideBoundingBox?.left).toBe(initialBoundingBox?.left);
    expect(afterHideBoundingBox?.width).toBe(initialBoundingBox?.width);
    expect(afterHideBoundingBox?.height).toBe(initialBoundingBox?.height);

    // メッセージコンテナの高さが固定されたまま
    expect(afterHideContainerHeight).toBe(initialContainerHeight);
  });

  it('メッセージ領域が常に固定高さを保持すること (Snapshot Test for Layout Stability)', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<GameBoard />);

    // メッセージ領域のコンテナ構造をスナップショット
    const messageContainer = container.querySelector('.h-16');
    expect(messageContainer).toBeInTheDocument();

    // Snapshot: 初期状態
    expect(messageContainer).toMatchSnapshot('message-container-initial');

    // Pass button をクリック
    const passButton = container.querySelector('button[aria-label*="パス"]');
    expect(passButton).toBeEnabled();
    if (passButton) {
      await user.click(passButton);
    }

    // メッセージが表示されるのを待つ
    await waitFor(() => {
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-100');
    });

    // Snapshot: メッセージ表示状態 (構造は同じ、opacity のみ変化)
    expect(messageContainer).toMatchSnapshot('message-container-visible');
  });
});
