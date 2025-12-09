/**
 * Share Buttons Component
 * Renders LINE and Web Share buttons for game result sharing
 */

'use client';

import React from 'react';
import { useShare } from '@/hooks/useShare';
import type { ShareResult } from '@/lib/share/flex-message-builder';
import './ShareButtons.css';

/** Props for ShareButtons component */
export interface ShareButtonsProps {
  /** Game result data for sharing */
  result: ShareResult;
  /** Base URL for the application */
  baseUrl: string;
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
}: ShareButtonsProps): React.ReactElement {
  const { isSharing, canShareLine, canShareWeb, shareToLine, shareToWeb } =
    useShare(baseUrl);

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
        <span className="share-button-icon">LINE</span>
        <span className="share-button-text">LINEでシェア</span>
      </button>

      {/* Web Share Button - Hidden when not available */}
      {canShareWeb && (
        <button
          type="button"
          className="share-button share-button-web"
          onClick={handleWebShare}
          disabled={isSharing}
          data-testid="share-web-button"
          aria-label="その他でシェア"
        >
          <span className="share-button-text">その他でシェア</span>
        </button>
      )}
    </div>
  );
}
