/**
 * Share Buttons Component
 * Renders LINE and Web Share buttons for game result sharing
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SiLine } from 'react-icons/si';
import { FiShare2 } from 'react-icons/fi';
import { useShare } from '@/hooks/useShare';
import { MessageBox } from '@/components/MessageBox';
import type { ShareResult } from '@/lib/share/flex-message-builder';
import './ShareButtons.css';

/** Props for ShareButtons component */
export interface ShareButtonsProps {
  /** Game result data for sharing */
  result: ShareResult;
  /** Base URL for the application (endpoint URL for OGP) */
  baseUrl: string;
  /** LIFF ID for permalink generation */
  liffId: string | undefined;
  /** R2 public domain URL for OGP image (optional for backward compatibility) */
  ogImageUrl?: string;
}

/**
 * ShareButtons Component
 * Displays share buttons for LINE and Web Share API
 *
 * - LINE button: Always visible (LINE green #06C755)
 * - Web Share button: Hidden when Web Share API is unavailable
 * - Both buttons disabled during share operation
 */
export function ShareButtons({
  result,
  baseUrl,
  liffId,
  ogImageUrl,
}: ShareButtonsProps): React.ReactElement {
  const {
    isSharing,
    canShareLine,
    canShareWeb,
    shareToLine,
    shareToWeb,
    messageQueue,
  } = useShare({ baseUrl, liffId, ogImageUrl });

  // Track if component has mounted to avoid hydration mismatch
  // Web Share API availability differs between server (false) and client (true)
  // This is a legitimate pattern - the effect synchronizes React state with
  // the external "mounted" status which only exists on the client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync with client-only mounted state
    setIsMounted(true);
  }, []);

  const handleLineShare = () => {
    if (!isSharing) {
      shareToLine(result);
    }
  };

  const handleWebShare = () => {
    if (!isSharing) {
      shareToWeb(result);
    }
  };

  return (
    <>
      {/* Toast notification for share results */}
      <MessageBox
        message={messageQueue.currentMessage}
        testId="share-message-box"
      />

      <div className="share-buttons">
        {/* LINE Share Button */}
        <button
          type="button"
          className="share-button share-button-line"
          onClick={handleLineShare}
          disabled={isSharing || !canShareLine}
          data-testid="share-line-button"
          aria-label="LINEでシェア"
          style={{ backgroundColor: '#06C755' }}
        >
          <SiLine className="share-button-icon" aria-hidden="true" />
          <span className="share-button-text">LINE</span>
        </button>

        {/* Web Share Button - Hidden when not available, only shown after mount to avoid hydration mismatch */}
        {isMounted && canShareWeb && (
          <button
            type="button"
            className="share-button share-button-web"
            onClick={handleWebShare}
            disabled={isSharing}
            data-testid="share-web-button"
            aria-label="その他でシェア"
          >
            <FiShare2 className="share-button-icon" aria-hidden="true" />
            <span className="share-button-text">シェア</span>
          </button>
        )}
      </div>
    </>
  );
}
