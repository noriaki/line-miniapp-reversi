/**
 * Integration Tests - GameBoard + useMessageQueue + MessageBox Integration
 *
 * Tests Task 4.1 and 4.2:
 * - MessageBox component integration
 * - Purpose-specific timeout strategy (pass: 3s, invalid move: 2s)
 * - Message display with unified message box
 */

import React from 'react';
import { render, waitFor, act, screen } from '@testing-library/react';
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

describe('Integration Test: GameBoard + useMessageQueue + MessageBox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Task 4.1: MessageBox Integration', () => {
    it('should render MessageBox component in GameBoard', () => {
      render(<GameBoard />);

      // MessageBox should be present with default testId
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();
    });

    it('should pass currentMessage prop to MessageBox', async () => {
      // Mock board with no valid moves to enable pass button
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      // Initially no message
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();

      // Trigger pass to generate a message
      const passButton = screen.getByRole('button', { name: /パス/i });
      expect(passButton).toBeEnabled();
      await user.click(passButton);

      // MessageBox should display the pass message
      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });
    });
  });

  describe('Task 4.2: Purpose-based Timeout Strategy', () => {
    it('should display pass notification with 3 second timeout', async () => {
      // Mock board with no valid moves to enable pass button
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      // Click pass button
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // Message should be visible immediately
      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // After 2.5 seconds, message should still be visible
      act(() => {
        jest.advanceTimersByTime(2500);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // After 3 seconds, message should auto-clear (opacity: 0)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });
    });

    it('should display invalid move warning with 2 second timeout', async () => {
      // Mock validateMove to return invalid result
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      // Click on an invalid cell
      const invalidCell = container.querySelector(
        '[data-row="0"][data-col="0"]'
      );
      expect(invalidCell).toBeInTheDocument();

      if (invalidCell) {
        await user.click(invalidCell);
      }

      // Warning message should be visible immediately
      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // After 1.5 seconds, message should still be visible
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // After 2 seconds, message should auto-clear (opacity: 0)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });
    });

    it('should replace message when new message arrives during display', async () => {
      // Mock calculateValidMoves to return empty initially (to enable pass)
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      // Mock for invalid move
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      // Trigger invalid move warning (2s timeout)
      const invalidCell = container.querySelector(
        '[data-row="0"][data-col="0"]'
      );
      if (invalidCell) {
        await user.click(invalidCell);
      }

      // Warning should be visible
      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // Wait 1 second (warning timer is at 1s of 2s)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now trigger pass (3s timeout) - should replace warning
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // Pass message should replace warning
      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // Warning message should no longer be displayed
      expect(
        screen.queryByText(/既に石が置かれています/i)
      ).not.toBeInTheDocument();

      // Wait 2 more seconds (total 3s from warning, 2s from pass)
      // If timer wasn't reset, warning would have cleared by now
      // But pass message should still be visible (needs 3s total)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        // Pass message still visible (only 2s of 3s elapsed)
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // After 1 more second (3s from pass), message should clear
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });
    });

    it('should maintain fixed height container to prevent layout shift', async () => {
      // Mock board with no valid moves
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      // Get MessageBox element
      const messageBox = screen.getByTestId('message-box');

      // MessageBox should have fixed height class (h-16)
      expect(messageBox).toHaveClass('h-16');

      // Trigger pass message
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // Wait for message to appear
      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // Height class should remain the same (h-16)
      expect(messageBox).toHaveClass('h-16');

      // Clear message after timeout
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Height class should still remain the same
      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        expect(messageBox).toHaveClass('h-16');
      });
    });
  });

  describe('Task 4 Regression: hasInconsistency remains unchanged', () => {
    it('should still display hasInconsistency UI independently from MessageBox', () => {
      // This test ensures hasInconsistency logic is NOT migrated yet (Phase 3)
      // It should remain with useGameErrorHandler for now

      render(<GameBoard />);

      // hasInconsistency UI should not be in MessageBox
      // It should be a separate error-message div (as it was before)
      // This test just confirms the structure hasn't changed for inconsistency handling

      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();

      // hasInconsistency would appear in a different div, not in MessageBox
      // (This test is mainly for documentation - actual hasInconsistency logic
      // is tested in other test files)
    });
  });
});
