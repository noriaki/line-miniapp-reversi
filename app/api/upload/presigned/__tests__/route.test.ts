/**
 * Presigned URL API Route Tests
 *
 * Tests for /api/upload/presigned endpoint that generates
 * presigned URLs for uploading images to Cloudflare R2.
 */

import { POST } from '../route';

// Mock AWS SDK S3 Client
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
}));

// Mock S3 presigner
const mockGetSignedUrl = jest.fn();
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

describe('POST /api/upload/presigned', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      R2_ENDPOINT: 'https://test-account.r2.cloudflarestorage.com',
      R2_ACCESS_KEY_ID: 'test-access-key',
      R2_SECRET_ACCESS_KEY: 'test-secret-key',
      R2_BUCKET_NAME: 'test-bucket',
      R2_PUBLIC_URL: 'https://pub-test.r2.dev',
    };

    // Default mock implementation
    mockGetSignedUrl.mockResolvedValue(
      'https://test-account.r2.cloudflarestorage.com/test-bucket/share-images/mock-id.png?signature=xxx'
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('successful requests', () => {
    it('should return presigned URL for valid image/png request', async () => {
      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'image/png',
          fileSize: 500000,
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty('uploadUrl');
      expect(body).toHaveProperty('publicUrl');
      expect(body).toHaveProperty('expiresIn', 300);
      expect(body.uploadUrl).toContain('r2.cloudflarestorage.com');
      expect(body.publicUrl).toContain('pub-test.r2.dev');
    });

    it('should generate unique image IDs', async () => {
      const createRequest = () =>
        new Request('http://localhost/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: 'image/png',
            fileSize: 100000,
          }),
        });

      const response1 = await POST(createRequest());
      const response2 = await POST(createRequest());

      const body1 = await response1.json();
      const body2 = await response2.json();

      expect(body1.publicUrl).not.toBe(body2.publicUrl);
    });
  });

  describe('validation errors', () => {
    it('should return 400 for invalid JSON body', async () => {
      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
    });

    it('should return 400 for missing contentType', async () => {
      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileSize: 500000,
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('contentType');
    });

    it('should return 400 for missing fileSize', async () => {
      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'image/png',
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('fileSize');
    });

    it('should return 400 for non-image/png content type', async () => {
      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'image/jpeg',
          fileSize: 500000,
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('image/png');
    });

    it('should return 413 for file size exceeding 1MB', async () => {
      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'image/png',
          fileSize: 1048577, // 1MB + 1 byte
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(413);
      expect(body.error).toContain('1MB');
    });
  });

  describe('environment variable errors', () => {
    it('should return 500 when R2_ENDPOINT is missing', async () => {
      delete process.env.R2_ENDPOINT;

      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'image/png',
          fileSize: 500000,
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('configuration');
    });

    it('should return 500 when R2_ACCESS_KEY_ID is missing', async () => {
      delete process.env.R2_ACCESS_KEY_ID;

      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'image/png',
          fileSize: 500000,
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('configuration');
    });
  });

  describe('S3 client errors', () => {
    it('should return 500 when presigned URL generation fails', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('S3 error'));

      const request = new Request('http://localhost/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'image/png',
          fileSize: 500000,
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBeDefined();
    });
  });
});
