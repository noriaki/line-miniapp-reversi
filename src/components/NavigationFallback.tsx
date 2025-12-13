'use client';

import React, { useEffect, useState, useCallback, type JSX } from 'react';
import { useRouter } from 'next/navigation';

export interface NavigationFallbackProps {
  /** Target URL to navigate to */
  readonly targetUrl: string;
  /** Timeout in milliseconds before showing fallback button (default: 2000) */
  readonly timeoutMs?: number;
}

/**
 * NavigationFallback component
 * Shows a fallback button after timeout for manual navigation
 * Used when automatic navigation might fail (network issues, JS disabled edge cases)
 */
export function NavigationFallback({
  targetUrl,
  timeoutMs = 2000,
}: NavigationFallbackProps): JSX.Element {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [timeoutMs]);

  const handleClick = useCallback(() => {
    router.push(targetUrl);
  }, [router, targetUrl]);

  if (!showButton) {
    return <div data-testid="navigation-fallback-container" />;
  }

  return (
    <div data-testid="navigation-fallback-container" className="mt-4">
      <button
        onClick={handleClick}
        data-testid="navigation-fallback-button"
        className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        aria-label="結果を確認する"
      >
        結果を確認する
      </button>
    </div>
  );
}
