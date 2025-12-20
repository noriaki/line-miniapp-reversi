/**
 * Get base URL for the application
 * Priority: BASE_URL > VERCEL_URL (preview) > VERCEL_PROJECT_PRODUCTION_URL > localhost
 *
 * @returns The base URL with protocol (https:// or http://)
 */
export function getBaseUrl(): string {
  // Explicit base URL (highest priority, server-side only)
  if (process.env.BASE_URL) {
    return `https://${process.env.BASE_URL}`;
  }
  // Preview environment: use deployment-specific URL
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Production environment: use production URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Local development fallback
  return 'http://localhost:3000';
}
