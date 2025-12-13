import React from 'react';
import type { Metadata, Viewport } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LiffProvider } from '@/contexts/LiffProvider';
import './globals.css';

/**
 * Get base URL for metadata
 * Priority: NEXT_PUBLIC_BASE_URL (explicit) > VERCEL_URL (auto) > localhost
 */
function getBaseUrl(): string {
  // Explicit base URL (highest priority)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Vercel Production/Preview deployments (auto-generated)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Local development fallback
  return 'http://localhost:3000';
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'LINE Reversi - リバーシゲーム',
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
