/**
 * Tests for share module barrel exports
 * Verifies that all exports are accessible through the index file
 */

import {
  // Move encoder exports
  encodeMoves,
  decodeMoves,
  replayMoves,
  positionToChar,
  charToPosition,
  countStones,
  determineWinner,
  // Flex message builder exports
  buildFlexMessage,
  // Share service exports
  canShareToLine,
  canShareToWeb,
  shareToLine,
  shareToWeb,
} from '../index';

import type {
  DecodeResult,
  ReplayResult,
  ShareResult,
  ShareOutcome,
} from '../index';

describe('share module exports', () => {
  describe('move-encoder exports', () => {
    it('should export encodeMoves function', () => {
      expect(typeof encodeMoves).toBe('function');
    });

    it('should export decodeMoves function', () => {
      expect(typeof decodeMoves).toBe('function');
    });

    it('should export replayMoves function', () => {
      expect(typeof replayMoves).toBe('function');
    });

    it('should export positionToChar function', () => {
      expect(typeof positionToChar).toBe('function');
    });

    it('should export charToPosition function', () => {
      expect(typeof charToPosition).toBe('function');
    });

    it('should export countStones function', () => {
      expect(typeof countStones).toBe('function');
    });

    it('should export determineWinner function', () => {
      expect(typeof determineWinner).toBe('function');
    });
  });

  describe('flex-message-builder exports', () => {
    it('should export buildFlexMessage function', () => {
      expect(typeof buildFlexMessage).toBe('function');
    });
  });

  describe('share-service exports', () => {
    it('should export canShareToLine function', () => {
      expect(typeof canShareToLine).toBe('function');
    });

    it('should export canShareToWeb function', () => {
      expect(typeof canShareToWeb).toBe('function');
    });

    it('should export shareToLine function', () => {
      expect(typeof shareToLine).toBe('function');
    });

    it('should export shareToWeb function', () => {
      expect(typeof shareToWeb).toBe('function');
    });
  });

  describe('type exports', () => {
    it('should allow DecodeResult type usage', () => {
      const successResult: DecodeResult<string[]> = {
        success: true,
        value: ['test'],
      };
      expect(successResult.success).toBe(true);

      const errorResult: DecodeResult<string[]> = {
        success: false,
        error: 'invalid_length',
      };
      expect(errorResult.success).toBe(false);
    });

    it('should allow ReplayResult type usage', () => {
      const successResult: ReplayResult = {
        success: true,
        board: [],
        blackCount: 2,
        whiteCount: 2,
      };
      expect(successResult.success).toBe(true);

      const errorResult: ReplayResult = {
        success: false,
        error: 'invalid_move',
        moveIndex: 5,
      };
      expect(errorResult.success).toBe(false);
    });

    it('should allow ShareResult type usage', () => {
      const result: ShareResult = {
        encodedMoves: 'abc123',
        side: 'b',
        blackCount: 32,
        whiteCount: 32,
        winner: 'draw',
      };
      expect(result.side).toBe('b');
    });

    it('should allow ShareOutcome type usage', () => {
      const success: ShareOutcome = { status: 'success' };
      expect(success.status).toBe('success');

      const cancelled: ShareOutcome = { status: 'cancelled' };
      expect(cancelled.status).toBe('cancelled');

      const error: ShareOutcome = { status: 'error', message: 'Failed' };
      expect(error.status).toBe('error');
    });
  });
});
