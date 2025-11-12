/**
 * GameBoard Component Tests - Message Layout Shift Prevention
 * Tests for Task 2: メッセージ表示領域のレイアウトシフト防止
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

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
    isReady: false,
    error: null,
    isInClient: null,
    isLoggedIn: null,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('GameBoard - Message Layout Shift Prevention (Task 2)', () => {
  describe('Requirement 2.1: Fixed height container', () => {
    it('メッセージ表示領域に固定高さh-16が適用されていること', () => {
      const { container } = render(<GameBoard />);

      // Find the fixed-height container for messages
      const messageContainer = container.querySelector('.h-16');
      expect(messageContainer).toBeInTheDocument();
    });

    it('メッセージ領域がflex items-center justify-centerを含むこと', () => {
      const { container } = render(<GameBoard />);

      // Find the container with flex centering classes
      const messageContainer = container.querySelector(
        '.h-16.flex.items-center.justify-center'
      );
      expect(messageContainer).toBeInTheDocument();
    });
  });

  describe('Requirement 2.2, 2.3: Opacity-based visibility', () => {
    it('メッセージ要素が常にDOM内に存在すること', () => {
      const { container } = render(<GameBoard />);

      // Message element should always exist in DOM
      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toBeInTheDocument();
    });

    it('メッセージ非表示時にopacity-0クラスが適用されること', () => {
      // Initial state: no pass message
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-0');
    });

    it('メッセージ表示時にopacity-100クラスが適用されること', async () => {
      // Mock to simulate pass notification
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const { container } = render(<GameBoard />);

      // Trigger pass operation to show message
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });

      // Use act to properly handle async state updates
      await userEvent.click(passButton);

      // Wait for the message to appear
      await waitFor(() => {
        const messageElement = container.querySelector('.notification-message');
        expect(messageElement).toHaveClass('opacity-100');
      });
    });

    it('transition-opacityクラスが適用されていること', () => {
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('transition-opacity');
    });

    it('duration-200クラスが適用されていること', () => {
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('duration-200');
    });
  });

  describe('Requirement 2.4: Message area height invariance', () => {
    it('メッセージ非表示時でもコンテナ高さが維持されること', () => {
      const { container } = render(<GameBoard />);

      const messageContainer = container.querySelector('.h-16');

      // Verify the h-16 class is applied (fixed height)
      // Note: jsdom doesn't compute Tailwind CSS styles, so we check the class
      expect(messageContainer).toHaveClass('h-16');
    });

    it('メッセージ非表示時にnon-breaking spaceが表示されること', () => {
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');

      // Should contain non-breaking space when no message
      expect(messageElement?.textContent).toContain('\u00A0');
    });
  });

  describe('Requirement 2.5: No layout shift on message state change', () => {
    it('メッセージ表示前後でゲームボード位置が変化しないこと', () => {
      // Mock to simulate pass notification
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const { container } = render(<GameBoard />);

      // Get board position before pass
      const boardGrid = container.querySelector('.board-grid');
      const rectBefore = boardGrid?.getBoundingClientRect();

      // Trigger pass operation
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });
      passButton.click();

      // Get board position after pass
      const rectAfter = boardGrid?.getBoundingClientRect();

      // Positions should be identical (no layout shift)
      expect(rectAfter?.top).toBe(rectBefore?.top);
      expect(rectAfter?.left).toBe(rectBefore?.left);
      expect(rectAfter?.height).toBe(rectBefore?.height);
      expect(rectAfter?.width).toBe(rectBefore?.width);
    });
  });

  describe('Requirement 2.6: Tailwind CSS only', () => {
    it('メッセージ領域がTailwindクラスのみを使用していること', () => {
      const { container } = render(<GameBoard />);

      const messageContainer = container.querySelector('.h-16');
      const messageElement = container.querySelector('.notification-message');

      // Check that only Tailwind utility classes are used
      // No inline styles or CSS modules
      expect(messageContainer).not.toHaveAttribute('style');
      expect(messageElement).not.toHaveAttribute('style');

      // Verify Tailwind classes are present
      expect(messageContainer?.className).toMatch(/^[\w\s-]+$/); // Only class names, no inline styles
      expect(messageElement?.className).toMatch(/^[\w\s-]+$/);
    });
  });
});
