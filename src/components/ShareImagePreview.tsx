/**
 * ShareImagePreview Component
 *
 * Renders a hidden DOM structure for html2canvas to capture as a share image.
 * Uses inline styles for html2canvas compatibility.
 */

import React from 'react';
import type { Board, Player } from '@/lib/game/types';

export interface ShareImagePreviewProps {
  /** Board state */
  readonly board: Board;
  /** Black stone count */
  readonly blackCount: number;
  /** White stone count */
  readonly whiteCount: number;
  /** Winner ('black' | 'white' | 'draw') */
  readonly winner: Player | 'draw';
  /** Ref for html2canvas capture target */
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Get winner text from third-person perspective (for share image)
 */
function getWinnerText(winner: Player | 'draw'): string {
  switch (winner) {
    case 'black':
      return 'プレーヤーの勝ち!';
    case 'white':
      return 'プレーヤーの負け...';
    case 'draw':
      return '引き分け';
  }
}

/**
 * ShareImagePreview Component
 *
 * Renders a fixed-size (1200x630px OGP ratio) layout with:
 * - Left: 560x560px game board with 8x8 grid
 * - Right: Winner text, scores, and brand name
 *
 * Hidden with visibility: hidden but rendered in DOM for html2canvas capture.
 */
export default function ShareImagePreview({
  board,
  blackCount,
  whiteCount,
  winner,
  containerRef,
}: ShareImagePreviewProps): React.JSX.Element {
  // Container styles - OGP ratio 1200x630px
  // Note: Using off-screen positioning instead of visibility:hidden
  // because html2canvas doesn't render hidden elements
  const containerStyle: React.CSSProperties = {
    width: '1200px',
    height: '630px',
    backgroundColor: '#1a2f14',
    display: 'flex',
    flexDirection: 'row',
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  // Board section styles - left side
  const boardSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '35px',
    flexShrink: 0,
  };

  // Board container styles - 560x560px
  const boardStyle: React.CSSProperties = {
    width: '560px',
    height: '560px',
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gridTemplateRows: 'repeat(8, 1fr)',
    gap: '2px',
    backgroundColor: '#0d1a0a',
    padding: '4px',
    borderRadius: '8px',
  };

  // Cell styles
  const cellStyle: React.CSSProperties = {
    backgroundColor: '#2d5a1e',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Stone styles
  const stoneBaseStyle: React.CSSProperties = {
    width: '80%',
    height: '80%',
    borderRadius: '50%',
  };

  const blackStoneStyle: React.CSSProperties = {
    ...stoneBaseStyle,
    background: 'radial-gradient(circle at 30% 30%, #4a4a4a, #000000)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  };

  const whiteStoneStyle: React.CSSProperties = {
    ...stoneBaseStyle,
    background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  // Info section styles - right side
  const infoSectionStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#ffffff',
  };

  // Winner text styles
  const winnerTextStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '40px',
    textAlign: 'center',
    color: winner === 'white' ? '#cccccc' : '#ffffff',
  };

  // Scores container styles
  const scoresContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '40px',
  };

  // Score row styles
  const scoreRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '36px',
    fontWeight: 'bold',
  };

  // Score indicator styles
  const scoreIndicatorBaseStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'inline-block',
  };

  const blackIndicatorStyle: React.CSSProperties = {
    ...scoreIndicatorBaseStyle,
    background: 'radial-gradient(circle at 30% 30%, #4a4a4a, #000000)',
  };

  const whiteIndicatorStyle: React.CSSProperties = {
    ...scoreIndicatorBaseStyle,
    background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)',
    border: '1px solid #ccc',
  };

  // Brand name styles
  const brandNameStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'normal',
    color: '#88aa88',
    marginTop: '20px',
  };

  return (
    <div
      ref={containerRef}
      data-testid="share-image-preview"
      style={containerStyle}
    >
      {/* Board Section - Left */}
      <div data-testid="share-image-board-section" style={boardSectionStyle}>
        <div data-testid="share-image-board" style={boardStyle}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-testid={`share-image-cell-${rowIndex}-${colIndex}`}
                style={cellStyle}
              >
                {cell === 'black' && (
                  <div
                    data-testid={`share-image-stone-black-${rowIndex}-${colIndex}`}
                    style={blackStoneStyle}
                  />
                )}
                {cell === 'white' && (
                  <div
                    data-testid={`share-image-stone-white-${rowIndex}-${colIndex}`}
                    style={whiteStoneStyle}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Section - Right */}
      <div data-testid="share-image-info-section" style={infoSectionStyle}>
        {/* Winner Text */}
        <div style={winnerTextStyle}>{getWinnerText(winner)}</div>

        {/* Scores */}
        <div data-testid="share-image-scores" style={scoresContainerStyle}>
          <div data-testid="share-image-black-score" style={scoreRowStyle}>
            <span style={blackIndicatorStyle} />
            <span>{blackCount}</span>
          </div>
          <div data-testid="share-image-white-score" style={scoreRowStyle}>
            <span style={whiteIndicatorStyle} />
            <span>{whiteCount}</span>
          </div>
        </div>

        {/* Brand Name */}
        <div style={brandNameStyle}>かんたんリバーシ</div>
      </div>
    </div>
  );
}
