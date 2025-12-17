/**
 * URL Builder for Share Functionality
 *
 * Provides pure functions for URL construction in LINE Mini App.
 * - Permalinks: For sharing within LINE (opens in LINE app)
 * - Endpoint URLs: For OGP images (accessed by external crawlers)
 */

/** LINE Mini App permalink domain (fixed) */
const MINIAPP_DOMAIN = 'https://miniapp.line.me' as const;

/**
 * Build LINE Mini App permalink URL
 *
 * @param liffId - LIFF ID (e.g., "2008360924-2LG5QXmN")
 * @param path - Path starting with "/" (e.g., "/r/b/ABC123")
 * @returns Permalink URL for LINE app navigation
 * @example
 * buildPermalink("1234-abc", "/r/b/XYZ")
 * // => "https://miniapp.line.me/1234-abc/r/b/XYZ"
 */
export function buildPermalink(liffId: string, path: string): string {
  return `${MINIAPP_DOMAIN}/${liffId}${path}`;
}

/**
 * Build LINE Mini App home URL (for new game navigation)
 *
 * @param liffId - LIFF ID (e.g., "2008360924-2LG5QXmN")
 * @returns Home URL for LINE Mini App
 * @example
 * buildHomeUrl("1234-abc")
 * // => "https://miniapp.line.me/1234-abc"
 */
export function buildHomeUrl(liffId: string): string {
  return `${MINIAPP_DOMAIN}/${liffId}`;
}

/**
 * Build endpoint URL for external access (OGP images, crawlers)
 *
 * @param baseUrl - Base endpoint URL (e.g., "https://example.com")
 * @param path - Path starting with "/" (e.g., "/r/b/ABC123/opengraph-image")
 * @returns Full endpoint URL
 * @example
 * buildEndpointUrl("https://example.com", "/r/b/XYZ/opengraph-image")
 * // => "https://example.com/r/b/XYZ/opengraph-image"
 */
export function buildEndpointUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path}`;
}

/**
 * Build result page path
 *
 * @param side - Player side ("b" for black, "w" for white)
 * @param encodedMoves - Encoded game moves (Base64URL)
 * @returns Path like "/r/b/ABC123"
 */
export function buildResultPath(side: 'b' | 'w', encodedMoves: string): string {
  return `/r/${side}/${encodedMoves}`;
}

/**
 * Build OG image path
 *
 * @param side - Player side ("b" for black, "w" for white)
 * @param encodedMoves - Encoded game moves (Base64URL)
 * @returns Path like "/r/b/ABC123/opengraph-image"
 */
export function buildOgImagePath(
  side: 'b' | 'w',
  encodedMoves: string
): string {
  return `${buildResultPath(side, encodedMoves)}/opengraph-image`;
}
