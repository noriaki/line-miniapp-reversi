import React from 'react';
import type { Metadata, Viewport } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LiffProvider } from '@/contexts/LiffProvider';
import './globals.css';

export const metadata: Metadata = {
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
