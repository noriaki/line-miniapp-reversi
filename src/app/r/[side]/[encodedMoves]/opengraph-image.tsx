/**
 * OG Image Generator
 * Generates Open Graph images for game result sharing
 * Uses Next.js ImageResponse for server-side image generation
 */

import React from 'react';
import { ImageResponse } from 'next/og';
import {
  decodeMoves,
  replayMoves,
  determineWinner,
} from '@/lib/share/move-encoder';
import { createInitialBoard } from '@/lib/game';
import type { Board, Cell } from '@/lib/game/types';

// Image dimensions (OGP standard)
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Page params type
type PageParams = {
  side: string;
  encodedMoves: string;
};

// Colors
const COLORS = {
  boardBackground: '#1e3a0f',
  cellBackground: '#4a9932',
  black: '#1a1a1a',
  white: '#ffffff',
  text: '#1a1a1a',
  subtext: '#666666',
  brand: '#06c755',
  resultWin: '#059142',
  resultLose: '#dc2626',
  resultDraw: '#6b7280',
};

// Static alt text for the OG image
export const alt = 'リバーシ対局結果';

/**
 * Render a single cell for the board
 */
function renderCell(cell: Cell, row: number, col: number, cellSize: number) {
  const stoneSize = cellSize * 0.8;
  const stoneOffset = (cellSize - stoneSize) / 2;

  return (
    <div
      key={`${row}-${col}`}
      style={{
        width: cellSize,
        height: cellSize,
        backgroundColor: COLORS.cellBackground,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {cell && (
        <div
          style={{
            width: stoneSize,
            height: stoneSize,
            borderRadius: '50%',
            backgroundColor: cell === 'black' ? COLORS.black : COLORS.white,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            position: 'absolute',
            top: stoneOffset,
            left: stoneOffset,
          }}
        />
      )}
    </div>
  );
}

/**
 * Render the game board
 */
function renderBoard(board: Board, boardSize: number) {
  const gap = 3;
  const padding = 8;
  const innerSize = boardSize - padding * 2;
  const cellSize = (innerSize - gap * 7) / 8;

  const cells: React.ReactNode[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      cells.push(renderCell(board[row][col], row, col, cellSize));
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: boardSize,
        height: boardSize,
        backgroundColor: COLORS.boardBackground,
        borderRadius: 12,
        padding: padding,
        gap: gap,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {cells}
    </div>
  );
}

/**
 * Render score display
 */
function renderScore(
  blackCount: number,
  whiteCount: number,
  winner: 'black' | 'white' | 'draw'
) {
  const winnerText =
    winner === 'draw'
      ? '引き分け'
      : winner === 'black'
        ? '黒の勝ち'
        : '白の勝ち';

  const resultColor =
    winner === 'draw'
      ? COLORS.resultDraw
      : winner === 'black'
        ? COLORS.resultWin
        : COLORS.resultLose;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}
    >
      {/* Winner text */}
      <div
        style={{
          display: 'flex',
          fontSize: 72,
          fontWeight: 700,
          color: resultColor,
        }}
      >
        {winnerText}
      </div>

      {/* Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 48,
        }}
      >
        {/* Black score */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: COLORS.black,
              boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: 84,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {blackCount}
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            display: 'flex',
            fontSize: 54,
            fontWeight: 700,
            color: COLORS.subtext,
          }}
        >
          -
        </div>

        {/* White score */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: COLORS.white,
              border: '3px solid #ddd',
              boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
            }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: 84,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {whiteCount}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Render brand logo/text
 */
function renderBrand() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 36,
          fontWeight: 700,
          color: COLORS.brand,
        }}
      >
        かんたんリバーシ
      </div>
    </div>
  );
}

/**
 * Generate fallback image for error cases
 */
function generateFallbackImage() {
  const board = createInitialBoard();
  return generateImageWithBoard(board, 2, 2, 'draw');
}

/**
 * Generate image with specific board state
 */
function generateImageWithBoard(
  board: Board,
  blackCount: number,
  whiteCount: number,
  winner: 'black' | 'white' | 'draw'
) {
  const boardSize = 480;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#f5f5f5',
          padding: 40,
        }}
      >
        {/* Left side: Board */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          {renderBoard(board, boardSize)}
        </div>

        {/* Right side: Score and Brand */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          {renderScore(blackCount, whiteCount, winner)}
          {renderBrand()}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

/**
 * Default export: Generate the OG image
 */
export default async function Image({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { encodedMoves } = await params;

  // Decode moves
  const decodeResult = decodeMoves(encodedMoves);
  if (!decodeResult.success) {
    return generateFallbackImage();
  }

  // Replay moves to get final board state
  const replayResult = replayMoves(decodeResult.value);
  if (!replayResult.success) {
    return generateFallbackImage();
  }

  const { board, blackCount, whiteCount } = replayResult;
  const winner = determineWinner(blackCount, whiteCount);

  return generateImageWithBoard(board, blackCount, whiteCount, winner);
}
