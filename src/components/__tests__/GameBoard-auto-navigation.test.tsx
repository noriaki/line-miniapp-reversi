import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../GameBoard';
import * as gameLogic from '@/lib/game/game-logic';
import { encodeMoves } from '@/lib/share/move-encoder';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

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
    isLoggedIn: null,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock move-encoder
jest.mock('@/lib/share/move-encoder', () => ({
  encodeMoves: jest.fn().mockReturnValue('testEncodedMoves'),
}));

// Get access to the mocked encodeMoves function
const mockEncodeMoves = encodeMoves as jest.MockedFunction<typeof encodeMoves>;

describe('GameBoard Auto Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Game End Detection and Navigation', () => {
    it('should navigate to result page 500ms after game ends', async () => {
      // Setup: Mock game ending scenario
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      // Mock calculateValidMoves to return empty arrays (game over)
      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      // Trigger a move that ends the game
      const cell = screen.getAllByRole('button')[20];
      await act(async () => {
        cell.click();
      });

      // Game should be finished
      await waitFor(() => {
        expect(screen.getByText(/ゲーム終了/)).toBeInTheDocument();
      });

      // Navigation should not happen immediately
      expect(mockPush).not.toHaveBeenCalled();

      // Advance timer by 500ms
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Navigation should happen after 500ms
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringMatching(/^\/r\/b\//)
        );
      });

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });

    it('should include encoded moves in navigation URL', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const cell = screen.getAllByRole('button')[20];
      await act(async () => {
        cell.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/ゲーム終了/)).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/r/b/testEncodedMoves');
      });

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });

    it('should use "b" as side parameter for player (black)', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const cell = screen.getAllByRole('button')[20];
      await act(async () => {
        cell.click();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/r/b/'));
      });

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });
  });

  describe('NavigationFallback Integration', () => {
    it('should show NavigationFallback component when game ends', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const cell = screen.getAllByRole('button')[20];
      await act(async () => {
        cell.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/ゲーム終了/)).toBeInTheDocument();
      });

      // NavigationFallback container should be present
      await waitFor(() => {
        expect(
          screen.getByTestId('navigation-fallback-container')
        ).toBeInTheDocument();
      });

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });

    it('should show fallback button after 2 second timeout', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const cell = screen.getAllByRole('button')[20];
      await act(async () => {
        cell.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/ゲーム終了/)).toBeInTheDocument();
      });

      // Button should not be visible before 2 seconds
      expect(
        screen.queryByTestId('navigation-fallback-button')
      ).not.toBeInTheDocument();

      // Advance timer by 2000ms
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Button should be visible after 2 seconds
      await waitFor(() => {
        expect(
          screen.getByTestId('navigation-fallback-button')
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', { name: /結果を確認する/i })
      ).toBeInTheDocument();

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });
  });

  describe('Existing UI Removal', () => {
    it('should not display reset button when game ends', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const cell = screen.getAllByRole('button')[20];
      await act(async () => {
        cell.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/ゲーム終了/)).toBeInTheDocument();
      });

      // Old "新しいゲームを開始" button should NOT be present
      expect(
        screen.queryByRole('button', { name: /新しいゲームを開始/i })
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/新しいゲームを開始/i)).not.toBeInTheDocument();

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });

    it('should not display game-result test id element with old UI', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const cell = screen.getAllByRole('button')[20];
      await act(async () => {
        cell.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/ゲーム終了/)).toBeInTheDocument();
      });

      // Old game-result element should not exist
      expect(screen.queryByTestId('game-result')).not.toBeInTheDocument();

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });
  });

  describe('Move History Conversion', () => {
    it('should convert chess notation to Position array for encoding', async () => {
      const mockValidateMove = jest
        .spyOn(gameLogic, 'validateMove')
        .mockReturnValue({ success: true, value: true });

      const mockApplyMove = jest.spyOn(gameLogic, 'applyMove').mockReturnValue({
        success: true,
        value: [
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, 'black', 'black', null, null, null],
          [null, null, null, 'white', 'black', null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
          [null, null, null, null, null, null, null, null],
        ],
      });

      jest.spyOn(gameLogic, 'calculateValidMoves').mockReturnValue([]);

      render(<GameBoard />);

      const cell = screen.getAllByRole('button')[20]; // row=2, col=4 = "e3"
      await act(async () => {
        cell.click();
      });

      await waitFor(() => {
        expect(screen.getByText(/ゲーム終了/)).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // encodeMoves should have been called with Position array
      await waitFor(() => {
        expect(mockEncodeMoves).toHaveBeenCalled();
        const callArg = mockEncodeMoves.mock.calls[0][0];
        expect(Array.isArray(callArg)).toBe(true);
        // Should have at least one move
        expect(callArg.length).toBeGreaterThan(0);
        // Each move should be a Position object
        expect(callArg[0]).toHaveProperty('row');
        expect(callArg[0]).toHaveProperty('col');
      });

      mockValidateMove.mockRestore();
      mockApplyMove.mockRestore();
    });
  });
});
