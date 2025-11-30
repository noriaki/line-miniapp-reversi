/**
 * ShareButtons Component
 *
 * Renders LINE share and Web Share buttons for game result sharing.
 * Uses inline styles to ensure consistent rendering and testing.
 *
 * Requirements: 1.1, 1.3, 1.4, 1.5, 3.4
 */

import React from 'react';

export interface ShareButtonsProps {
  /** Share image ready state */
  readonly isShareReady: boolean;
  /** LINE share button click handler */
  readonly onLineShare: () => void;
  /** Web Share button click handler */
  readonly onWebShare: () => void;
  /** Web Share API availability */
  readonly canWebShare: boolean;
  /** Share operation in progress */
  readonly isSharing: boolean;
}

/**
 * LINE brand color
 */
const LINE_GREEN = '#06C755';

/**
 * Disabled button color
 */
const DISABLED_COLOR = '#cccccc';

/**
 * Base button styles for share buttons
 */
const baseButtonStyle: React.CSSProperties = {
  minHeight: '44px',
  padding: '12px 16px',
  fontSize: '0.875rem',
  fontWeight: 700,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  WebkitTapHighlightColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  flex: 1,
};

/**
 * LINE button specific styles
 */
const lineButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: LINE_GREEN,
  color: 'white',
  boxShadow: '0 2px 8px rgba(6, 199, 85, 0.3)',
};

/**
 * Web Share button specific styles
 */
const webShareButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#6b7280',
  color: 'white',
  boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
};

/**
 * Disabled button styles
 */
const disabledButtonStyle: React.CSSProperties = {
  backgroundColor: DISABLED_COLOR,
  color: '#666666',
  cursor: 'not-allowed',
  opacity: 0.6,
  boxShadow: 'none',
};

/**
 * Container styles
 */
const containerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  width: '100%',
};

/**
 * ShareButtons Component
 *
 * Displays share buttons for LINE and Web Share API.
 * - LINE button uses LINE brand color (#06C755)
 * - Web Share button only shown when API is available
 * - Both buttons disabled when share is not ready or in progress
 */
export function ShareButtons({
  isShareReady,
  onLineShare,
  onWebShare,
  canWebShare,
  isSharing,
}: ShareButtonsProps): React.JSX.Element {
  const isDisabled = !isShareReady || isSharing;

  const getButtonStyle = (
    baseStyle: React.CSSProperties
  ): React.CSSProperties => {
    if (isDisabled) {
      return {
        ...baseStyle,
        ...disabledButtonStyle,
      };
    }
    return baseStyle;
  };

  return (
    <div data-testid="share-buttons" style={containerStyle}>
      {/* LINE Share Button */}
      <button
        type="button"
        onClick={onLineShare}
        disabled={isDisabled}
        aria-busy={isSharing}
        aria-label="LINEでシェア"
        style={getButtonStyle(lineButtonStyle)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.64 1.52 4.99 3.89 6.54-.16.6-.57 2.14-.66 2.47-.11.42.15.41.32.3.13-.08 2.16-1.43 3.05-2.01.45.06.92.1 1.4.1 5.52 0 10-3.82 10-8.5S17.52 2 12 2z" />
        </svg>
        LINEでシェア
      </button>

      {/* Web Share Button - only shown when API is available */}
      {canWebShare && (
        <button
          type="button"
          onClick={onWebShare}
          disabled={isDisabled}
          aria-busy={isSharing}
          aria-label="その他でシェア"
          style={getButtonStyle(webShareButtonStyle)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
          </svg>
          その他でシェア
        </button>
      )}
    </div>
  );
}

export default ShareButtons;
