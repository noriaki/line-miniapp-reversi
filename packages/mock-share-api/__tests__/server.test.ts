import { describe, it, expect } from 'vitest';
import { createMockServer } from '../src/server';

describe('Mock Share API Server', () => {
  const app = createMockServer();

  describe('POST /api/upload/presigned', () => {
    it('should return presigned URL response with valid request', async () => {
      const request = new Request(
        'http://localhost:3001/api/upload/presigned',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentType: 'image/png',
            fileSize: 500000,
          }),
        }
      );

      const response = await app.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('uploadUrl');
      expect(data).toHaveProperty('publicUrl');
      expect(data).toHaveProperty('expiresIn');
      expect(data.uploadUrl).toMatch(/^http:\/\/localhost:\d+\/mock-upload\//);
      expect(data.publicUrl).toMatch(/^http:\/\/localhost:\d+\/mock-images\//);
      expect(typeof data.expiresIn).toBe('number');
      expect(data.expiresIn).toBe(300);
    });

    it('should return 400 for invalid content type', async () => {
      const request = new Request(
        'http://localhost:3001/api/upload/presigned',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentType: 'image/jpeg',
            fileSize: 500000,
          }),
        }
      );

      const response = await app.fetch(request);

      expect(response.status).toBe(400);
    });

    it('should return 413 for file size exceeding 1MB', async () => {
      const request = new Request(
        'http://localhost:3001/api/upload/presigned',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentType: 'image/png',
            fileSize: 1048577, // 1MB + 1 byte
          }),
        }
      );

      const response = await app.fetch(request);

      expect(response.status).toBe(413);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new Request(
        'http://localhost:3001/api/upload/presigned',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const response = await app.fetch(request);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /mock-upload/:id', () => {
    it('should accept image data and return 204 No Content', async () => {
      // Create a small PNG-like binary data
      const imageData = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);

      const request = new Request(
        'http://localhost:3001/mock-upload/test-image-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/png',
          },
          body: imageData,
        }
      );

      const response = await app.fetch(request);

      expect(response.status).toBe(204);
    });

    it('should accept any image ID', async () => {
      const imageData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

      const request = new Request(
        'http://localhost:3001/mock-upload/another-unique-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/png',
          },
          body: imageData,
        }
      );

      const response = await app.fetch(request);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /mock-images/:filename', () => {
    it('should return a placeholder image for any filename', async () => {
      const request = new Request(
        'http://localhost:3001/mock-images/test-image-id.png',
        {
          method: 'GET',
        }
      );

      const response = await app.fetch(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers in response', async () => {
      const request = new Request(
        'http://localhost:3001/api/upload/presigned',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://localhost:3000',
          },
          body: JSON.stringify({
            contentType: 'image/png',
            fileSize: 500000,
          }),
        }
      );

      const response = await app.fetch(request);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('should handle OPTIONS preflight request', async () => {
      const request = new Request(
        'http://localhost:3001/api/upload/presigned',
        {
          method: 'OPTIONS',
          headers: {
            Origin: 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST',
          },
        }
      );

      const response = await app.fetch(request);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'POST'
      );
    });
  });
});
