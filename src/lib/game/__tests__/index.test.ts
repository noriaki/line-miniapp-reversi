/**
 * Integration tests for Game module exports
 * Ensures all exports from index.ts are accessible and functional
 */

import {
  createInitialBoard,
  countStones,
  cloneBoard,
  getCellAt,
  setCellAt,
  validateMove,
  DIRECTIONS,
  applyMove,
  calculateValidMoves,
  checkGameEnd,
} from '../index';

describe('Game Module Exports', () => {
  describe('Board Function Exports', () => {
    it('should export createInitialBoard function', () => {
      expect(createInitialBoard).toBeDefined();
      expect(typeof createInitialBoard).toBe('function');

      const board = createInitialBoard();
      expect(board).toBeDefined();
      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);
    });

    it('should export countStones function', () => {
      expect(countStones).toBeDefined();
      expect(typeof countStones).toBe('function');

      const board = createInitialBoard();
      const count = countStones(board);
      expect(count).toEqual({ black: 2, white: 2 });
    });

    it('should export cloneBoard function', () => {
      expect(cloneBoard).toBeDefined();
      expect(typeof cloneBoard).toBe('function');

      const board = createInitialBoard();
      const clone = cloneBoard(board);
      expect(clone).toEqual(board);
      expect(clone).not.toBe(board);
    });

    it('should export getCellAt function', () => {
      expect(getCellAt).toBeDefined();
      expect(typeof getCellAt).toBe('function');

      const board = createInitialBoard();
      expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
    });
  });

  describe('Move Validator Function Exports', () => {
    it('should export DIRECTIONS constant', () => {
      expect(DIRECTIONS).toBeDefined();
      expect(Array.isArray(DIRECTIONS)).toBe(true);
      expect(DIRECTIONS.length).toBe(8);
    });
  });

  describe('Game Logic Function Exports', () => {
    it('should export calculateValidMoves function', () => {
      expect(calculateValidMoves).toBeDefined();
      expect(typeof calculateValidMoves).toBe('function');

      const board = createInitialBoard();
      const validMoves = calculateValidMoves(board, 'black');
      expect(Array.isArray(validMoves)).toBe(true);
      expect(validMoves.length).toBeGreaterThan(0);
    });
  });

  describe('Game End Function Exports', () => {
    it('should export checkGameEnd function', () => {
      expect(checkGameEnd).toBeDefined();
      expect(typeof checkGameEnd).toBe('function');

      const board = createInitialBoard();
      const blackMoves = calculateValidMoves(board, 'black');
      const whiteMoves = calculateValidMoves(board, 'white');
      const result = checkGameEnd(board, blackMoves, whiteMoves);
      expect(result).toBeDefined();
      expect(typeof result.ended).toBe('boolean');
    });
  });

  describe('Integration', () => {
    it('should allow complete game flow using exported functions', () => {
      // Create initial board
      const board = createInitialBoard();
      expect(countStones(board)).toEqual({ black: 2, white: 2 });

      // Find valid moves
      const validMoves = calculateValidMoves(board, 'black');
      expect(validMoves.length).toBeGreaterThan(0);

      // Apply a move
      const firstMove = validMoves[0];
      const moveResult = applyMove(board, firstMove, 'black');
      expect(moveResult.success).toBe(true);

      if (moveResult.success) {
        const newBoard = moveResult.value;

        // Count stones after move
        const newCount = countStones(newBoard);
        expect(newCount.black).toBeGreaterThan(2);

        // Check game end
        const blackMoves = calculateValidMoves(newBoard, 'black');
        const whiteMoves = calculateValidMoves(newBoard, 'white');
        const gameEnd = checkGameEnd(newBoard, blackMoves, whiteMoves);
        expect(gameEnd).toBeDefined();
        expect(typeof gameEnd.ended).toBe('boolean');
      }
    });

    it('should allow board manipulation using exported functions', () => {
      const board = createInitialBoard();
      const cloned = cloneBoard(board);

      expect(getCellAt(board, { row: 3, col: 3 })).toBe('white');
      expect(getCellAt(board, { row: 3, col: 4 })).toBe('black');

      // Modify cloned board
      const modified = setCellAt(cloned, { row: 0, col: 0 }, 'black');
      expect(getCellAt(modified, { row: 0, col: 0 })).toBe('black');
      expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
    });

    it('should validate moves correctly using exported functions', () => {
      const board = createInitialBoard();

      // Valid move for black
      const validResult = validateMove(board, { row: 2, col: 3 }, 'black');
      expect(validResult.success).toBe(true);

      // Invalid move (occupied cell)
      const invalidResult = validateMove(board, { row: 3, col: 3 }, 'black');
      expect(invalidResult.success).toBe(false);
    });
  });
});
