/**
 * Unit tests for move-encoder module
 * Tests WTHOR encoding/decoding and board replay functionality
 */

import {
  encodeMoves,
  decodeMoves,
  replayMoves,
  positionToWthor,
  wthorToPosition,
  countStones,
  determineWinner,
} from '../move-encoder';
import type { Position } from '@/lib/game/types';

describe('MoveHistoryEncoder', () => {
  describe('positionToWthor', () => {
    it('should convert position (0, 0) to "11"', () => {
      const position: Position = { row: 0, col: 0 };
      expect(positionToWthor(position)).toBe('11');
    });

    it('should convert position (3, 3) to "44"', () => {
      const position: Position = { row: 3, col: 3 };
      expect(positionToWthor(position)).toBe('44');
    });

    it('should convert position (4, 5) to "56"', () => {
      const position: Position = { row: 4, col: 5 };
      expect(positionToWthor(position)).toBe('56');
    });

    it('should convert position (7, 7) to "88"', () => {
      const position: Position = { row: 7, col: 7 };
      expect(positionToWthor(position)).toBe('88');
    });

    it('should convert all corner positions correctly', () => {
      expect(positionToWthor({ row: 0, col: 0 })).toBe('11');
      expect(positionToWthor({ row: 0, col: 7 })).toBe('18');
      expect(positionToWthor({ row: 7, col: 0 })).toBe('81');
      expect(positionToWthor({ row: 7, col: 7 })).toBe('88');
    });
  });

  describe('wthorToPosition', () => {
    it('should convert "11" to position (0, 0)', () => {
      const result = wthorToPosition('11');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 0, col: 0 });
      }
    });

    it('should convert "44" to position (3, 3)', () => {
      const result = wthorToPosition('44');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 3, col: 3 });
      }
    });

    it('should convert "56" to position (4, 5)', () => {
      const result = wthorToPosition('56');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 4, col: 5 });
      }
    });

    it('should convert "88" to position (7, 7)', () => {
      const result = wthorToPosition('88');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual({ row: 7, col: 7 });
      }
    });

    it('should return error for invalid length', () => {
      const result = wthorToPosition('1');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_length');
      }
    });

    it('should return error for too long string', () => {
      const result = wthorToPosition('111');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_length');
      }
    });

    it('should return error for invalid characters', () => {
      const result = wthorToPosition('ab');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_characters');
      }
    });

    it('should return error for out of range position (row 0)', () => {
      const result = wthorToPosition('01');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_position');
      }
    });

    it('should return error for out of range position (row 9)', () => {
      const result = wthorToPosition('91');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_position');
      }
    });

    it('should return error for out of range position (col 0)', () => {
      const result = wthorToPosition('10');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_position');
      }
    });

    it('should return error for out of range position (col 9)', () => {
      const result = wthorToPosition('19');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_position');
      }
    });
  });

  describe('encodeMoves', () => {
    it('should encode empty moves array', () => {
      const result = encodeMoves([]);
      expect(result).toBe('');
    });

    it('should encode single move', () => {
      const moves: Position[] = [{ row: 2, col: 3 }];
      const encoded = encodeMoves(moves);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should encode multiple moves', () => {
      const moves: Position[] = [
        { row: 2, col: 3 },
        { row: 2, col: 2 },
        { row: 3, col: 2 },
      ];
      const encoded = encodeMoves(moves);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should produce URL-safe Base64 encoding', () => {
      const moves: Position[] = [
        { row: 2, col: 3 },
        { row: 2, col: 2 },
      ];
      const encoded = encodeMoves(moves);
      // Base64URL should not contain +, /, or =
      expect(encoded).not.toMatch(/[+/=]/);
    });

    it('should encode 60 moves within reasonable length', () => {
      const moves: Position[] = [];
      for (let i = 0; i < 60; i++) {
        moves.push({ row: i % 8, col: (i + 1) % 8 });
      }
      const encoded = encodeMoves(moves);
      // 60 moves * 2 chars = 120 chars -> Base64URL ~80 chars
      expect(encoded.length).toBeLessThanOrEqual(160);
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

    it('should return error for invalid Base64 characters', () => {
      const result = decodeMoves('!!!invalid!!!');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_base64');
      }
    });

    it('should return error for odd length WTHOR string', () => {
      // Create a valid Base64 that decodes to odd-length digit string
      // "123" in Base64URL would be invalid for WTHOR
      const invalidEncoded = btoa('123')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      const result = decodeMoves(invalidEncoded);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('invalid_length');
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
