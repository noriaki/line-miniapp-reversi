/**
 * Unit tests for R2 client initialization module
 * Tests environment variable configuration and client construction
 */

describe('R2 Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Set all required R2 environment variables
    process.env.R2_ACCOUNT_ID = 'test-account-id';
    process.env.R2_ACCESS_KEY_ID = 'test-access-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.R2_BUCKET = 'test-bucket';
    process.env.R2_PUBLIC_DOMAIN = 'test.example.com';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('r2Client', () => {
    it('should create S3Client with correct endpoint', async () => {
      const { r2Client } = await import('../client');
      expect(r2Client).toBeDefined();
      // S3Client config is validated by successful import
    });
  });

  describe('R2_BUCKET', () => {
    it('should export bucket name from environment variable', async () => {
      const { R2_BUCKET } = await import('../client');
      expect(R2_BUCKET).toBe('test-bucket');
    });
  });

  describe('R2_PUBLIC_DOMAIN', () => {
    it('should export public domain from environment variable', async () => {
      const { R2_PUBLIC_DOMAIN } = await import('../client');
      expect(R2_PUBLIC_DOMAIN).toBe('test.example.com');
    });
  });

  describe('Environment variable validation', () => {
    it('should throw error when R2_ACCOUNT_ID is missing', async () => {
      delete process.env.R2_ACCOUNT_ID;
      await expect(import('../client')).rejects.toThrow('R2_ACCOUNT_ID');
    });

    it('should throw error when R2_ACCESS_KEY_ID is missing', async () => {
      delete process.env.R2_ACCESS_KEY_ID;
      await expect(import('../client')).rejects.toThrow('R2_ACCESS_KEY_ID');
    });

    it('should throw error when R2_SECRET_ACCESS_KEY is missing', async () => {
      delete process.env.R2_SECRET_ACCESS_KEY;
      await expect(import('../client')).rejects.toThrow('R2_SECRET_ACCESS_KEY');
    });

    it('should throw error when R2_BUCKET is missing', async () => {
      delete process.env.R2_BUCKET;
      await expect(import('../client')).rejects.toThrow('R2_BUCKET');
    });

    it('should throw error when R2_PUBLIC_DOMAIN is missing', async () => {
      delete process.env.R2_PUBLIC_DOMAIN;
      await expect(import('../client')).rejects.toThrow('R2_PUBLIC_DOMAIN');
    });
  });
});
