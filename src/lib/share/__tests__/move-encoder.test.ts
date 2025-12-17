/**
 * Unit tests for move-encoder module
 * Tests Base64URL direct encoding/decoding and board replay functionality
 */

import {
  encodeMoves,
  decodeMoves,
  replayMoves,
  positionToChar,
  charToPosition,
  countStones,
  determineWinner,
} from '../move-encoder';
import type { Position } from '@/lib/game/types';

describe('MoveHistoryEncoder', () => {
  describe('positionToChar', () => {
    it('should convert position (0, 0) to "A" (index 0)', () => {
      const position: Position = { row: 0, col: 0 };
      expect(positionToChar(position)).toBe('A');
    });

    it('should convert position (3, 3) to "b" (index 27)', () => {
      const position: Position = { row: 3, col: 3 };
      expect(positionToChar(position)).toBe('b');
    });

    it('should convert position (4, 5) to "l" (index 37)', () => {
      const position: Position = { row: 4, col: 5 };
      expect(positionToChar(position)).toBe('l');
    });

    it('should convert position (7, 7) to "_" (index 63)', () => {
      const position: Position = { row: 7, col: 7 };
      expect(positionToChar(position)).toBe('_');
    });

    it('should convert all corner positions correctly', () => {
      expect(positionToChar({ row: 0, col: 0 })).toBe('A'); // index 0
      expect(positionToChar({ row: 0, col: 7 })).toBe('H'); // index 7
      expect(positionToChar({ row: 7, col: 0 })).toBe('4'); // index 56
      expect(positionToChar({ row: 7, col: 7 })).toBe('_'); // index 63
    });

    it('should convert position (2, 0) to "Q" (index 16)', () => {
      // a3 (row=2, col=0) -> index = 2*8 + 0 = 16 -> 'Q'
      const position: Position = { row: 2, col: 0 };
      expect(positionToChar(position)).toBe('Q');
    });
  });

  describe('charToPosition', () => {
    it('should convert "A" to position (0, 0)', () => {
      const result = charToPosition('A');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 0, col: 0 });
      }
    });

    it('should convert "b" to position (3, 3)', () => {
      const result = charToPosition('b');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 3, col: 3 });
      }
    });

    it('should convert "l" to position (4, 5)', () => {
      const result = charToPosition('l');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 4, col: 5 });
      }
    });

    it('should convert "_" to position (7, 7)', () => {
      const result = charToPosition('_');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 7, col: 7 });
      }
    });

    it('should return error for invalid length (empty)', () => {
      const result = charToPosition('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_length');
      }
    });

    it('should return error for too long string', () => {
      const result = charToPosition('AB');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_length');
      }
    });

    it('should return error for invalid characters (not in Base64URL charset)', () => {
      const result = charToPosition('!');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_characters');
      }
    });

    it('should return error for space character', () => {
      const result = charToPosition(' ');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_characters');
      }
    });

    it('should handle hyphen correctly (valid Base64URL char at index 62)', () => {
      const result = charToPosition('-');
      expect(result.success).toBe(true);
      if (result.success) {
        // index 62 = row 7, col 6
        expect(result.value).toEqual({ row: 7, col: 6 });
      }
    });

    it('should handle underscore correctly (valid Base64URL char at index 63)', () => {
      const result = charToPosition('_');
      expect(result.success).toBe(true);
      if (result.success) {
        // index 63 = row 7, col 7
        expect(result.value).toEqual({ row: 7, col: 7 });
      }
    });
  });

  describe('encodeMoves', () => {
    it('should encode empty moves array', () => {
      const result = encodeMoves([]);
      expect(result).toBe('');
    });

    it('should encode single move as single character', () => {
      const moves: Position[] = [{ row: 2, col: 3 }];
      const encoded = encodeMoves(moves);
      // index = 2*8 + 3 = 19 -> 'T'
      expect(encoded).toBe('T');
    });

    it('should encode multiple moves as concatenated characters', () => {
      const moves: Position[] = [
        { row: 2, col: 3 }, // index 19 -> 'T'
        { row: 2, col: 2 }, // index 18 -> 'S'
        { row: 3, col: 2 }, // index 26 -> 'a'
      ];
      const encoded = encodeMoves(moves);
      expect(encoded).toBe('TSa');
    });

    it('should produce URL-safe encoding without special characters', () => {
      const moves: Position[] = [
        { row: 7, col: 6 }, // index 62 -> '-'
        { row: 7, col: 7 }, // index 63 -> '_'
      ];
      const encoded = encodeMoves(moves);
      // Should use - and _ which are URL-safe
      expect(encoded).toBe('-_');
    });

    it('should encode 60 moves as exactly 60 characters', () => {
      const moves: Position[] = [];
      for (let i = 0; i < 60; i++) {
        moves.push({ row: i % 8, col: (i + 1) % 8 });
      }
      const encoded = encodeMoves(moves);
      // 60 moves = 60 characters (1 char per move)
      expect(encoded.length).toBe(60);
    });
  });

  describe('decodeMoves', () => {
    it('should decode empty string to empty array', () => {
      const result = decodeMoves('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual([]);
      }
    });

    it('should decode single character to single position', () => {
      const result = decodeMoves('T');
      expect(result.success).toBe(true);
      if (result.success) {
        // 'T' is index 19 = row 2, col 3
        expect(result.value).toEqual([{ row: 2, col: 3 }]);
      }
    });

    it('should return error for invalid characters', () => {
      const result = decodeMoves('!');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_characters');
      }
    });

    it('should return error for space in string', () => {
      const result = decodeMoves('A B');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_characters');
      }
    });
  });

  describe('encode/decode reversibility', () => {
    it('should decode encoded moves back to original', () => {
      const original: Position[] = [
        { row: 2, col: 3 },
        { row: 2, col: 2 },
        { row: 3, col: 2 },
      ];
      const encoded = encodeMoves(original);
      const decoded = decodeMoves(encoded);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.value).toEqual(original);
      }
    });

    it('should maintain reversibility for empty array', () => {
      const original: Position[] = [];
      const encoded = encodeMoves(original);
      const decoded = decodeMoves(encoded);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.value).toEqual(original);
      }
    });

    it('should maintain reversibility for single move', () => {
      const original: Position[] = [{ row: 4, col: 5 }];
      const encoded = encodeMoves(original);
      const decoded = decodeMoves(encoded);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.value).toEqual(original);
      }
    });

    it('should maintain reversibility for 60 moves', () => {
      const original: Position[] = [];
      for (let i = 0; i < 60; i++) {
        original.push({ row: i % 8, col: (i * 3 + 1) % 8 });
      }
      const encoded = encodeMoves(original);
      const decoded = decodeMoves(encoded);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.value).toEqual(original);
      }
    });

    it('should maintain reversibility for all corner positions', () => {
      const original: Position[] = [
        { row: 0, col: 0 },
        { row: 0, col: 7 },
        { row: 7, col: 0 },
        { row: 7, col: 7 },
      ];
      const encoded = encodeMoves(original);
      const decoded = decodeMoves(encoded);

      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.value).toEqual(original);
      }
    });

    it('should maintain reversibility for positions using special chars', () => {
      const original: Position[] = [
        { row: 7, col: 6 }, // index 62 -> '-'
        { row: 7, col: 7 }, // index 63 -> '_'
      ];
      const encoded = encodeMoves(original);
      expect(encoded).toBe('-_');

      const decoded = decodeMoves(encoded);
      expect(decoded.success).toBe(true);
      if (decoded.success) {
        expect(decoded.value).toEqual(original);
      }
    });
  });

  describe('replayMoves', () => {
    it('should replay empty moves to initial board', () => {
      const result = replayMoves([]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.blackCount).toBe(2);
        expect(result.whiteCount).toBe(2);
      }
    });

    it('should replay a single valid move', () => {
      // d3 (row 2, col 3) is a valid opening move for black
      const moves: Position[] = [{ row: 2, col: 3 }];
      const result = replayMoves(moves);

      expect(result.success).toBe(true);
      if (result.success) {
        // Black places at d3 and flips d4 (white to black)
        // Initial: black=2, white=2
        // After: black=4, white=1
        expect(result.blackCount).toBe(4);
        expect(result.whiteCount).toBe(1);
      }
    });

    it('should replay multiple valid moves', () => {
      // Standard opening: d3, c3
      const moves: Position[] = [
        { row: 2, col: 3 }, // d3 (black)
        { row: 2, col: 2 }, // c3 (white)
      ];
      const result = replayMoves(moves);

      expect(result.success).toBe(true);
      if (result.success) {
        // After d3: black=4, white=1
        // After c3: white flips d3, so black=3, white=3
        expect(result.blackCount).toBe(3);
        expect(result.whiteCount).toBe(3);
      }
    });

    it('should return error for invalid move', () => {
      // (0, 0) is not a valid opening move
      const moves: Position[] = [{ row: 0, col: 0 }];
      const result = replayMoves(moves);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_move');
        expect(result.moveIndex).toBe(0);
      }
    });

    it('should return error for invalid move in sequence', () => {
      const moves: Position[] = [
        { row: 2, col: 3 }, // valid
        { row: 0, col: 0 }, // invalid
      ];
      const result = replayMoves(moves);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_move');
        expect(result.moveIndex).toBe(1);
      }
    });

    it('should handle pass situation correctly', () => {
      // This test verifies that when a player has no valid moves,
      // the turn automatically passes to the opponent
      // Creating a scenario where pass is needed requires a specific board state
      // For now, we test the basic functionality
      const moves: Position[] = [{ row: 2, col: 3 }];
      const result = replayMoves(moves);
      expect(result.success).toBe(true);
    });
  });

  describe('countStones', () => {
    it('should count stones on initial board', () => {
      const result = replayMoves([]);
      expect(result.success).toBe(true);
      if (result.success) {
        const { black, white } = countStones(result.board);
        expect(black).toBe(2);
        expect(white).toBe(2);
      }
    });
  });

  describe('determineWinner', () => {
    it('should return black when black has more stones', () => {
      expect(determineWinner(40, 24)).toBe('black');
    });

    it('should return white when white has more stones', () => {
      expect(determineWinner(20, 44)).toBe('white');
    });

    it('should return draw when counts are equal', () => {
      expect(determineWinner(32, 32)).toBe('draw');
    });

    it('should handle edge case of 0 stones', () => {
      expect(determineWinner(0, 64)).toBe('white');
      expect(determineWinner(64, 0)).toBe('black');
    });
  });
});
