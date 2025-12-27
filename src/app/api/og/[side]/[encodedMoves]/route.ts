/**
 * OG Image Generation API Route
 * Handles OGP image generation and R2 caching
 *
 * GET /api/og/[side]/[encodedMoves]
 *
 * Responses:
 * - 200: { status: 'exists' | 'created', key: string }
 * - 400: { status: 'error', message: string } - Invalid side or encodedMoves
 * - 500: { status: 'error', message: string } - R2 or generation error
 */

import { NextResponse } from 'next/server';
import { checkR2Exists, uploadToR2 } from '@/lib/r2';
import { generateOgImageBuffer } from '@/lib/og';

/** Valid side values for player identification */
const VALID_SIDES = ['b', 'w'] as const;
type Side = (typeof VALID_SIDES)[number];

/** API response types */
type OgApiResponse =
  | { status: 'exists'; key: string }
  | { status: 'created'; key: string }
  | { status: 'error'; message: string };

/**
 * Validate side parameter
 */
function isValidSide(side: string): side is Side {
  return VALID_SIDES.includes(side as Side);
}

/**
 * Build R2 object key from side and encoded moves
 */
function buildImageKey(side: Side, encodedMoves: string): string {
  return `og/${side}/${encodedMoves}.png`;
}

/**
 * GET handler for OG image generation
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ side: string; encodedMoves: string }> }
): Promise<NextResponse<OgApiResponse>> {
  const { side, encodedMoves } = await params;

  // Validate side parameter
  if (!isValidSide(side)) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Invalid side parameter. Must be "b" or "w".',
      },
      { status: 400 }
    );
  }

  const imageKey = buildImageKey(side, encodedMoves);

  try {
    // Check if image already exists in R2
    const exists = await checkR2Exists(imageKey);

    if (exists) {
      return NextResponse.json({
        status: 'exists',
        key: imageKey,
      });
    }

    // Generate new image
    let imageBuffer: Buffer;
    try {
      imageBuffer = await generateOgImageBuffer(encodedMoves);
    } catch (error) {
      // Invalid moves - return 400
      const message =
        error instanceof Error ? error.message : 'Failed to generate image';
      return NextResponse.json(
        { status: 'error', message: `Invalid encodedMoves: ${message}` },
        { status: 400 }
      );
    }

    // Upload to R2
    await uploadToR2(imageKey, imageBuffer);

    return NextResponse.json({
      status: 'created',
      key: imageKey,
    });
  } catch (error) {
    // R2 connection or other server errors
    console.error('OG API error:', error);

    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}
