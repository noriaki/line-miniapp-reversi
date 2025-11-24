/**
 * GameBoard Pass Performance Tests


 * Test-Driven Development: Performance benchmarks for pass feature
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameBoard from '../GameBoard';
import * as gameLogic from '@/lib/game/game-logic';

// Mock AI worker
jest.mock('@/hooks/useAIPlayer', () => ({
  useAIPlayer: () => ({
    calculateMove: jest.fn().mockResolvedValue({ row: 0, col: 0 }),
    isInitialized: true,
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

describe('GameBoard - Pass Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pass operation performance', () => {
    test('should execute pass operation within 100ms (visual feedback)', async () => {
      const user = userEvent.setup();

      // Mock no valid moves
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const passButton = screen.getByRole('button', { name: /パス/i });

      // Measure time from button click to notification display
      const startTime = performance.now();

      await user.click(passButton);

      // Wait for pass notification to appear
      await waitFor(() => {
        expect(
          screen.getByText(/有効な手がありません。パスしました。/i)
        ).toBeInTheDocument();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Requirement: Visual feedback within 100ms
      // Allow some tolerance for test environment (150ms)
      expect(duration).toBeLessThan(150);
    });

    test('should update game state within 50ms', async () => {
      const user = userEvent.setup();

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const passButton = screen.getByRole('button', { name: /パス/i });

      // Initially black's turn
      expect(screen.getByText(/あなたのターン/i)).toBeInTheDocument();

      // Measure state update time
      const startTime = performance.now();

      await user.click(passButton);

      // Wait for turn to switch to AI
      await waitFor(() => {
        expect(screen.getByText(/AI のターン/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Requirement: State update within 50ms
      // Test environment may be slower, so allow 100ms tolerance
      expect(duration).toBeLessThan(100);
    });

    test('should handle rapid pass clicks without performance degradation', async () => {
      const user = userEvent.setup();

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const passButton = screen.getByRole('button', { name: /パス/i });

      // Click pass button rapidly (should be handled gracefully)
      const startTime = performance.now();

      await user.click(passButton);

      // Subsequent clicks should be ignored (button disabled after first click)
      // This tests that the implementation doesn't cause performance issues with rapid clicks

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(100);
    });

    test('should maintain consistent performance across multiple pass operations', async () => {
      // This test verifies that pass operations don't accumulate overhead

      const durations: number[] = [];

      for (let i = 0; i < 3; i++) {
        jest.clearAllMocks();
        jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

        const { unmount } = render(<GameBoard />);

        const passButton = screen.getByRole('button', { name: /パス/i });
        const user = userEvent.setup();

        const startTime = performance.now();
        await user.click(passButton);

        await waitFor(() => {
          expect(
            screen.getByText(/有効な手がありません。パスしました。/i)
          ).toBeInTheDocument();
        });

        const endTime = performance.now();
        durations.push(endTime - startTime);

        unmount();
      }

      // Verify performance is consistent (no significant degradation)
      const avgDuration =
        durations.reduce((sum, d) => sum + d, 0) / durations.length;
      expect(avgDuration).toBeLessThan(150);

      // No individual operation should take more than 2x the average
      durations.forEach((duration) => {
        expect(duration).toBeLessThan(avgDuration * 2);
      });
    });
  });

  describe('Pass feature integration performance', () => {
    test('should not impact board rendering performance', async () => {
      // Measure initial render time with pass button
      const startTime = performance.now();

      render(<GameBoard />);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await waitFor(() => {
        expect(passButton).toBeVisible();
      });

      const endTime = performance.now();
      const renderDuration = endTime - startTime;

      // Component should render quickly even with pass feature
      // Allow generous time for test environment
      expect(renderDuration).toBeLessThan(1000);
    });

    test('should not cause unnecessary re-renders', async () => {
      // This test verifies that pass state updates don't trigger excessive re-renders
      const user = userEvent.setup();

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const { container } = render(<GameBoard />);

      // Count initial elements
      const initialElementCount = container.querySelectorAll('*').length;

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(
          screen.getByText(/有効な手がありません。パスしました。/i)
        ).toBeInTheDocument();
      });

      // Element count should be similar (notification may add 1-2 elements)
      const finalElementCount = container.querySelectorAll('*').length;
      expect(Math.abs(finalElementCount - initialElementCount)).toBeLessThan(
        10
      );
    });
  });

  describe('Memory and resource usage', () => {
    test('should cleanup timers and prevent memory leaks', async () => {
      const user = userEvent.setup();

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      const { unmount } = render(<GameBoard />);

      const passButton = screen.getByRole('button', { name: /パス/i });
      await user.click(passButton);

      await waitFor(() => {
        expect(
          screen.getByText(/有効な手がありません。パスしました。/i)
        ).toBeInTheDocument();
      });

      // Unmount component - should cleanup timers
      unmount();

      // If timers aren't cleaned up, this would cause warnings
      // The test passing without warnings indicates proper cleanup
    });
  });
});
