/**
 * Unit tests for Flex Message Builder
 * Tests LINE Flex Message construction for game result sharing
 */

import {
  buildFlexMessage,
  APP_ICON_URL,
  ARROW_ICON_URL,
  type ShareResult,
} from '../flex-message-builder';

describe('FlexMessageBuilder', () => {
  // Test URLs
  const liffId = 'test-liff-id';
  const baseUrl = 'https://example.com';

  // Helper to build test URLs
  const buildTestUrls = (side: 'b' | 'w', encodedMoves: string) => ({
    permalinkUrl: `https://miniapp.line.me/${liffId}/r/${side}/${encodedMoves}`,
    ogImageUrl: `${baseUrl}/r/${side}/${encodedMoves}/opengraph-image`,
    homeUrl: `https://miniapp.line.me/${liffId}`,
  });

  describe('buildFlexMessage', () => {
    it('should build a valid Flex Message structure', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('36');
      expect(message.altText).toContain('28');
      expect(message.contents.type).toBe('bubble');
    });

    it('should include hero image with correct OG image URL (endpoint URL)', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );
      const bubble = message.contents;

      expect(bubble.hero).toBeDefined();
      expect(bubble.hero?.type).toBe('image');
      // OG image should use endpoint URL (not permalink)
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
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );
      const body = message.contents.body;

      expect(body).toBeDefined();
      // Body should contain score display elements
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).toContain('20');
      expect(bodyStr).toContain('44');
    });

    describe('body buttons', () => {
      it('should include primary button for viewing result with permalink URL', () => {
        const result: ShareResult = {
          encodedMoves: 'DEF456',
          side: 'b',
          blackCount: 32,
          whiteCount: 32,
          winner: 'draw',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const bodyStr = JSON.stringify(message.contents.body);

        // Body should contain primary button with permalink URI
        expect(bodyStr).toContain(
          'https://miniapp.line.me/test-liff-id/r/b/DEF456'
        );
        // Button label: "対局結果を見る"
        expect(bodyStr).toContain('\u5BFE\u5C40\u7D50\u679C\u3092\u898B\u308B');
      });

      it('should include link button for starting new game with home URL', () => {
        const result: ShareResult = {
          encodedMoves: 'ABC123',
          side: 'b',
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const bodyStr = JSON.stringify(message.contents.body);

        // Body should contain link button with home URL
        expect(bodyStr).toContain('https://miniapp.line.me/test-liff-id');
        // Button label: "新しく対局する ● vs ○"
        expect(bodyStr).toContain(
          '\u65B0\u3057\u304F\u5BFE\u5C40\u3059\u308B \u25CF vs \u25CB'
        );
      });

      it('should include AI challenge text after buttons', () => {
        const result: ShareResult = {
          encodedMoves: 'ABC123',
          side: 'b',
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const bodyStr = JSON.stringify(message.contents.body);

        // Body should contain "AIに勝てるかな？"
        expect(bodyStr).toContain(
          'AI\u306B\u52DD\u3066\u308B\u304B\u306A\uFF1F'
        );
      });
    });

    it('should use LINE green color for CTA buttons', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );
      const bodyStr = JSON.stringify(message.contents.body);

      // LINE green: #06C755
      expect(bodyStr).toContain('#06C755');
    });

    it('should set altText with game result summary', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 36,
        whiteCount: 28,
        winner: 'black',
      };
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

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
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );
      const bodyStr = JSON.stringify(message.contents.body);

      // Winner section should have crown emoji
      expect(bodyStr).toContain('\uD83D\uDC51');
    });

    it('should handle draw result correctly', () => {
      const result: ShareResult = {
        encodedMoves: 'ABC123',
        side: 'b',
        blackCount: 32,
        whiteCount: 32,
        winner: 'draw',
      };
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

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
      const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
        result.side,
        result.encodedMoves
      );

      const message = buildFlexMessage(
        result,
        permalinkUrl,
        ogImageUrl,
        homeUrl
      );

      // OG image should use endpoint URL
      expect(message.contents.hero?.url).toBe(
        'https://example.com/r/w/XYZ/opengraph-image'
      );
    });

    describe('footer branding', () => {
      it('should include app icon in footer', () => {
        const result: ShareResult = {
          encodedMoves: 'ABC123',
          side: 'b',
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const footerStr = JSON.stringify(message.contents.footer);

        // Footer should contain app icon URL
        expect(footerStr).toContain(APP_ICON_URL);
      });

      it('should include app name in footer', () => {
        const result: ShareResult = {
          encodedMoves: 'ABC123',
          side: 'b',
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const footerStr = JSON.stringify(message.contents.footer);

        // Footer should contain app name "かんたんリバーシ"
        expect(footerStr).toContain(
          '\u304B\u3093\u305F\u3093\u30EA\u30D0\u30FC\u30B7'
        );
      });

      it('should include arrow icon with home URL link', () => {
        const result: ShareResult = {
          encodedMoves: 'ABC123',
          side: 'b',
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const footerStr = JSON.stringify(message.contents.footer);

        // Footer should contain arrow icon URL
        expect(footerStr).toContain(ARROW_ICON_URL);
        // Arrow icon should link to home URL
        expect(footerStr).toContain('https://miniapp.line.me/test-liff-id');
      });

      it('should set aspectMode fit on branding icons', () => {
        const result: ShareResult = {
          encodedMoves: 'ABC123',
          side: 'b',
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const footerStr = JSON.stringify(message.contents.footer);

        // Branding icons should have aspectMode fit
        expect(footerStr).toContain('"aspectMode":"fit"');
      });

      it('should set spacing on branding box and footer', () => {
        const result: ShareResult = {
          encodedMoves: 'ABC123',
          side: 'b',
          blackCount: 36,
          whiteCount: 28,
          winner: 'black',
        };
        const { permalinkUrl, ogImageUrl, homeUrl } = buildTestUrls(
          result.side,
          result.encodedMoves
        );

        const message = buildFlexMessage(
          result,
          permalinkUrl,
          ogImageUrl,
          homeUrl
        );
        const footerStr = JSON.stringify(message.contents.footer);

        // Footer and branding box should have spacing set
        expect(footerStr).toContain('"spacing":"md"');
      });
    });
  });

  describe('constants', () => {
    it('should export APP_ICON_URL constant', () => {
      expect(APP_ICON_URL).toBe(
        'https://ch.line-scdn.net/0h13VXrO22bhxrIXCF_PERSzl8ZX5YQ3AXSRV6ewteRmUGQis6HxRqAgZxM0gPQkshHCZHOwheQkdHcE8qCxJEewdxViQCRE9KFjtXc09zRn4AanUQXztR/f256x256'
      );
    });

    it('should export ARROW_ICON_URL constant', () => {
      expect(ARROW_ICON_URL).toBe(
        'https://vos.line-scdn.net/service-notifier/footer_go_btn.png'
      );
    });
  });
});
