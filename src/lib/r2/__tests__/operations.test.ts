/**
 * Unit tests for R2 operations module
 * Tests object existence check, upload, and URL builder functions
 */

import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  HeadObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

// Mock the client module
jest.mock('../client', () => ({
  r2Client: {
    send: jest.fn(),
  },
  R2_BUCKET: 'test-bucket',
  R2_PUBLIC_DOMAIN: 'test.example.com',
}));

describe('R2 Operations', () => {
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { r2Client } = require('../client');
    mockSend = r2Client.send as jest.Mock;
  });

  describe('checkR2Exists', () => {
    it('should return true when object exists', async () => {
      mockSend.mockResolvedValueOnce({});

      const { checkR2Exists } = await import('../operations');
      const result = await checkR2Exists('og/b/abc123.png');

      expect(result).toBe(true);
      expect(HeadObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'og/b/abc123.png',
      });
    });

    it('should return false when object does not exist (404)', async () => {
      const notFoundError = new Error('NotFound');
      (notFoundError as NodeJS.ErrnoException).name = 'NotFound';
      mockSend.mockRejectedValueOnce(notFoundError);

      const { checkR2Exists } = await import('../operations');
      const result = await checkR2Exists('og/b/nonexistent.png');

      expect(result).toBe(false);
    });

    it('should throw error on connection failure', async () => {
      const connectionError = new Error('Connection failed');
      connectionError.name = 'NetworkError';
      mockSend.mockRejectedValueOnce(connectionError);

      const { checkR2Exists } = await import('../operations');

      await expect(checkR2Exists('og/b/abc123.png')).rejects.toThrow(
        'Connection failed'
      );
    });

    it('should log error before throwing on connection failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const connectionError = new Error('R2 connection error');
      connectionError.name = 'NetworkError';
      mockSend.mockRejectedValueOnce(connectionError);

      const { checkR2Exists } = await import('../operations');

      await expect(checkR2Exists('og/b/abc123.png')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('uploadToR2', () => {
    it('should upload buffer with correct ContentType', async () => {
      mockSend.mockResolvedValueOnce({});

      const { uploadToR2 } = await import('../operations');
      const buffer = Buffer.from('test image data');

      await uploadToR2('og/b/abc123.png', buffer);

      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'og/b/abc123.png',
        Body: buffer,
        ContentType: 'image/png',
      });
    });

    it('should complete without error on successful upload', async () => {
      mockSend.mockResolvedValueOnce({});

      const { uploadToR2 } = await import('../operations');
      const buffer = Buffer.from('test image data');

      await expect(
        uploadToR2('og/b/abc123.png', buffer)
      ).resolves.toBeUndefined();
    });

    it('should throw error on upload failure', async () => {
      const uploadError = new Error('Upload failed');
      mockSend.mockRejectedValueOnce(uploadError);

      const { uploadToR2 } = await import('../operations');
      const buffer = Buffer.from('test image data');

      await expect(uploadToR2('og/b/abc123.png', buffer)).rejects.toThrow(
        'Upload failed'
      );
    });

    it('should log error before throwing on upload failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const uploadError = new Error('R2 upload error');
      mockSend.mockRejectedValueOnce(uploadError);

      const { uploadToR2 } = await import('../operations');
      const buffer = Buffer.from('test image data');

      await expect(uploadToR2('og/b/abc123.png', buffer)).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('buildR2Url', () => {
    it('should build correct URL format', async () => {
      const { buildR2Url } = await import('../operations');
      const url = buildR2Url('og/b/abc123.png');

      expect(url).toBe('https://test.example.com/og/b/abc123.png');
    });

    it('should handle key without leading slash', async () => {
      const { buildR2Url } = await import('../operations');
      const url = buildR2Url('og/w/xyz789.png');

      expect(url).toBe('https://test.example.com/og/w/xyz789.png');
    });

    it('should handle key with special characters', async () => {
      const { buildR2Url } = await import('../operations');
      const url = buildR2Url('og/b/abc-123_def.png');

      expect(url).toBe('https://test.example.com/og/b/abc-123_def.png');
    });
  });
});
