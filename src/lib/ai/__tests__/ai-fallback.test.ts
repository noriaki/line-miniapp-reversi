/**
 * AI Fallback Logic Tests
 * Task 7.2: AI タイムアウト時のランダム有効手選択
 * Test-Driven Development: Tests written BEFORE implementation
 */

import { selectRandomValidMove } from '../ai-fallback';
import type { Position } from '../../game/types';

describe('AI Fallback', () => {
  describe('RED: Random valid move selection', () => {
    it('should return a random move from valid moves array', () => {
      const validMoves: Position[] = [
        { row: 2, col: 3 },
        { row: 3, col: 2 },
        { row: 4, col: 5 },
      ];

      const move = selectRandomValidMove(validMoves);

      // Should be one of the valid moves
      expect(validMoves).toContainEqual(move);
    });

    it('should throw error when validMoves array is empty', () => {
      const validMoves: Position[] = [];

      expect(() => selectRandomValidMove(validMoves)).toThrow(
        'No valid moves available'
      );
    });

    it('should return the only move when only one valid move exists', () => {
      const validMoves: Position[] = [{ row: 3, col: 4 }];

      const move = selectRandomValidMove(validMoves);

      expect(move).toEqual({ row: 3, col: 4 });
    });
  });
});
