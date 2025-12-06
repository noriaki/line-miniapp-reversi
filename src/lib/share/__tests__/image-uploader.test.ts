/**
 * Image Uploader Tests
 */

import { uploadImage, type UploadResult } from '../image-uploader';

describe('Image Uploader', () => {
  // Store original fetch and env
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  describe('uploadImage', () => {
    const mockBlob = new Blob(['test image data'], { type: 'image/png' });

    describe('Success scenarios', () => {
      it('should upload image and return public URL', async () => {
        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          // First call: get presigned URL
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          // Second call: upload to presigned URL
          .mockResolvedValueOnce({
            ok: true,
          } as Response);

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(mockPresignedResponse.publicUrl);
        }
      });

      it('should call presigned URL API with correct content type and size', async () => {
        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
          } as Response);

        await uploadImage(mockBlob);

        // Verify first call (presigned URL request)
        expect(global.fetch).toHaveBeenNthCalledWith(
          1,
          expect.stringContaining('/api/upload/presigned'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify({
              contentType: 'image/png',
              fileSize: mockBlob.size,
            }),
          })
        );
      });

      it('should upload blob to presigned URL with PUT method', async () => {
        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
          } as Response);

        await uploadImage(mockBlob);

        // Verify second call (upload request)
        expect(global.fetch).toHaveBeenNthCalledWith(
          2,
          mockPresignedResponse.uploadUrl,
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'image/png',
            }),
            body: mockBlob,
          })
        );
      });
    });

    describe('Environment variable configuration', () => {
      it('should use NEXT_PUBLIC_SHARE_API_URL when set', async () => {
        process.env.NEXT_PUBLIC_SHARE_API_URL =
          'https://custom-api.example.com';

        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
          } as Response);

        await uploadImage(mockBlob);

        expect(global.fetch).toHaveBeenNthCalledWith(
          1,
          'https://custom-api.example.com/api/upload/presigned',
          expect.any(Object)
        );
      });

      it('should use relative path when NEXT_PUBLIC_SHARE_API_URL is not set', async () => {
        delete process.env.NEXT_PUBLIC_SHARE_API_URL;

        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
          } as Response);

        await uploadImage(mockBlob);

        expect(global.fetch).toHaveBeenNthCalledWith(
          1,
          '/api/upload/presigned',
          expect.any(Object)
        );
      });
    });

    describe('Error handling', () => {
      it('should return error when presigned URL request fails', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response);

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('upload_failed');
        }
      });

      it('should return error when presigned URL response is invalid', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ invalid: 'response' }),
        } as Response);

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('upload_failed');
        }
      });

      it('should return error when presigned URL response is null', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(null),
        } as Response);

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(false);
        if (!result.success && result.error.type === 'upload_failed') {
          expect(result.error.message).toBe('Invalid presigned URL response');
        }
      });

      it('should return error when upload to presigned URL fails', async () => {
        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          .mockResolvedValueOnce({
            ok: false,
            status: 403,
            statusText: 'Forbidden',
          } as Response);

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('upload_failed');
        }
      });

      it('should return error when fetch throws network error during presigned URL request', async () => {
        global.fetch = jest
          .fn()
          .mockRejectedValueOnce(new Error('Network error'));

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('upload_failed');
        }
      });

      it('should return error when fetch throws network error during upload', async () => {
        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          // First call succeeds (presigned URL)
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          // Second call throws (upload)
          .mockRejectedValueOnce(new Error('Upload network error'));

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(false);
        if (!result.success && result.error.type === 'upload_failed') {
          expect(result.error.message).toBe('Upload network error');
        }
      });

      it('should return specific error for 413 Payload Too Large', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: false,
          status: 413,
          statusText: 'Payload Too Large',
        } as Response);

        const result = await uploadImage(mockBlob);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('image_too_large');
        }
      });
    });

    describe('Result type structure', () => {
      it('should return UploadResult with success=true and data on success', async () => {
        const mockPresignedResponse = {
          uploadUrl: 'https://r2.example.com/upload/test-id',
          publicUrl: 'https://r2.example.com/images/test-id.png',
          expiresIn: 300,
        };

        global.fetch = jest
          .fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPresignedResponse),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
          } as Response);

        const result: UploadResult = await uploadImage(mockBlob);

        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('data');
      });

      it('should return UploadResult with success=false and error on failure', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response);

        const result: UploadResult = await uploadImage(mockBlob);

        expect(result).toHaveProperty('success', false);
        expect(result).toHaveProperty('error');
      });
    });
  });
});
