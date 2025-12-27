/**
 * OgImagePrefetch Component
 * Triggers OGP image generation via API route on page mount
 *
 * Design Notes:
 * - Client Component for useEffect access
 * - fire-and-forget: Response and errors are silently ignored
 * - Duplicate requests are tolerated (R2 HeadObject check prevents duplicate uploads)
 * - No visible output (renders null)
 */

'use client';

import { useEffect } from 'react';

/** Props for OgImagePrefetch component */
export interface OgImagePrefetchProps {
  /** Player side ('b' for black, 'w' for white) */
  readonly side: 'b' | 'w';
  /** Base64URL encoded moves string */
  readonly encodedMoves: string;
}

/**
 * OgImagePrefetch Component
 *
 * Triggers the OG image generation API route when the page mounts.
 * This ensures the OGP image is generated and cached in R2 for subsequent
 * SNS crawler requests.
 *
 * The component uses a fire-and-forget pattern:
 * - No state management needed
 * - Network errors are silently ignored (user experience unaffected)
 * - API response is not used
 *
 * @param props - Component props
 * @returns null (no visible output)
 */
export function OgImagePrefetch({
  side,
  encodedMoves,
}: OgImagePrefetchProps): null {
  useEffect(() => {
    // Build API URL
    const apiUrl = `/api/og/${side}/${encodedMoves}`;

    // Fire-and-forget fetch with no cache
    // Using void to explicitly ignore the promise
    void fetch(apiUrl, { cache: 'no-store' }).catch(() => {
      // Silently ignore network errors
      // OGP image generation is a best-effort optimization
      // User experience is not affected if this fails
    });
  }, [side, encodedMoves]);

  // No visible output
  return null;
}
