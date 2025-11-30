/**
 * GameResultPanel Component
 *
 * Renders game result display with winner, scores, reset button, and share functionality.
 * Integrates ShareButtons and ShareImagePreview components.
 *
 * Requirements: 1.1, 1.2, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 8.1
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useShare } from '@/hooks/useShare';
import { ShareButtons } from './ShareButtons';
import ShareImagePreview from './ShareImagePreview';
import type { Board, Player } from '@/lib/game/types';
import './GameBoard.css';

export interface GameResultPanelProps {
  /** Board state */
  readonly board: Board;
  /** Black stone count */
  readonly blackCount: number;
  /** White stone count */
  readonly whiteCount: number;
  /** Winner ('black' | 'white' | 'draw') */
  readonly winner: Player | 'draw';
  /** Game reset handler */
  readonly onReset: () => void;
}

/**
 * Get winner text from user perspective (for app display)
 */
function getWinnerText(winner: Player | 'draw'): string {
  switch (winner) {
    case 'black':
      return 'あなたの勝ち!';
    case 'white':
      return 'AIの勝ち!';
    case 'draw':
      return '引き分け';
  }
}

/**
 * Container styles
 */
const containerStyle: React.CSSProperties = {
  textAlign: 'center',
  width: '100%',
  padding: '1.5rem',
  marginTop: '1rem',
  animation: 'fadeIn 0.5s ease-in-out',
};

/**
 * Result text styles
 */
const resultTextStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
  color: '#059142',
};

/**
 * Score container styles
 */
const scoreContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '1.5rem',
  marginBottom: '1.5rem',
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

/**
 * Score item styles
 */
const scoreItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

/**
 * Stone indicator styles
 */
const stoneBaseStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
};

const blackStoneStyle: React.CSSProperties = {
  ...stoneBaseStyle,
  background: 'radial-gradient(circle at 30% 30%, #4a4a4a, #000000)',
};

const whiteStoneStyle: React.CSSProperties = {
  ...stoneBaseStyle,
  background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)',
  border: '1px solid #ccc',
};

/**
 * Score text styles
 */
const scoreTextStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
};

/**
 * Score divider styles
 */
const dividerStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#999',
  padding: '0 0.5rem',
};

/**
 * Buttons container styles
 */
const buttonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  alignItems: 'center',
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
};

/**
 * GameResultPanel Component
 *
 * Displays game result with:
 * - Winner text from user perspective
 * - Score display with stone indicators
 * - Reset button to start new game
 * - Share buttons for LINE and Web Share
 * - Hidden ShareImagePreview for image generation
 */
export default function GameResultPanel({
  board,
  blackCount,
  whiteCount,
  winner,
  onReset,
}: GameResultPanelProps): React.JSX.Element {
  // Create ref for ShareImagePreview
  const shareImageRef = useRef<HTMLDivElement>(null);

  // Get share functionality from hook
  const {
    isShareReady,
    isSharing,
    canWebShare,
    handleLineShare,
    handleWebShare,
    prepareShareImage,
  } = useShare();

  // Prepare share image on mount
  useEffect(() => {
    prepareShareImage(shareImageRef, board, blackCount, whiteCount, winner);
  }, [prepareShareImage, board, blackCount, whiteCount, winner]);

  return (
    <div data-testid="game-result-panel" style={containerStyle}>
      {/* Winner Text */}
      <p style={resultTextStyle}>{getWinnerText(winner)}</p>

      {/* Score Display */}
      <div style={scoreContainerStyle}>
        <div style={scoreItemStyle}>
          <div style={blackStoneStyle} />
          <span data-testid="black-score" style={scoreTextStyle}>
            {blackCount}
          </span>
        </div>
        <div style={dividerStyle}>vs</div>
        <div style={{ ...scoreItemStyle, flexDirection: 'row-reverse' }}>
          <div style={whiteStoneStyle} />
          <span data-testid="white-score" style={scoreTextStyle}>
            {whiteCount}
          </span>
        </div>
      </div>

      {/* Buttons Container */}
      <div data-testid="result-buttons" style={buttonsContainerStyle}>
        {/* Reset Button */}
        <button onClick={onReset} className="reset-button">
          新しいゲームを開始
        </button>

        {/* Share Buttons */}
        <ShareButtons
          isShareReady={isShareReady}
          onLineShare={handleLineShare}
          onWebShare={handleWebShare}
          canWebShare={canWebShare}
          isSharing={isSharing}
        />
      </div>

      {/* Hidden Share Image Preview for html2canvas capture */}
      <ShareImagePreview
        board={board}
        blackCount={blackCount}
        whiteCount={whiteCount}
        winner={winner}
        containerRef={shareImageRef}
      />
    </div>
  );
}
