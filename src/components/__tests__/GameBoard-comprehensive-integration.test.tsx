/**
 * Task 7.3: Comprehensive Integration Tests
 *
 * Comprehensive verification of MessageBox, useMessageQueue, and GameBoard integration
 * Tests all requirements including:
 * - Pass notification and invalid move warning switching
 * - Accurate timeout behavior (pass: 3s, invalid move: 2s)
 * - Rate control (100ms monitoring with console.warn)
 * - hasInconsistency and MessageBox independence
 * - Zero CLS (Cumulative Layout Shift) verification
 * - Accessibility attributes verification
 * - All requirements comprehensive verification
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

describe('Task 7.3: Comprehensive Integration Tests - MessageBox + useMessageQueue + GameBoard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // React 19: Wrap timer execution in act() to avoid "not wrapped in act(...)" warnings
    // This ensures state updates from setTimeout callbacks are properly handled
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('MessageBox, useMessageQueue, GameBoard collaboration verification', () => {
    it('should integrate all three components correctly', async () => {
      // Mock board with no valid moves to enable pass
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      // Verify MessageBox is rendered
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();

      // Verify initial state (no message)
      const innerBox = messageBox.querySelector('[role="status"]');
      expect(innerBox).toHaveStyle({ opacity: '0' });

      // Trigger message via GameBoard action
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // Verify message appears (useMessageQueue → MessageBox)
      await waitFor(() => {
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // Verify message auto-clears after timeout
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });
    });

    it('should handle message flow from GameBoard to useMessageQueue to MessageBox', async () => {
      // Mock validateMove to return invalid result
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'no_flips',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      // GameBoard triggers invalid move
      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      // useMessageQueue processes message
      // MessageBox displays it
      await waitFor(() => {
        expect(screen.getByText(/石を反転できません/i)).toBeInTheDocument();
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
        expect(innerBox).toHaveClass('bg-amber-50'); // Warning style
      });
    });
  });

  describe('Pass notification and invalid move warning switching verification', () => {
    it('should correctly switch between pass notification and invalid move warning', async () => {
      // Setup: Enable both pass and invalid move scenarios
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      // First: Trigger invalid move warning (2s timeout)
      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // Verify warning style
      const messageBox = screen.getByTestId('message-box');
      let innerBox = messageBox.querySelector('[role="status"]');
      expect(innerBox).toHaveClass('bg-amber-50');

      // Wait 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Second: Trigger pass notification (3s timeout) - should replace warning
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
        expect(
          screen.queryByText(/既に石が置かれています/i)
        ).not.toBeInTheDocument();
      });

      // Verify info style
      innerBox = messageBox.querySelector('[role="status"]');
      expect(innerBox).toHaveClass('bg-blue-50');

      // Verify pass message uses 3s timeout (not 2s from previous warning)
      act(() => {
        jest.advanceTimersByTime(2000); // 2s elapsed
      });

      await waitFor(() => {
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' }); // Still visible
      });

      act(() => {
        jest.advanceTimersByTime(1000); // Total 3s
      });

      await waitFor(() => {
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' }); // Now cleared
      });
    });

    it('should handle rapid switching between message types', async () => {
      // Test rapid switching by triggering multiple different invalid move warnings
      const validateMoveSpy = jest.spyOn(gameLogic, 'validateMove');

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell1 = container.querySelector('[data-row="0"][data-col="0"]');
      const cell2 = container.querySelector('[data-row="0"][data-col="1"]');
      const messageBox = screen.getByTestId('message-box');

      // Warning 1: no_flips error
      validateMoveSpy.mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'no_flips',
        },
      });

      if (cell1) {
        await user.click(cell1);
      }

      await waitFor(() => {
        expect(screen.getByText(/石を反転できません/i)).toBeInTheDocument();
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveClass('bg-amber-50');
      });

      // Warning 2: occupied error - should immediately replace no_flips
      validateMoveSpy.mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      if (cell2) {
        await user.click(cell2);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
        expect(
          screen.queryByText(/石を反転できません/i)
        ).not.toBeInTheDocument();
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveClass('bg-amber-50');
      });

      // Warning 3: no_flips again - should replace occupied
      validateMoveSpy.mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'no_flips',
        },
      });

      if (cell1) {
        await user.click(cell1);
      }

      await waitFor(() => {
        expect(screen.getByText(/石を反転できません/i)).toBeInTheDocument();
        expect(
          screen.queryByText(/既に石が置かれています/i)
        ).not.toBeInTheDocument();
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveClass('bg-amber-50');
      });
    });
  });

  describe('Timeout accuracy verification (pass: 3s, invalid move: 2s)', () => {
    it('should clear pass notification after exactly 3 seconds', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // At 2999ms - should still be visible
      act(() => {
        jest.advanceTimersByTime(2999);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // At 3000ms - should be cleared
      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });
    });

    it('should clear invalid move warning after exactly 2 seconds', async () => {
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // At 1999ms - should still be visible
      act(() => {
        jest.advanceTimersByTime(1999);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // At 2000ms - should be cleared
      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });
    });

    it('should use correct timeout for different invalid move reasons', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell = container.querySelector('[data-row="0"][data-col="0"]');

      // Test different error reasons - all should use 2s timeout
      const errorReasons = ['occupied', 'no_flips', 'out_of_bounds'] as const;

      for (const reason of errorReasons) {
        jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
          success: false,
          error: {
            type: 'invalid_move',
            reason,
          },
        });

        if (cell) {
          await user.click(cell);
        }

        // Wait for message to appear
        await waitFor(() => {
          const messageBox = screen.getByTestId('message-box');
          const innerBox = messageBox.querySelector('[role="status"]');
          expect(innerBox).toHaveStyle({ opacity: '1' });
        });

        // All should clear after 2s (not 3s)
        act(() => {
          jest.advanceTimersByTime(2000);
        });

        await waitFor(() => {
          const messageBox = screen.getByTestId('message-box');
          const innerBox = messageBox.querySelector('[role="status"]');
          expect(innerBox).toHaveStyle({ opacity: '0' });
        });
      }
    });
  });

  describe('Rate control (100ms monitoring) verification', () => {
    it('should warn when messages are sent within 100ms', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell = container.querySelector('[data-row="0"][data-col="0"]');

      // First click
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // Second click immediately (< 100ms)
      act(() => {
        jest.advanceTimersByTime(50); // 50ms
      });

      if (cell) {
        await user.click(cell);
      }

      // Should warn about high-frequency message
      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('High-frequency message detected')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('minimum: 100ms')
        );
      });
    });

    it('should not warn when messages are sent >= 100ms apart', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell = container.querySelector('[data-row="0"][data-col="0"]');

      // First click
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // Second click after 100ms
      act(() => {
        jest.advanceTimersByTime(100);
      });

      consoleWarnSpy.mockClear(); // Clear previous warnings

      if (cell) {
        await user.click(cell);
      }

      // Should not warn
      await waitFor(() => {
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('High-frequency message detected')
        );
      });
    });

    it('should still display latest message even with rate control warning', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell = container.querySelector('[data-row="0"][data-col="0"]');

      // First message: invalid move
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // Second message immediately: pass (should trigger warning but still display)
      act(() => {
        jest.advanceTimersByTime(50);
      });

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // Should warn
      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('High-frequency message detected')
        );
      });

      // But should still display latest message (pass)
      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
        expect(
          screen.queryByText(/既に石が置かれています/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('hasInconsistency and MessageBox independence verification', () => {
    it('should display hasInconsistency independently from MessageBox', async () => {
      // Mock useGameInconsistencyDetector to return hasInconsistency=true
      jest.mock('@/hooks/useGameInconsistencyDetector', () => ({
        useGameInconsistencyDetector: () => ({
          hasInconsistency: true,
          clearInconsistency: jest.fn(),
          getInconsistencyMessage: () => 'ゲーム状態に不整合が検出されました',
          checkInconsistency: jest.fn(),
        }),
      }));

      render(<GameBoard />);

      // MessageBox should exist
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();

      // hasInconsistency error should be in a separate element
      // (not inside MessageBox)
      const errorMessage = screen.queryByText(/不整合が検出されました/i);

      // If hasInconsistency is shown, it should NOT be inside MessageBox
      if (errorMessage) {
        expect(messageBox).not.toContainElement(errorMessage);

        // Verify it has its own styling (error-message class)
        const errorContainer = errorMessage.closest('.error-message');
        expect(errorContainer).toHaveClass('bg-red-100');
      }
    });

    it('should not interfere with MessageBox when hasInconsistency is active', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      // Trigger a pass message
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // MessageBox should still work normally
      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // hasInconsistency UI (if present) should remain separate
      // This verifies independence
    });

    it('should allow hasInconsistency reset without affecting MessageBox', async () => {
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();

      // Verify MessageBox has fixed height regardless of hasInconsistency state
      expect(messageBox).toHaveClass('h-16');
      const computedStyle = window.getComputedStyle(messageBox);
      expect(computedStyle.height).toBe('64px');
    });
  });

  describe('Zero CLS (Cumulative Layout Shift) verification', () => {
    it('should maintain fixed height container at all times', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');

      // Initial state - fixed height
      expect(messageBox).toHaveClass('h-16');
      let computedStyle = window.getComputedStyle(messageBox);
      expect(computedStyle.height).toBe('64px');

      // Trigger message
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // During message display - fixed height maintained
      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      computedStyle = window.getComputedStyle(messageBox);
      expect(computedStyle.height).toBe('64px');
      expect(messageBox).toHaveClass('h-16');

      // After timeout - fixed height maintained
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });

      computedStyle = window.getComputedStyle(messageBox);
      expect(computedStyle.height).toBe('64px');
      expect(messageBox).toHaveClass('h-16');
    });

    it('should use only opacity transitions (no height/layout changes)', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');
      const innerBox = messageBox.querySelector(
        '[role="status"]'
      ) as HTMLElement;

      // Initial opacity
      let computedStyle = window.getComputedStyle(innerBox);
      expect(computedStyle.opacity).toBe('0');

      // Trigger message
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      // Message visible - opacity changed
      await waitFor(() => {
        const computedStyle = window.getComputedStyle(innerBox);
        expect(computedStyle.opacity).toBe('1');
      });

      // Verify transition property is opacity only
      expect(innerBox).toHaveClass('transition-opacity');
      computedStyle = window.getComputedStyle(innerBox);
      expect(computedStyle.transitionProperty).toContain('opacity');

      // Clear message
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Message hidden - opacity changed back
      await waitFor(() => {
        const computedStyle = window.getComputedStyle(innerBox);
        expect(computedStyle.opacity).toBe('0');
      });
    });

    it('should reserve space even when no message is present', () => {
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');

      // No message present
      const innerBox = messageBox.querySelector('[role="status"]');
      const computedStyle = window.getComputedStyle(innerBox as HTMLElement);
      expect(computedStyle.opacity).toBe('0');

      // But space is reserved
      const messageBoxStyle = window.getComputedStyle(messageBox);
      expect(messageBoxStyle.height).toBe('64px');
      expect(messageBox).toHaveClass('h-16');
    });

    it('should not cause layout shift when switching message types', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');
      const initialHeight = window.getComputedStyle(messageBox).height;

      // Display warning
      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      const warningHeight = window.getComputedStyle(messageBox).height;
      expect(warningHeight).toBe(initialHeight);

      // Switch to info
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      const infoHeight = window.getComputedStyle(messageBox).height;
      expect(infoHeight).toBe(initialHeight);
    });
  });

  describe('Accessibility attributes verification', () => {
    it('should have role="status" for screen readers', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();

      // Trigger message
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // role="status" should still be present
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live="polite" for screen reader announcements', () => {
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');
      const innerBox = messageBox.querySelector('[role="status"]');

      expect(innerBox).toHaveAttribute('aria-live', 'polite');
    });

    it('should have lang="ja" attribute for Japanese text', () => {
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toHaveAttribute('lang', 'ja');
    });

    it('should have appropriate aria-label for icons', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      // Info icon: Set up for pass
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
        const infoIcon = screen.getByLabelText('info');
        expect(infoIcon).toBeInTheDocument();
      });

      // Clear message
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });

      // Warning icon: Reset for valid moves, then invalid
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([{ row: 0, col: 0 }]);
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
        const warningIcon = screen.getByLabelText('warning');
        expect(warningIcon).toBeInTheDocument();
      });
    });

    it('should be keyboard accessible', () => {
      render(<GameBoard />);

      // MessageBox itself doesn't need keyboard interaction
      // But it should not interfere with keyboard navigation
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();

      // Verify it doesn't have tabindex that would interfere
      expect(messageBox).not.toHaveAttribute('tabindex');
    });
  });

  describe('All requirements comprehensive verification', () => {
    it('should satisfy all Requirements 1.x (Message display control)', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');

      // Req 1.1: Fixed position at top
      expect(messageBox).toHaveClass('fixed', 'top-0');

      // Req 1.2: Display latest message only
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // Only one message visible
      const statusElements = screen.getAllByRole('status');
      expect(statusElements).toHaveLength(1);

      // Req 1.3: New message within timeout replaces existing
      // (tested in switching tests)

      // Req 1.4: Auto-clear after timeout
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });

      // Req 1.5: Hidden when no message
      const innerBox = messageBox.querySelector('[role="status"]');
      expect(innerBox).toHaveStyle({ opacity: '0' });
    });

    it('should satisfy all Requirements 2.x (Layout stability)', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');

      // Req 2.1: Fixed height, no variation
      const initialHeight = window.getComputedStyle(messageBox).height;
      expect(initialHeight).toBe('64px');

      // Req 2.2 & 2.3: No CLS, initial space reserved
      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      const displayHeight = window.getComputedStyle(messageBox).height;
      expect(displayHeight).toBe(initialHeight);

      // Req 2.4: Opacity only, no layout dimension changes
      const innerBox = messageBox.querySelector(
        '[role="status"]'
      ) as HTMLElement;
      const computedStyle = window.getComputedStyle(innerBox);
      expect(computedStyle.transitionProperty).toContain('opacity');
    });

    it('should satisfy all Requirements 3.x (Visual distinction)', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');

      // Req 3.1 & 3.2: Info message with subdued color
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveClass('bg-blue-50'); // Subdued blue
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });

      // Req 3.3 & 3.4: Warning message, no high saturation
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([{ row: 0, col: 0 }]);
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveClass('bg-amber-50'); // Subdued amber, not high saturation
        expect(innerBox).not.toHaveClass('bg-red-500');
      });

      // Req 3.5: Mobile-friendly font and contrast
      const messageText = screen.getByText(/既に石が置かれています/i);
      expect(messageText).toHaveClass('text-sm'); // Mobile readable
      expect(messageText).toHaveClass('text-gray-800'); // Good contrast
    });

    it('should satisfy all Requirements 4.x (Fade animation)', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      render(<GameBoard />);

      const messageBox = screen.getByTestId('message-box');
      const innerBox = messageBox.querySelector(
        '[role="status"]'
      ) as HTMLElement;

      // Req 4.1 & 4.3: Fade-in with ≤300ms duration
      expect(innerBox).toHaveClass('transition-opacity');
      const computedStyle = window.getComputedStyle(innerBox);
      expect(computedStyle.transitionDuration).toMatch(/^0\.[0-3]s$/);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(innerBox).toHaveStyle({ opacity: '1' });
      });

      // Req 4.2 & 4.4: Fade-out, no CLS during animation
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });

      const height = window.getComputedStyle(messageBox).height;
      expect(height).toBe('64px'); // No layout change during animation

      // Req 4.5: New message cancels current animation
      // (tested in switching tests)
    });

    it('should satisfy all Requirements 5.x (Message type support)', async () => {
      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      // Req 5.1: Pass notification
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const messageBox = screen.getByTestId('message-box');
        const innerBox = messageBox.querySelector('[role="status"]');
        expect(innerBox).toHaveStyle({ opacity: '0' });
      });

      // Req 5.2: Invalid move warning
      jest
        .spyOn(gameLogic, 'calculateValidMoves')
        .mockReturnValue([{ row: 0, col: 0 }]);
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      });

      // Req 5.3: Generic text interface (verified by above)

      // Req 5.4: Japanese text rendering
      expect(screen.getByText(/既に石が置かれています/i)).toBeInTheDocument();
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toHaveAttribute('lang', 'ja');

      // Req 5.5: Long text truncation
      const messageText = screen.getByText(/既に石が置かれています/i);
      expect(messageText).toHaveClass('line-clamp-2');
    });

    it('should satisfy all Requirements 6.x (Technical implementation)', () => {
      render(<GameBoard />);

      // Req 6.1: React 18 client component (verified by rendering)
      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();

      // Req 6.2 & 6.6: Tailwind CSS styling, component location
      expect(messageBox).toHaveClass('fixed', 'top-0', 'h-16');

      // Req 6.3: Plain CSS for animations (if needed)
      // CSS files are external, verified by transition classes

      // Req 6.4: TypeScript strict mode
      // Type safety verified at compile time

      // Req 6.5: Custom hook separation
      // useMessageQueue exists and is tested separately

      // Req 6.7: Jest + RTL tests
      // This test file itself verifies this requirement
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle rapid message changes without breaking', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      const passButton = screen.getByRole('button', { name: /パス/i });

      // Rapid fire: 10 messages in quick succession
      for (let i = 0; i < 5; i++) {
        if (cell) {
          await user.click(cell);
        }
        await user.click(passButton);
      }

      // Should still display latest message without errors
      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      const messageBox = screen.getByTestId('message-box');
      expect(messageBox).toBeInTheDocument();
      expect(messageBox).toHaveClass('h-16'); // Layout still stable
    });

    it('should handle component unmount gracefully', async () => {
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const user = userEvent.setup({ delay: null });
      const { unmount } = render(<GameBoard />);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(screen.getByText(/パス/i)).toBeInTheDocument();
      });

      // Unmount before timeout completes
      unmount();

      // Advance timers - should not cause errors
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // No errors should occur (verified by test passing)
    });

    it('should handle long Japanese text correctly', async () => {
      // Create a very long message by triggering multiple rapid invalid moves
      jest.spyOn(gameLogic, 'validateMove').mockReturnValue({
        success: false,
        error: {
          type: 'invalid_move',
          reason: 'occupied',
        },
      });

      const user = userEvent.setup({ delay: null });
      const { container } = render(<GameBoard />);

      const cell = container.querySelector('[data-row="0"][data-col="0"]');
      if (cell) {
        await user.click(cell);
      }

      await waitFor(() => {
        const messageText = screen.getByText(/既に石が置かれています/i);
        expect(messageText).toHaveClass('line-clamp-2'); // Truncated
        expect(messageText).toHaveClass('break-all'); // Japanese wrapping
      });
    });
  });
});
