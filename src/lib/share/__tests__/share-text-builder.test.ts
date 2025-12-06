/**
 * Unit tests for buildShareText function
 */

import { buildShareText } from '../share-text-builder';
import type { GameResult } from '../types';

describe('buildShareText', () => {
  const mockAppUrl = 'https://liff.line.me/1234567890-abcdefgh';

  describe('game result text', () => {
    it('should include player win text when black wins', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 40,
        whiteCount: 24,
      };

      const text = buildShareText(result, mockAppUrl);

      expect(text).toContain('勝ち');
    });

    it('should include player loss text when white (AI) wins', () => {
      const result: GameResult = {
        winner: 'white',
        blackCount: 24,
        whiteCount: 40,
      };

      const text = buildShareText(result, mockAppUrl);

      expect(text).toContain('負け');
    });

    it('should include draw text when game is a draw', () => {
      const result: GameResult = {
        winner: 'draw',
        blackCount: 32,
        whiteCount: 32,
      };

      const text = buildShareText(result, mockAppUrl);

      expect(text).toContain('引き分け');
    });
  });

  describe('score information', () => {
    it('should include black stone count', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const text = buildShareText(result, mockAppUrl);

      expect(text).toContain('36');
    });

    it('should include white stone count', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const text = buildShareText(result, mockAppUrl);

      expect(text).toContain('28');
    });

    it('should include score in vs format', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const text = buildShareText(result, mockAppUrl);

      // Score format should be "黒 36 vs 白 28" or similar
      expect(text).toMatch(/36.*vs.*28|36.*対.*28/i);
    });
  });

  describe('invitation text', () => {
    it('should include invitation message', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const text = buildShareText(result, mockAppUrl);

      // Should contain invitation text
      expect(text).toMatch(/勝てる|挑戦|遊/);
    });
  });

  describe('app URL', () => {
    it('should include the app URL', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const text = buildShareText(result, mockAppUrl);

      expect(text).toContain(mockAppUrl);
    });

    it('should include the provided custom app URL', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };
      const customUrl = 'https://liff.line.me/custom-app-id';

      const text = buildShareText(result, customUrl);

      expect(text).toContain(customUrl);
    });
  });

  describe('text format', () => {
    it('should return a non-empty string', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const text = buildShareText(result, mockAppUrl);

      expect(text).toBeTruthy();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    it('should not have excessive whitespace', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const text = buildShareText(result, mockAppUrl);

      // No double spaces or leading/trailing whitespace (except newlines)
      expect(text.trim()).toBe(text);
      expect(text).not.toMatch(/  /);
    });
  });
});
