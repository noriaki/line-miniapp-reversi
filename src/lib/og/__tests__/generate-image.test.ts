/**
 * OG Image Generator Tests
 * Tests for the OG image generation logic
 *
 * Note: ImageResponse requires server-side APIs (ReadableStream) not available in JSDOM.
 * Tests mock ImageResponse to verify the logic and return a fake PNG buffer.
 * Full image generation is tested via integration tests.
 */

import { encodeMoves } from '@/lib/share/move-encoder';
import type { Position } from '@/lib/game/types';

// Create a minimal valid PNG buffer for testing (1200x630)
// PNG signature + IHDR chunk with dimensions
function createMockPngBuffer(
  width: number = 1200,
  height: number = 630
): Buffer {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0); // width
  ihdrData.writeUInt32BE(height, 4); // height
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrType = Buffer.from('IHDR');
  const ihdrLength = Buffer.alloc(4);
  ihdrLength.writeUInt32BE(13, 0);

  // CRC placeholder
  const ihdrCrc = Buffer.alloc(4);

  // IEND chunk
  const iendLength = Buffer.alloc(4);
  const iendType = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);

  return Buffer.concat([
    signature,
    ihdrLength,
    ihdrType,
    ihdrData,
    ihdrCrc,
    iendLength,
    iendType,
    iendCrc,
  ]);
}

// Mock ImageResponse since it requires server-side APIs
const mockPngBuffer = createMockPngBuffer();
jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation(() => ({
    arrayBuffer: jest
      .fn()
      .mockResolvedValue(
        mockPngBuffer.buffer.slice(
          mockPngBuffer.byteOffset,
          mockPngBuffer.byteOffset + mockPngBuffer.byteLength
        )
      ),
  })),
}));

// Sample valid game moves
const sampleMoves: Position[] = [
  { row: 2, col: 3 }, // d3 (index 19 = 'T')
];

// Valid multi-move game sequence
const multiMoveGame: Position[] = [
  { row: 2, col: 3 }, // d3
  { row: 2, col: 2 }, // c3
  { row: 2, col: 1 }, // b3
];

describe('OgImageGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOgImageBuffer', () => {
    // Need to import after mocking
    const importGenerateImage = async () => {
      return import('../generate-image');
    };

    it('should return a Buffer for valid encoded moves', async () => {
      const { generateOgImageBuffer } = await importGenerateImage();
      const validEncodedMoves = encodeMoves(sampleMoves);

      const result = await generateOgImageBuffer(validEncodedMoves);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return a Buffer for empty moves string (initial board)', async () => {
      const { generateOgImageBuffer } = await importGenerateImage();
      const emptyMoves = '';

      const result = await generateOgImageBuffer(emptyMoves);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return a Buffer for multi-move game', async () => {
      const { generateOgImageBuffer } = await importGenerateImage();
      const encodedMoves = encodeMoves(multiMoveGame);

      const result = await generateOgImageBuffer(encodedMoves);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw an error for invalid encoded moves', async () => {
      const { generateOgImageBuffer } = await importGenerateImage();
      // Invalid characters that are not in Base64URL
      const invalidEncodedMoves = '!!!invalid!!!';

      await expect(generateOgImageBuffer(invalidEncodedMoves)).rejects.toThrow(
        /Failed to decode moves/
      );
    });

    it('should throw an error for invalid move sequence', async () => {
      const { generateOgImageBuffer } = await importGenerateImage();
      // Valid Base64URL but invalid move sequence (A = row 0, col 0 which is not valid as first move)
      const invalidMoveSequence = 'A';

      await expect(generateOgImageBuffer(invalidMoveSequence)).rejects.toThrow(
        /Failed to replay moves/
      );
    });

    it('should generate image with correct dimensions (1200x630)', async () => {
      const { generateOgImageBuffer } = await importGenerateImage();
      const validEncodedMoves = encodeMoves(sampleMoves);

      const result = await generateOgImageBuffer(validEncodedMoves);

      // PNG file signature check
      const pngSignature = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(result.subarray(0, 8)).toEqual(pngSignature);

      // Parse PNG IHDR chunk for dimensions
      const ihdrOffset = 8;
      const ihdrType = result.toString('ascii', ihdrOffset + 4, ihdrOffset + 8);
      expect(ihdrType).toBe('IHDR');

      const width = result.readUInt32BE(ihdrOffset + 8);
      const height = result.readUInt32BE(ihdrOffset + 12);

      expect(width).toBe(1200);
      expect(height).toBe(630);
    });

    it('should call ImageResponse with correct size options', async () => {
      const { generateOgImageBuffer, OG_IMAGE_SIZE } =
        await importGenerateImage();
      const { ImageResponse } = (await import('next/og')) as unknown as {
        ImageResponse: jest.Mock;
      };
      const validEncodedMoves = encodeMoves(sampleMoves);

      await generateOgImageBuffer(validEncodedMoves);

      expect(ImageResponse).toHaveBeenCalled();
      const lastCall = ImageResponse.mock.calls[0];
      expect(lastCall[1]).toEqual(OG_IMAGE_SIZE);
    });
  });
});
