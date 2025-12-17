import {
  buildPermalink,
  buildHomeUrl,
  buildEndpointUrl,
  buildResultPath,
  buildOgImagePath,
} from '../url-builder';

describe('URL Builder', () => {
  describe('buildPermalink', () => {
    it('should build correct permalink URL with LIFF ID and path', () => {
      const result = buildPermalink('1234-abc', '/r/b/XYZ');
      expect(result).toBe('https://miniapp.line.me/1234-abc/r/b/XYZ');
    });

    it('should handle complex LIFF ID format', () => {
      const result = buildPermalink('2008360924-2LG5QXmN', '/r/w/ABC123DEF');
      expect(result).toBe(
        'https://miniapp.line.me/2008360924-2LG5QXmN/r/w/ABC123DEF'
      );
    });

    it('should handle root path', () => {
      const result = buildPermalink('1234-abc', '/');
      expect(result).toBe('https://miniapp.line.me/1234-abc/');
    });

    it('should handle path with query parameters', () => {
      const result = buildPermalink('1234-abc', '/r/b/XYZ?foo=bar');
      expect(result).toBe('https://miniapp.line.me/1234-abc/r/b/XYZ?foo=bar');
    });
  });

  describe('buildHomeUrl', () => {
    it('should build correct home URL with LIFF ID', () => {
      const result = buildHomeUrl('1234-abc');
      expect(result).toBe('https://miniapp.line.me/1234-abc');
    });

    it('should handle complex LIFF ID format', () => {
      const result = buildHomeUrl('2008360924-2LG5QXmN');
      expect(result).toBe('https://miniapp.line.me/2008360924-2LG5QXmN');
    });

    it('should return equivalent URL to buildPermalink with empty path', () => {
      const liffId = '1234-abc';
      const homeUrl = buildHomeUrl(liffId);
      const permalinkUrl = buildPermalink(liffId, '');
      expect(homeUrl).toBe(permalinkUrl);
    });
  });

  describe('buildEndpointUrl', () => {
    it('should build correct endpoint URL with base URL and path', () => {
      const result = buildEndpointUrl(
        'https://example.com',
        '/r/b/XYZ/opengraph-image'
      );
      expect(result).toBe('https://example.com/r/b/XYZ/opengraph-image');
    });

    it('should handle localhost base URL', () => {
      const result = buildEndpointUrl('http://localhost:3000', '/r/w/ABC');
      expect(result).toBe('http://localhost:3000/r/w/ABC');
    });

    it('should handle ngrok base URL', () => {
      const result = buildEndpointUrl(
        'https://aleta-bowlike-tyree.ngrok-free.dev',
        '/r/b/XYZ'
      );
      expect(result).toBe('https://aleta-bowlike-tyree.ngrok-free.dev/r/b/XYZ');
    });

    it('should handle Vercel deployment URL', () => {
      const result = buildEndpointUrl(
        'https://line-miniapp-reversi.vercel.app',
        '/r/b/ABC123/opengraph-image'
      );
      expect(result).toBe(
        'https://line-miniapp-reversi.vercel.app/r/b/ABC123/opengraph-image'
      );
    });
  });

  describe('buildResultPath', () => {
    it('should build correct path for black side', () => {
      const result = buildResultPath('b', 'ABC123');
      expect(result).toBe('/r/b/ABC123');
    });

    it('should build correct path for white side', () => {
      const result = buildResultPath('w', 'XYZ789');
      expect(result).toBe('/r/w/XYZ789');
    });

    it('should handle empty encoded moves', () => {
      const result = buildResultPath('b', '');
      expect(result).toBe('/r/b/');
    });

    it('should handle complex encoded moves', () => {
      const result = buildResultPath('b', 'MjI0NTQ4NjI3MzE2');
      expect(result).toBe('/r/b/MjI0NTQ4NjI3MzE2');
    });
  });

  describe('buildOgImagePath', () => {
    it('should build correct OG image path for black side', () => {
      const result = buildOgImagePath('b', 'ABC123');
      expect(result).toBe('/r/b/ABC123/opengraph-image');
    });

    it('should build correct OG image path for white side', () => {
      const result = buildOgImagePath('w', 'XYZ789');
      expect(result).toBe('/r/w/XYZ789/opengraph-image');
    });

    it('should compose correctly with buildResultPath', () => {
      const encodedMoves = 'TestMoves123';
      const side = 'b' as const;

      const ogPath = buildOgImagePath(side, encodedMoves);
      const resultPath = buildResultPath(side, encodedMoves);

      expect(ogPath).toBe(`${resultPath}/opengraph-image`);
    });
  });

  describe('Integration', () => {
    it('should build complete permalink from result path', () => {
      const liffId = '2008360924-2LG5QXmN';
      const side = 'b' as const;
      const encodedMoves = 'ABC123';

      const path = buildResultPath(side, encodedMoves);
      const permalink = buildPermalink(liffId, path);

      expect(permalink).toBe(
        'https://miniapp.line.me/2008360924-2LG5QXmN/r/b/ABC123'
      );
    });

    it('should build complete endpoint URL for OG image', () => {
      const baseUrl = 'https://example.com';
      const side = 'w' as const;
      const encodedMoves = 'XYZ789';

      const ogPath = buildOgImagePath(side, encodedMoves);
      const ogUrl = buildEndpointUrl(baseUrl, ogPath);

      expect(ogUrl).toBe('https://example.com/r/w/XYZ789/opengraph-image');
    });
  });
});
