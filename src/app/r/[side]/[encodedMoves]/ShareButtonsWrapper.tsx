'use client';

import React from 'react';
import { ShareButtons } from '@/components/ShareButtons';
import type { ShareResult } from '@/lib/share/flex-message-builder';

interface Props {
  result: ShareResult;
  /** Fallback base URL from server for SSR */
  serverBaseUrl: string;
}

export function ShareButtonsWrapper({ result, serverBaseUrl }: Props) {
  // Prefer actual window origin on client, fall back to server-provided URL
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : serverBaseUrl;

  // LIFF ID for permalink generation
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  return <ShareButtons result={result} baseUrl={baseUrl} liffId={liffId} />;
}
