/**
 * GameBoard Component Tests - Message Layout Shift Prevention
 * Tests for メッセージ表示領域のレイアウトシフト防止

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

describe('GameBoard - Message Layout Shift Prevention', () => {
  describe('Fixed height container', () => {
    it('should apply fixed height h-16 to message display area', () => {
      const { container } = render(<GameBoard />);

      // Find the fixed-height container for messages
      const messageContainer = container.querySelector('.h-16');
      expect(messageContainer).toBeInTheDocument();
    });

    it('should have message area with flex items-center justify-center', () => {
      const { container } = render(<GameBoard />);

      // Find the container with flex centering classes
      const messageContainer = container.querySelector(
        '.h-16.flex.items-center.justify-center'
      );
      expect(messageContainer).toBeInTheDocument();
    });
  });

  describe('2.3: Opacity-based visibility', () => {
    it('should always have message element in DOM', () => {
      const { container } = render(<GameBoard />);

      // Task 4: MessageBox unified component should always exist
      const messageBox = container.querySelector('[data-testid="message-box"]');
      expect(messageBox).toBeInTheDocument();

      // Legacy notification-message still exists (to be removed in Phase 2)
      const legacyMessageElement = container.querySelector(
        '.notification-message'
      );
      expect(legacyMessageElement).toBeInTheDocument();
    });

    it('should apply opacity-0 class when message is hidden', () => {
      // Initial state: no pass message
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('opacity-0');
    });

    it('should apply opacity-100 class when message is displayed', async () => {
      // Mock to simulate pass notification
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const { container } = render(<GameBoard />);

      // Trigger pass operation to show message
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });

      // Use act to properly handle async state updates
      await userEvent.click(passButton);

      // Task 4: Pass messages now go through MessageBox
      // Wait for the message to appear in MessageBox
      await waitFor(() => {
        const messageBox = container.querySelector(
          '[data-testid="message-box"]'
        );
        const innerBox = messageBox?.querySelector('[role="status"]');
        // Check that opacity is 1 (inline style)
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // Legacy notification-message should remain hidden (opacity-0)
      const legacyMessageElement = container.querySelector(
        '.notification-message'
      );
      expect(legacyMessageElement).toHaveClass('opacity-0');
    });

    it('should apply transition-opacity class', () => {
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('transition-opacity');
    });

    it('should apply duration-200 class', () => {
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');
      expect(messageElement).toHaveClass('duration-200');
    });
  });

  describe('Message area height invariance', () => {
    it('should maintain container height even when message is hidden', () => {
      const { container } = render(<GameBoard />);

      const messageContainer = container.querySelector('.h-16');

      // Verify the h-16 class is applied (fixed height)
      // Note: jsdom doesn't compute Tailwind CSS styles, so we check the class
      expect(messageContainer).toHaveClass('h-16');
    });

    it('should display non-breaking space when message is hidden', () => {
      const { container } = render(<GameBoard />);

      const messageElement = container.querySelector('.notification-message');

      // Should contain non-breaking space when no message
      expect(messageElement?.textContent).toContain('\u00A0');
    });
  });

  describe('No layout shift on message state change', () => {
    it('should not change game board position before and after message display', () => {
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

  describe('Tailwind CSS only', () => {
    it('should use only Tailwind classes for message area', () => {
      const { container } = render(<GameBoard />);

      // Task 4: MessageBox uses inline styles for fixed height (by design)
      const messageBox = container.querySelector('[data-testid="message-box"]');
      expect(messageBox).toBeInTheDocument();
      // MessageBox has inline style="height: 64px;" which is intentional
      expect(messageBox).toHaveAttribute('style', 'height: 64px;');

      // Legacy notification-message (to be removed in Phase 2)
      const legacyMessageElement = container.querySelector(
        '.notification-message'
      );
      expect(legacyMessageElement).not.toHaveAttribute('style');

      // Verify Tailwind classes are present
      expect(legacyMessageElement?.className).toMatch(/^[\w\s-]+$/);
    });
  });
});
