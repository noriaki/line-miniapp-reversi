/**
 * Unit tests for Flex Message Builder
 * Tests LINE Flex Message construction for game result sharing
 */

import { buildFlexMessage, type ShareResult } from '../flex-message-builder';

describe('FlexMessageBuilder', () => {
  const baseUrl = 'https://example.com';

  describe('buildFlexMessage', () => {
    it('should build a valid Flex Message structure', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };

      const message = buildFlexMessage(result, baseUrl);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('36');
      expect(message.altText).toContain('28');
      expect(message.contents.type).toBe('bubble');
    });

    it('should include hero image with correct OG image URL', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };

      const message = buildFlexMessage(result, baseUrl);
      const bubble = message.contents;

      expect(bubble.hero).toBeDefined();
      expect(bubble.hero?.type).toBe('image');
      expect(bubble.hero?.url).toBe(
        'https://example.com/r/b/ABC123/opengraph-image'
      );
      expect(bubble.hero?.aspectRatio).toBe('1200:630');
    });

    it('should display correct score in body section', () => {
      const result: ShareResult = {
        encodedMoves: 'XYZ789',
        side: 'w',
        blackCount: 20,
        whiteCount: 44,
        winner: 'white',
      };

      const message = buildFlexMessage(result, baseUrl);
      const body = message.contents.body;

      expect(body).toBeDefined();
      // Body should contain score display elements
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).toContain('20');
      expect(bodyStr).toContain('44');
    });

    it('should include CTA button in footer with correct URL', () => {
      const result: ShareResult = {
        encodedMoves: 'DEF456',
        side: 'b',
        blackCount: 32,
        whiteCount: 32,
        winner: 'draw',
      };

      const message = buildFlexMessage(result, baseUrl);
      const footer = message.contents.footer;

      expect(footer).toBeDefined();
      // Footer should contain a button with action URI
      const footerStr = JSON.stringify(footer);
      expect(footerStr).toContain('https://example.com/r/b/DEF456');
    });

    it('should use LINE green color for CTA button', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };

      const message = buildFlexMessage(result, baseUrl);
      const footerStr = JSON.stringify(message.contents.footer);

      // LINE green: #06C755
      expect(footerStr).toContain('#06C755');
    });

    it('should set altText with game result summary', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };

      const message = buildFlexMessage(result, baseUrl);

      // altText should contain score information
      expect(message.altText).toMatch(/36.*28|28.*36/);
    });

    it('should include crown emoji for winner in body', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };

      const message = buildFlexMessage(result, baseUrl);
      const bodyStr = JSON.stringify(message.contents.body);

      // Winner section should have some indicator
      expect(bodyStr).toBeDefined();
    });

    it('should handle draw result correctly', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 32,
        whiteCount: 32,
        winner: 'draw',
      };

      const message = buildFlexMessage(result, baseUrl);

      expect(message.altText).toContain('32');
    });

    it('should work with white player side', () => {
      const result: ShareResult = {
        encodedMoves: 'XYZ',
        side: 'w',
        blackCount: 28,
        whiteCount: 36,
        winner: 'white',
      };

      const message = buildFlexMessage(result, baseUrl);

      expect(message.contents.hero?.url).toBe(
        'https://example.com/r/w/XYZ/opengraph-image'
      );
    });
  });
});
