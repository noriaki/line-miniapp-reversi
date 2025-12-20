import React from 'react';
import type { Metadata, Viewport } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LiffProvider } from '@/contexts/LiffProvider';
import './globals.css';

/**
 * Get base URL for metadata
 * Priority: BASE_URL > VERCEL_URL (preview) > VERCEL_PROJECT_PRODUCTION_URL > localhost
 */
function getBaseUrl(): string {
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

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'Easy Reversi - かんたんリバーシ',
  description: 'LINEミニアプリで遊べるリバーシゲーム。AIと対戦しよう!',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#06C755',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <LiffProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </LiffProvider>
      </body>
    </html>
  );
}
