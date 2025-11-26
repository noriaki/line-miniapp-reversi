/**
 * MessageBox Component
 * Unified message box for displaying game notifications and warnings
 * Features: Fixed height layout, opacity transitions, message type-based styling, Japanese text support
 */

'use client';

import React from 'react';
import type { MessageBoxProps } from '@/types';

/**
 * Fixed height for message box container (prevents CLS)
 */
const MESSAGE_BOX_HEIGHT = '64px';

/**
 * Transition duration for fade animations (in seconds)
 */
const FADE_DURATION = '0.3s';

/**
 * Font stack optimized for Japanese text rendering
 */
const JAPANESE_FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif';

/**
 * Info icon component (circle with 'i')
 */
function InfoIcon(): React.ReactElement<any> {
  return (
    <svg
      className="w-5 h-5 text-blue-600"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/**
 * Warning icon component (triangle with exclamation mark)
 */
function WarningIcon(): React.ReactElement<any> {
  return (
    <svg
      className="w-5 h-5 text-amber-600"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

/**
 * MessageBox presentational component
 * Displays messages with fixed height layout to prevent CLS
 *
 * @param props - MessageBoxProps containing message and optional testId
 * @returns Fixed height message box with opacity-based visibility control
 *
 * @example
 * ```tsx
 * <MessageBox
 *   message={{ type: 'info', text: 'パスしました', timeout: 3000 }}
 * />
 * ```
 */
export function MessageBox({
  message,
  testId = 'message-box',
}: MessageBoxProps): React.ReactElement<any> {
  // Determine styling based on message type
  const isWarning = message?.type === 'warning';
  const bgColor = isWarning ? 'bg-amber-50' : 'bg-blue-50';
  const iconLabel = isWarning ? 'warning' : 'info';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-center px-4"
      lang="ja"
      data-testid={testId}
      style={{ height: MESSAGE_BOX_HEIGHT }}
    >
      <div
        className={`
          ${bgColor}
          transition-opacity
          duration-300
          rounded-lg
          px-4
          py-2
          flex
          items-center
          gap-3
          max-w-2xl
          w-full
        `}
        role="status"
        aria-live="polite"
        style={{
          opacity: message ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: FADE_DURATION,
        }}
      >
        {/* Icon */}
        <div className="flex-shrink-0" aria-label={iconLabel}>
          {isWarning ? <WarningIcon /> : <InfoIcon />}
        </div>

        {/* Message Text */}
        <p
          className="text-sm text-gray-800 leading-relaxed line-clamp-2 break-all flex-1"
          style={{
            fontFamily: JAPANESE_FONT_FAMILY,
            lineHeight: '1.5',
          }}
        >
          {message?.text || ''}
        </p>
      </div>
    </div>
  );
}
