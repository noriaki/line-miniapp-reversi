/**
 * Integration tests for OG image generation API Route
 * Tests R2 integration, image generation, and error handling
 */

import { encodeMoves } from '@/lib/share/move-encoder';
import type { Position } from '@/lib/game/types';

// Mock NextResponse.json to work in Jest environment
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: (body: unknown, init?: ResponseInit) => {
        return new Response(JSON.stringify(body), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        });
      },
    },
  };
});

// Create a minimal valid PNG buffer for testing
function createMockPngBuffer(): Buffer {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(1200, 0);
  ihdrData.writeUInt32BE(630, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrType = Buffer.from('IHDR');
  const ihdrLength = Buffer.alloc(4);
  ihdrLength.writeUInt32BE(13, 0);
  const ihdrCrc = Buffer.alloc(4);
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

// Mock R2 operations
const mockCheckR2Exists = jest.fn();
const mockUploadToR2 = jest.fn();

jest.mock('@/lib/r2', () => ({
  checkR2Exists: (...args: unknown[]) => mockCheckR2Exists(...args),
  uploadToR2: (...args: unknown[]) => mockUploadToR2(...args),
}));

// Mock OG image generator
const mockGenerateOgImageBuffer = jest.fn();

jest.mock('@/lib/og', () => ({
  generateOgImageBuffer: (...args: unknown[]) =>
    mockGenerateOgImageBuffer(...args),
}));

// Valid game moves for testing
const validMoves: Position[] = [{ row: 2, col: 3 }];
const validEncodedMoves = encodeMoves(validMoves);

describe('OG Image API Route', () => {
  let GET: (
    request: Request,
    context: { params: Promise<{ side: string; encodedMoves: string }> }
  ) => Promise<Response>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default mock implementations
    mockCheckR2Exists.mockResolvedValue(false);
    mockUploadToR2.mockResolvedValue(undefined);
    mockGenerateOgImageBuffer.mockResolvedValue(createMockPngBuffer());

    // Import route handler fresh for each test
    jest.resetModules();
    const routeModule = await import('../route');
    GET = routeModule.GET;
  });

  describe('Image exists in R2', () => {
    it('should return exists status when image is already in R2', async () => {
      mockCheckR2Exists.mockResolvedValue(true);

      const request = new Request(
        'http://localhost/api/og/b/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'b',
        encodedMoves: validEncodedMoves,
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('exists');
      expect(data.key).toBe(`og/b/${validEncodedMoves}.png`);
      expect(mockGenerateOgImageBuffer).not.toHaveBeenCalled();
      expect(mockUploadToR2).not.toHaveBeenCalled();
    });

    it('should check R2 with correct key format', async () => {
      mockCheckR2Exists.mockResolvedValue(true);

      const request = new Request(
        'http://localhost/api/og/w/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'w',
        encodedMoves: validEncodedMoves,
      });

      await GET(request, { params });

      expect(mockCheckR2Exists).toHaveBeenCalledWith(
        `og/w/${validEncodedMoves}.png`
      );
    });
  });

  describe('Image not in R2 (new generation)', () => {
    it('should generate image and upload to R2 when not exists', async () => {
      mockCheckR2Exists.mockResolvedValue(false);
      const mockBuffer = createMockPngBuffer();
      mockGenerateOgImageBuffer.mockResolvedValue(mockBuffer);

      const request = new Request(
        'http://localhost/api/og/b/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'b',
        encodedMoves: validEncodedMoves,
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('created');
      expect(data.key).toBe(`og/b/${validEncodedMoves}.png`);
      expect(mockGenerateOgImageBuffer).toHaveBeenCalledWith(validEncodedMoves);
      expect(mockUploadToR2).toHaveBeenCalledWith(
        `og/b/${validEncodedMoves}.png`,
        mockBuffer
      );
    });

    it('should call functions in correct order: check, generate, upload', async () => {
      mockCheckR2Exists.mockResolvedValue(false);

      const callOrder: string[] = [];
      mockCheckR2Exists.mockImplementation(() => {
        callOrder.push('checkR2Exists');
        return Promise.resolve(false);
      });
      mockGenerateOgImageBuffer.mockImplementation(() => {
        callOrder.push('generateOgImageBuffer');
        return Promise.resolve(createMockPngBuffer());
      });
      mockUploadToR2.mockImplementation(() => {
        callOrder.push('uploadToR2');
        return Promise.resolve(undefined);
      });

      const request = new Request(
        'http://localhost/api/og/b/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'b',
        encodedMoves: validEncodedMoves,
      });

      await GET(request, { params });

      expect(callOrder).toEqual([
        'checkR2Exists',
        'generateOgImageBuffer',
        'uploadToR2',
      ]);
    });
  });

  describe('Invalid request validation', () => {
    it('should return 400 for invalid side (not b or w)', async () => {
      const request = new Request(
        'http://localhost/api/og/x/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'x',
        encodedMoves: validEncodedMoves,
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/invalid.*side/i);
      expect(mockCheckR2Exists).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid encodedMoves (invalid characters)', async () => {
      const invalidMoves = '!!!invalid!!!';

      // Make generateOgImageBuffer throw for invalid moves
      mockGenerateOgImageBuffer.mockRejectedValue(
        new Error('Failed to decode moves')
      );

      const request = new Request('http://localhost/api/og/b/' + invalidMoves);
      const params = Promise.resolve({ side: 'b', encodedMoves: invalidMoves });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toMatch(/invalid/i);
    });

    it('should return 400 for invalid move sequence', async () => {
      // 'A' represents position (0,0) which is not a valid first move
      const invalidSequence = 'A';

      mockGenerateOgImageBuffer.mockRejectedValue(
        new Error('Failed to replay moves')
      );

      const request = new Request(
        'http://localhost/api/og/b/' + invalidSequence
      );
      const params = Promise.resolve({
        side: 'b',
        encodedMoves: invalidSequence,
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should not save invalid moves to R2', async () => {
      const invalidMoves = '!!!invalid!!!';
      mockGenerateOgImageBuffer.mockRejectedValue(
        new Error('Failed to decode moves')
      );

      const request = new Request('http://localhost/api/og/b/' + invalidMoves);
      const params = Promise.resolve({ side: 'b', encodedMoves: invalidMoves });

      await GET(request, { params });

      expect(mockUploadToR2).not.toHaveBeenCalled();
    });
  });

  describe('R2 error handling', () => {
    it('should return 500 and log error when R2 checkR2Exists fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const r2Error = new Error('R2 connection failed');
      mockCheckR2Exists.mockRejectedValue(r2Error);

      const request = new Request(
        'http://localhost/api/og/b/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'b',
        encodedMoves: validEncodedMoves,
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return 500 and log error when R2 uploadToR2 fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCheckR2Exists.mockResolvedValue(false);
      mockGenerateOgImageBuffer.mockResolvedValue(createMockPngBuffer());
      const uploadError = new Error('R2 upload failed');
      mockUploadToR2.mockRejectedValue(uploadError);

      const request = new Request(
        'http://localhost/api/og/b/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'b',
        encodedMoves: validEncodedMoves,
      });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should include error context in log for debugging', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const r2Error = new Error('Connection timeout');
      mockCheckR2Exists.mockRejectedValue(r2Error);

      const request = new Request(
        'http://localhost/api/og/b/' + validEncodedMoves
      );
      const params = Promise.resolve({
        side: 'b',
        encodedMoves: validEncodedMoves,
      });

      await GET(request, { params });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('OG API'),
        expect.anything()
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty encodedMoves for initial board state', async () => {
      mockCheckR2Exists.mockResolvedValue(false);
      mockGenerateOgImageBuffer.mockResolvedValue(createMockPngBuffer());

      const request = new Request('http://localhost/api/og/b/');
      const params = Promise.resolve({ side: 'b', encodedMoves: '' });

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(mockGenerateOgImageBuffer).toHaveBeenCalledWith('');
    });

    it('should handle both b and w side values correctly', async () => {
      mockCheckR2Exists.mockResolvedValue(true);

      // Test 'b' side
      const requestB = new Request(
        'http://localhost/api/og/b/' + validEncodedMoves
      );
      const paramsB = Promise.resolve({
        side: 'b',
        encodedMoves: validEncodedMoves,
      });
      const responseB = await GET(requestB, { params: paramsB });
      expect(responseB.status).toBe(200);

      // Test 'w' side
      const requestW = new Request(
        'http://localhost/api/og/w/' + validEncodedMoves
      );
      const paramsW = Promise.resolve({
        side: 'w',
        encodedMoves: validEncodedMoves,
      });
      const responseW = await GET(requestW, { params: paramsW });
      expect(responseW.status).toBe(200);
    });
  });
});
