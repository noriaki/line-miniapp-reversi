/**
 * Game State Hook Tests

 * Test-Driven Development: Tests written BEFORE implementation
 */

import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';
import type { GameStatus } from '@/lib/game/types';

describe('useGameState', () => {
  describe('RED: Basic game state management', () => {
    it('should initialize with default game state', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.currentPlayer).toBe('black');
      expect(result.current.gameStatus).toEqual({ type: 'playing' });
      expect(result.current.isAIThinking).toBe(false);
      expect(result.current.board).toHaveLength(8);
      expect(result.current.validMoves.length).toBeGreaterThan(0);
    });

    it('should switch player from black to white', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.currentPlayer).toBe('black');

      act(() => {
        result.current.switchPlayer();
      });

      expect(result.current.currentPlayer).toBe('white');
    });

    it('should switch player from white to black', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.switchPlayer();
      });

      expect(result.current.currentPlayer).toBe('white');

      act(() => {
        result.current.switchPlayer();
      });

      expect(result.current.currentPlayer).toBe('black');
    });

    it('should update game status', () => {
      const { result } = renderHook(() => useGameState());

      const newStatus: GameStatus = { type: 'finished', winner: 'black' };

      act(() => {
        result.current.updateGameStatus(newStatus);
      });

      expect(result.current.gameStatus).toEqual(newStatus);
    });

    it('should reset game to initial state', () => {
      const { result } = renderHook(() => useGameState());

      // Modify state
      act(() => {
        result.current.switchPlayer();
        result.current.updateGameStatus({ type: 'finished', winner: 'white' });
        result.current.setAIThinking(true);
      });

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.currentPlayer).toBe('black');
      expect(result.current.gameStatus).toEqual({ type: 'playing' });
      expect(result.current.isAIThinking).toBe(false);
    });
  });

  describe('RED: Consecutive pass count management', () => {
    it('should initialize consecutivePassCount to 0', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should increment consecutivePassCount by 1 when incrementPassCount is called', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.consecutivePassCount).toBe(0);

      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(1);

      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(2);
    });

    it('should reset consecutivePassCount to 0 when resetPassCount is called', () => {
      const { result } = renderHook(() => useGameState());

      // Increment count first
      act(() => {
        result.current.incrementPassCount();
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(2);

      // Reset
      act(() => {
        result.current.resetPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should reset consecutivePassCount to 0 when resetGame is called', () => {
      const { result } = renderHook(() => useGameState());

      // Increment count
      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(1);

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should ensure consecutivePassCount stays within 0-2 range', () => {
      const { result } = renderHook(() => useGameState());

      // Test upper bound
      act(() => {
        result.current.incrementPassCount();
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(2);

      // Additional increments should not exceed 2 (game should end at 2)
      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);

      // Test lower bound after reset
      act(() => {
        result.current.resetPassCount();
      });

      expect(result.current.consecutivePassCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('RED: Move history management', () => {
    it('should initialize moveHistory as empty array and notationString as empty string', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.moveHistory).toEqual([]);
      expect(result.current.notationString).toBe('');
    });

    it('should add move to history when updateBoard is called with lastMove', () => {
      const { result } = renderHook(() => useGameState());

      // Create a mock new board (exact content doesn't matter for this test)
      const newBoard = result.current.board;

      // Update board with a move at position (4, 5) which should convert to "f5"
      act(() => {
        result.current.updateBoard(newBoard, { row: 4, col: 5 });
      });

      expect(result.current.moveHistory).toEqual(['f5']);
      expect(result.current.notationString).toBe('f5');
    });

    it('should record multiple consecutive moves in correct order', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;

      // First move: black at f5
      act(() => {
        result.current.updateBoard(newBoard, { row: 4, col: 5 });
      });

      expect(result.current.moveHistory).toEqual(['f5']);

      // Second move: white at f6
      act(() => {
        result.current.updateBoard(newBoard, { row: 5, col: 5 });
      });

      expect(result.current.moveHistory).toEqual(['f5', 'f6']);

      // Third move: black at e6
      act(() => {
        result.current.updateBoard(newBoard, { row: 5, col: 4 });
      });

      expect(result.current.moveHistory).toEqual(['f5', 'f6', 'e6']);
      expect(result.current.notationString).toBe('f5f6e6');
    });

    it('should not record move when updateBoard is called without lastMove (pass)', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;

      // First move with position
      act(() => {
        result.current.updateBoard(newBoard, { row: 4, col: 5 });
      });

      expect(result.current.moveHistory).toEqual(['f5']);

      // Pass (updateBoard without lastMove)
      act(() => {
        result.current.updateBoard(newBoard);
      });

      // History should not change
      expect(result.current.moveHistory).toEqual(['f5']);
      expect(result.current.notationString).toBe('f5');
    });

    it('should reset moveHistory and notationString when resetGame is called', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;

      // Add some moves
      act(() => {
        result.current.updateBoard(newBoard, { row: 4, col: 5 });
        result.current.updateBoard(newBoard, { row: 5, col: 5 });
        result.current.updateBoard(newBoard, { row: 5, col: 4 });
      });

      expect(result.current.moveHistory).toEqual(['f5', 'f6', 'e6']);
      expect(result.current.notationString).toBe('f5f6e6');

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.moveHistory).toEqual([]);
      expect(result.current.notationString).toBe('');
    });

    it('should update notationString reactively when moveHistory changes', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;

      // Initially empty
      expect(result.current.notationString).toBe('');

      // Add first move
      act(() => {
        result.current.updateBoard(newBoard, { row: 4, col: 5 });
      });

      expect(result.current.notationString).toBe('f5');

      // Add second move
      act(() => {
        result.current.updateBoard(newBoard, { row: 5, col: 5 });
      });

      expect(result.current.notationString).toBe('f5f6');

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.notationString).toBe('');
    });
  });
});
