/**
 * Tests for getBaseUrl utility function
 * Verifies environment variable priority and fallback behavior
 */

describe('getBaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Clear all relevant environment variables
    delete process.env.BASE_URL;
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should prioritize BASE_URL when set', async () => {
    process.env.BASE_URL = 'custom.example.com';
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_URL = 'preview.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'prod.example.com';

    const { getBaseUrl } = await import('../get-base-url');
    expect(getBaseUrl()).toBe('https://custom.example.com');
  });

  it('should use VERCEL_URL in preview environment', async () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_URL = 'my-app-abc123.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'prod.example.com';

    const { getBaseUrl } = await import('../get-base-url');
    expect(getBaseUrl()).toBe('https://my-app-abc123.vercel.app');
  });

  it('should use VERCEL_PROJECT_PRODUCTION_URL in production environment', async () => {
    process.env.VERCEL_ENV = 'production';
    process.env.VERCEL_URL = 'my-app-abc123.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'prod.example.com';

    const { getBaseUrl } = await import('../get-base-url');
    expect(getBaseUrl()).toBe('https://prod.example.com');
  });

  it('should use VERCEL_PROJECT_PRODUCTION_URL when VERCEL_ENV is not set', async () => {
    process.env.VERCEL_URL = 'my-app-abc123.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'prod.example.com';

    const { getBaseUrl } = await import('../get-base-url');
    expect(getBaseUrl()).toBe('https://prod.example.com');
  });

  it('should not use VERCEL_URL when VERCEL_ENV is preview but VERCEL_URL is not set', async () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'prod.example.com';

    const { getBaseUrl } = await import('../get-base-url');
    expect(getBaseUrl()).toBe('https://prod.example.com');
  });

  it('should fallback to localhost when no environment variables are set', async () => {
    const { getBaseUrl } = await import('../get-base-url');
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });

  it('should not use preview URL in development environment', async () => {
    process.env.VERCEL_ENV = 'development';
    process.env.VERCEL_URL = 'my-app-abc123.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'prod.example.com';

    const { getBaseUrl } = await import('../get-base-url');
    expect(getBaseUrl()).toBe('https://prod.example.com');
  });
});
