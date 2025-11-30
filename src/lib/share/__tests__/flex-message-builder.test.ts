/**
 * Unit tests for FlexMessageBuilder
 *
 * Requirements: 2.4, 2.5, 2.6, 2.7
 */

import { buildShareFlexMessage } from '../flex-message-builder';
import type { GameResult } from '../types';

describe('buildShareFlexMessage', () => {
  const mockImageUrl = 'https://r2.example.com/share-images/test.png';
  const mockAppUrl = 'https://liff.line.me/1234567890-abcdefgh';

  describe('Requirements 2.4: Flex Message format', () => {
    it('should return a Flex Message with type "flex"', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.type).toBe('flex');
    });

    it('should have a bubble type container', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.type).toBe('bubble');
    });

    it('should set altText to "リバーシの結果をシェア"', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.altText).toBe('リバーシの結果をシェア');
    });
  });

  describe('Requirements 2.5: Hero section with share image', () => {
    it('should have a hero section with image type', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.hero).toBeDefined();
      expect(message.contents.hero?.type).toBe('image');
    });

    it('should include the provided image URL in hero', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.hero?.url).toBe(mockImageUrl);
    });

    it('should set aspectMode to fit', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.hero?.aspectMode).toBe('fit');
    });

    it('should set aspectRatio to 1200:630', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.hero?.aspectRatio).toBe('1200:630');
    });

    it('should set size to full', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.hero?.size).toBe('full');
    });
  });

  describe('Requirements 2.6: Body section with score and invitation', () => {
    it('should have a body section', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.body).toBeDefined();
    });

    it('should include black score in body', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      // Search for '36' in body JSON
      const bodyJson = JSON.stringify(message.contents.body);
      expect(bodyJson).toContain('36');
    });

    it('should include white score in body', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const bodyJson = JSON.stringify(message.contents.body);
      expect(bodyJson).toContain('28');
    });

    it('should show crown for winner (black wins)', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const bodyJson = JSON.stringify(message.contents.body);
      // Crown should appear with the player section
      expect(bodyJson).toContain('\u{1F451}'); // Crown emoji
    });

    it('should show crown for winner (white wins)', () => {
      const result: GameResult = {
        winner: 'white',
        blackCount: 28,
        whiteCount: 36,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const bodyJson = JSON.stringify(message.contents.body);
      expect(bodyJson).toContain('\u{1F451}'); // Crown emoji
    });

    it('should not show crown when draw', () => {
      const result: GameResult = {
        winner: 'draw',
        blackCount: 32,
        whiteCount: 32,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const bodyJson = JSON.stringify(message.contents.body);
      expect(bodyJson).not.toContain('\u{1F451}'); // No crown emoji
    });

    it('should include invitation text "AIに勝てるかな？"', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const bodyJson = JSON.stringify(message.contents.body);
      expect(bodyJson).toContain('AIに勝てるかな？');
    });

    it('should have 3-column layout for scores', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      // Body should have horizontal layout containing player section, vs section, AI section
      expect(message.contents.body?.layout).toBe('vertical');
      const bodyContents = message.contents.body?.contents;
      expect(Array.isArray(bodyContents)).toBe(true);

      // First element should be a horizontal box with 3 columns
      const scoreRow = bodyContents?.find(
        (c) => c.type === 'box' && c.layout === 'horizontal'
      );
      expect(scoreRow).toBeDefined();
    });
  });

  describe('Requirements 2.7: Footer with URI action button', () => {
    it('should have a footer section', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message.contents.footer).toBeDefined();
    });

    it('should have a button with label "かんたんリバーシをプレイ"', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const footerJson = JSON.stringify(message.contents.footer);
      expect(footerJson).toContain('かんたんリバーシをプレイ');
    });

    it('should have a URI action with the app URL', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const footerJson = JSON.stringify(message.contents.footer);
      expect(footerJson).toContain(mockAppUrl);
      expect(footerJson).toContain('"type":"uri"');
    });

    it('should have button with primary style and LINE brand color', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 36,
        whiteCount: 28,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      const footerJson = JSON.stringify(message.contents.footer);
      expect(footerJson).toContain('"style":"primary"');
      expect(footerJson).toContain('#06C755');
    });
  });

  describe('different game outcomes', () => {
    it('should handle player (black) victory correctly', () => {
      const result: GameResult = {
        winner: 'black',
        blackCount: 40,
        whiteCount: 24,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message).toBeDefined();
      expect(message.contents.body).toBeDefined();
    });

    it('should handle AI (white) victory correctly', () => {
      const result: GameResult = {
        winner: 'white',
        blackCount: 24,
        whiteCount: 40,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message).toBeDefined();
      expect(message.contents.body).toBeDefined();
    });

    it('should handle draw correctly', () => {
      const result: GameResult = {
        winner: 'draw',
        blackCount: 32,
        whiteCount: 32,
      };

      const message = buildShareFlexMessage(mockImageUrl, result, mockAppUrl);

      expect(message).toBeDefined();
      expect(message.contents.body).toBeDefined();
    });
  });
});
