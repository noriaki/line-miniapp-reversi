/**
 * GameBoard Component Tests - Message Layout Shift Prevention
 * Phase 2: Tests for MessageBox-based unified message display
 * Legacy notification-message removed
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

describe('GameBoard - Message Layout Shift Prevention (Phase 2)', () => {
  describe('MessageBox fixed height', () => {
    it('should use MessageBox for message display', () => {
      render(<GameBoard />);

      // MessageBox should be present
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();
    });

    it('should have MessageBox with fixed height', () => {
      const { container } = render(<GameBoard />);

      // MessageBox has fixed height via inline style
      const messageBox = container.querySelector('[data-testid="message-box"]');
      expect(messageBox).toHaveAttribute('style', 'height: 64px;');
    });

    it('should not have legacy notification-message element', () => {
      const { container } = render(<GameBoard />);

      // Legacy notification-message should not exist after Phase 2
      const legacyMessageElement = container.querySelector(
        '.notification-message'
      );
      expect(legacyMessageElement).not.toBeInTheDocument();
    });

    it('should not have legacy h-16 notification container', () => {
      const { container } = render(<GameBoard />);

      // Legacy h-16 container with notification-message should not exist
      const legacyContainer = container.querySelector(
        '.h-16 .notification-message'
      );
      expect(legacyContainer).not.toBeInTheDocument();
    });
  });

  describe('Opacity-based visibility', () => {
    it('should show message in MessageBox when pass notification triggered', async () => {
      // Mock to simulate pass notification
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const { container } = render(<GameBoard />);

      // Trigger pass operation to show message
      const passButton = screen.getByRole('button', {
        name: /ターンをパスする/i,
      });

      await userEvent.click(passButton);

      // Wait for the message to appear in MessageBox
      await waitFor(() => {
        const messageBox = container.querySelector(
          '[data-testid="message-box"]'
        );
        const innerBox = messageBox?.querySelector('[role="status"]');
        // Check that opacity is 1 (inline style)
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });
    });

    it('should hide MessageBox when no message is present', () => {
      const { container } = render(<GameBoard />);

      const messageBox = container.querySelector('[data-testid="message-box"]');
      const innerBox = messageBox?.querySelector('[role="status"]');

      // No message, so opacity should be 0
      expect(innerBox).toHaveStyle({ opacity: '0' });
    });
  });

  describe('No layout shift on message state change', () => {
    it('should not change game board position before and after message display', async () => {
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
      await userEvent.click(passButton);

      // Get board position after pass
      const rectAfter = boardGrid?.getBoundingClientRect();

      // Positions should be identical (no layout shift)
      expect(rectAfter?.top).toBe(rectBefore?.top);
      expect(rectAfter?.left).toBe(rectBefore?.left);
      expect(rectAfter?.height).toBe(rectBefore?.height);
      expect(rectAfter?.width).toBe(rectBefore?.width);
    });

    it('should maintain MessageBox height regardless of message presence', () => {
      const { container, rerender } = render(<GameBoard />);

      const messageBox = container.querySelector('[data-testid="message-box"]');
      const heightBefore = messageBox?.getBoundingClientRect().height;

      // Re-render
      rerender(<GameBoard />);

      const heightAfter = messageBox?.getBoundingClientRect().height;

      // Height should remain constant
      expect(heightAfter).toBe(heightBefore);
    });
  });

  describe('MessageBox styling', () => {
    it('should use inline style for fixed height', () => {
      const { container } = render(<GameBoard />);

      const messageBox = container.querySelector('[data-testid="message-box"]');
      expect(messageBox).toHaveAttribute('style', 'height: 64px;');
    });

    it('should show invalid move warning in MessageBox', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({
          success: false,
          error: { type: 'invalid_move', reason: 'occupied' },
        });

      render(<GameBoard />);

      // Click on an occupied cell
      const cell = screen.getAllByRole('button')[27];
      await userEvent.click(cell);

      // Message should appear in MessageBox
      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        expect(messageBox).toHaveTextContent(
          'そのマスには既に石が置かれています'
        );
      });

      mockValidateMove.mockRestore();
    });
  });
});
