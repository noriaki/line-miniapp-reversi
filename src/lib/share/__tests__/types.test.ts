/**
 * Type definitions tests for share functionality
 *
 * These tests verify that the type definitions are correctly structured
 * and can be used as expected at compile time.
 */

import type {
  GameResult,
  ShareState,
  ShareError,
  PendingShareData,
  ImageGenerationOptions,
} from '../types';
import type { Cell } from '@/lib/game/types';

describe('Share Types', () => {
  describe('GameResult', () => {
    it('should represent a player win', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 40,
        whiteCount: 24,
      };
      expect(result.winner).toBe('black');
      expect(result.blackCount).toBe(40);
      expect(result.whiteCount).toBe(24);
    });

    it('should represent a draw', () => {
      const result: GameResult = {
        winner: 'draw',
        blackCount: 32,
        whiteCount: 32,
      };
      expect(result.winner).toBe('draw');
      expect(result.blackCount).toBe(32);
      expect(result.whiteCount).toBe(32);
    });
  });

  describe('ShareState', () => {
    it('should represent idle state', () => {
      const state: ShareState = {
        status: 'idle',
        imageUrl: null,
        imageBlob: null,
        error: null,
        hasPendingShare: false,
      };
      expect(state.status).toBe('idle');
      expect(state.imageUrl).toBeNull();
      expect(state.imageBlob).toBeNull();
      expect(state.error).toBeNull();
      expect(state.hasPendingShare).toBe(false);
    });

    it('should represent ready state with image', () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const state: ShareState = {
        status: 'ready',
        imageUrl: 'https://example.com/image.png',
        imageBlob: blob,
        error: null,
        hasPendingShare: false,
      };
      expect(state.status).toBe('ready');
      expect(state.imageUrl).toBe('https://example.com/image.png');
      expect(state.imageBlob).toBe(blob);
    });

    it('should represent error state', () => {
      const error: ShareError = {
        type: 'upload_failed',
        message: 'Network error',
      };
      const state: ShareState = {
        status: 'idle',
        imageUrl: null,
        imageBlob: null,
        error,
        hasPendingShare: false,
      };
      expect(state.error).toEqual(error);
    });

    it('should represent pending share state', () => {
      const state: ShareState = {
        status: 'idle',
        imageUrl: null,
        imageBlob: null,
        error: null,
        hasPendingShare: true,
      };
      expect(state.hasPendingShare).toBe(true);
    });
  });

  describe('ShareError', () => {
    it('should represent upload_failed error', () => {
      const error: ShareError = {
        type: 'upload_failed',
        message: 'Failed to upload image',
      };
      expect(error.type).toBe('upload_failed');
      if (error.type === 'upload_failed') {
        expect(error.message).toBe('Failed to upload image');
      }
    });

    it('should represent share_failed error', () => {
      const error: ShareError = {
        type: 'share_failed',
        message: 'Share target picker failed',
      };
      expect(error.type).toBe('share_failed');
    });

    it('should represent image_too_large error', () => {
      const error: ShareError = {
        type: 'image_too_large',
        message: 'Image exceeds 1MB limit',
      };
      expect(error.type).toBe('image_too_large');
    });

    it('should represent cancelled error', () => {
      const error: ShareError = { type: 'cancelled' };
      expect(error.type).toBe('cancelled');
    });

    it('should represent not_supported error', () => {
      const error: ShareError = { type: 'not_supported' };
      expect(error.type).toBe('not_supported');
    });
  });

  describe('PendingShareData', () => {
    it('should store game state with timestamp', () => {
      const board: Cell[][] = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null) as Cell[]);
      board[3][3] = 'white';
      board[3][4] = 'black';
      board[4][3] = 'black';
      board[4][4] = 'white';

      const data: PendingShareData = {
        board,
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
        timestamp: Date.now(),
      };

      expect(data.board).toBe(board);
      expect(data.blackCount).toBe(36);
      expect(data.whiteCount).toBe(28);
      expect(data.winner).toBe('black');
      expect(typeof data.timestamp).toBe('number');
    });

    it('should support draw as winner', () => {
      const board: Cell[][] = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null) as Cell[]);

      const data: PendingShareData = {
        board,
        blackCount: 32,
        whiteCount: 32,
        winner: 'draw',
        timestamp: Date.now(),
      };

      expect(data.winner).toBe('draw');
    });
  });

  describe('ImageGenerationOptions', () => {
    it('should have default values when empty', () => {
      const options: ImageGenerationOptions = {};
      expect(options.scale).toBeUndefined();
      expect(options.format).toBeUndefined();
      expect(options.quality).toBeUndefined();
      expect(options.maxSizeBytes).toBeUndefined();
    });

    it('should accept all optional parameters', () => {
      const options: ImageGenerationOptions = {
        scale: 2,
        format: 'image/png',
        quality: 0.9,
        maxSizeBytes: 1048576,
      };

      expect(options.scale).toBe(2);
      expect(options.format).toBe('image/png');
      expect(options.quality).toBe(0.9);
      expect(options.maxSizeBytes).toBe(1048576);
    });

    it('should accept jpeg format', () => {
      const options: ImageGenerationOptions = {
        format: 'image/jpeg',
      };
      expect(options.format).toBe('image/jpeg');
    });
  });
});
