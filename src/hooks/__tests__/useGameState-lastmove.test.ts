/**
 * Last Move State Management Tests
 * Feature: last-move-highlight
 * lastMove state management
 * Test-Driven Development: Tests written BEFORE implementation
 */

import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';

describe('useGameState - lastMove management', () => {
  describe('lastMove state initialization', () => {
    it('should initialize lastMove as null', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.lastMove).toBeNull();
    });

    it('should have lastMove property in returned state', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current).toHaveProperty('lastMove');
    });
  });

  describe('updateBoard with lastMove parameter', () => {
    it('should update lastMove when updateBoard is called with position', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;
      const position = { row: 4, col: 5 };

      act(() => {
        result.current.updateBoard(newBoard, position);
      });

      expect(result.current.lastMove).toEqual(position);
    });

    it('should update lastMove with different positions on consecutive calls', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;
      const firstPosition = { row: 4, col: 5 };
      const secondPosition = { row: 5, col: 4 };

      // First move
      act(() => {
        result.current.updateBoard(newBoard, firstPosition);
      });

      expect(result.current.lastMove).toEqual(firstPosition);

      // Second move - should replace previous lastMove
      act(() => {
        result.current.updateBoard(newBoard, secondPosition);
      });

      expect(result.current.lastMove).toEqual(secondPosition);
    });

    it('should not change lastMove when updateBoard is called without position (backward compatibility)', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;

      // Initial state
      expect(result.current.lastMove).toBeNull();

      // Update board without position (pass operation)
      act(() => {
        result.current.updateBoard(newBoard);
      });

      // lastMove should remain null
      expect(result.current.lastMove).toBeNull();
    });

    it('should preserve lastMove when updateBoard is called without position after a move', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;
      const position = { row: 4, col: 5 };

      // First move with position
      act(() => {
        result.current.updateBoard(newBoard, position);
      });

      expect(result.current.lastMove).toEqual(position);

      // Update board without position (pass)
      act(() => {
        result.current.updateBoard(newBoard);
      });

      // lastMove should be preserved
      expect(result.current.lastMove).toEqual(position);
    });
  });

  describe('resetGame clears lastMove', () => {
    it('should reset lastMove to null when resetGame is called', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;
      const position = { row: 4, col: 5 };

      // Set a lastMove
      act(() => {
        result.current.updateBoard(newBoard, position);
      });

      expect(result.current.lastMove).toEqual(position);

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      // lastMove should be cleared
      expect(result.current.lastMove).toBeNull();
    });

    it('should keep lastMove as null after resetGame even if new moves are not made', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;
      const position = { row: 4, col: 5 };

      // Set a lastMove
      act(() => {
        result.current.updateBoard(newBoard, position);
      });

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.lastMove).toBeNull();

      // Update board without position
      act(() => {
        result.current.updateBoard(result.current.board);
      });

      // lastMove should still be null
      expect(result.current.lastMove).toBeNull();
    });
  });

  describe('RED: Integration - lastMove with existing state', () => {
    it('should update lastMove independently of other state changes', () => {
      const { result } = renderHook(() => useGameState());

      const newBoard = result.current.board;
      const position = { row: 4, col: 5 };

      // Update board and switch player
      act(() => {
        result.current.updateBoard(newBoard, position);
        result.current.switchPlayer();
      });

      expect(result.current.lastMove).toEqual(position);
      expect(result.current.currentPlayer).toBe('white');
    });

    it('should maintain lastMove type safety (Position | null)', () => {
      const { result } = renderHook(() => useGameState());

      // Initial state - null
      expect(result.current.lastMove).toBeNull();

      const newBoard = result.current.board;
      const position = { row: 0, col: 0 };

      // After move - Position type
      act(() => {
        result.current.updateBoard(newBoard, position);
      });

      expect(result.current.lastMove).not.toBeNull();
      expect(result.current.lastMove).toHaveProperty('row');
      expect(result.current.lastMove).toHaveProperty('col');
      expect(result.current.lastMove?.row).toBe(0);
      expect(result.current.lastMove?.col).toBe(0);
    });
  });
});
