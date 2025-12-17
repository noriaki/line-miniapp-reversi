/**
 * Result Page
 * Displays game result with board state, score, and share buttons
 * ISR: Generated on-demand and cached indefinitely
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BoardDisplay } from '@/components/BoardDisplay';
import {
  decodeMoves,
  replayMoves,
  determineWinner,
} from '@/lib/share/move-encoder';
import type { ShareResult } from '@/lib/share/flex-message-builder';
import { ShareButtonsWrapper } from './ShareButtonsWrapper';
import './result-page.css';

// ISR configuration: No pre-generated pages, generate on-demand
export async function generateStaticParams() {
  return [];
}

// Page params type
type PageParams = {
  side: string;
  encodedMoves: string;
};

/**
 * Get base URL for share functionality
 * Priority: BASE_URL > VERCEL_PROJECT_PRODUCTION_URL > localhost
 */
function getBaseUrl(): string {
  // Explicit base URL (highest priority, server-side only)
  if (process.env.BASE_URL) {
    return `https://${process.env.BASE_URL}`;
  }
  // Vercel deployments (always production URL, even from preview)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Validate side parameter
 */
function isValidSide(side: string): side is 'b' | 'w' {
  return side === 'b' || side === 'w';
}

/**
 * Get winner display text based on player side and game result
 */
function getWinnerText(
  winner: 'black' | 'white' | 'draw',
  playerSide: 'b' | 'w'
): string {
  if (winner === 'draw') {
    return '引き分け';
  }

  const playerColor = playerSide === 'b' ? 'black' : 'white';
  if (winner === playerColor) {
    return 'プレーヤーの勝ち!';
  } else {
    return 'AIの勝ち!';
  }
}

/**
 * Get result color class based on outcome
 */
function getResultColorClass(
  winner: 'black' | 'white' | 'draw',
  playerSide: 'b' | 'w'
): string {
  if (winner === 'draw') {
    return 'result-draw';
  }

  const playerColor = playerSide === 'b' ? 'black' : 'white';
  if (winner === playerColor) {
    return 'result-win';
  } else {
    return 'result-lose';
  }
}

/**
 * Generate metadata for OGP
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { side, encodedMoves } = await params;

  // Default metadata for error cases
  const defaultMetadata: Metadata = {
    title: 'Easy Reversi - 対局結果',
    description: 'リバーシ対局結果を確認しよう!',
  };

  // Validate side
  if (!isValidSide(side)) {
    return defaultMetadata;
  }

  // Decode moves
  const decodeResult = decodeMoves(encodedMoves);
  if (!decodeResult.success) {
    return defaultMetadata;
  }

  // Replay moves to get final state
  const replayResult = replayMoves(decodeResult.value);
  if (!replayResult.success) {
    return defaultMetadata;
  }

  const { blackCount, whiteCount } = replayResult;
  const winner = determineWinner(blackCount, whiteCount);

  const winnerText =
    winner === 'draw'
      ? '引き分け'
      : winner === 'black'
        ? '黒の勝ち'
        : '白の勝ち';

  // Build absolute OGP image URL
  const baseUrl = getBaseUrl();
  const ogImageUrl = `${baseUrl}/r/${side}/${encodedMoves}/opengraph-image`;

  return {
    title: `Easy Reversi - ${winnerText} (黒${blackCount} - 白${whiteCount})`,
    description: `リバーシ対局結果: ${winnerText}! 黒${blackCount} - 白${whiteCount}`,
    openGraph: {
      title: `リバーシ対局結果: ${winnerText}`,
      description: `黒${blackCount} - 白${whiteCount} で${winnerText}!`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'リバーシ対局結果',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `リバーシ対局結果: ${winnerText}`,
      description: `黒${blackCount} - 白${whiteCount} で${winnerText}!`,
      images: [ogImageUrl],
    },
  };
}

/**
 * Error display component
 */
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="result-page result-page-error">
      <div className="error-container" data-testid="error-message">
        <h1 className="error-title">エラー</h1>
        <p className="error-text">{message}</p>
        <Link href="/" className="play-again-button">
          ゲームを始める
        </Link>
      </div>
    </div>
  );
}

/**
 * Result Page Component
 */
export default async function ResultPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { side, encodedMoves } = await params;

  // Validate side parameter
  if (!isValidSide(side)) {
    return <ErrorDisplay message="無効なURLパラメータです。" />;
  }

  // Decode moves
  const decodeResult = decodeMoves(encodedMoves);
  if (!decodeResult.success) {
    return <ErrorDisplay message="対局データを読み込めませんでした。" />;
  }

  // Replay moves to get final board state
  const replayResult = replayMoves(decodeResult.value);
  if (!replayResult.success) {
    return <ErrorDisplay message="対局データが不正です。" />;
  }

  const { board, blackCount, whiteCount } = replayResult;
  const winner = determineWinner(blackCount, whiteCount);
  const playerSide = side as 'b' | 'w';
  const winnerText = getWinnerText(winner, playerSide);
  const resultColorClass = getResultColorClass(winner, playerSide);

  return (
    <div
      className="result-page"
      data-testid="result-container"
      data-player-side={playerSide === 'b' ? 'black' : 'white'}
    >
      {/* Game Result Header */}
      <div className="result-header">
        <h1 className="result-title">ゲーム終了!</h1>
        <p
          className={`result-winner ${resultColorClass}`}
          data-testid="game-result-text"
        >
          {winnerText}
        </p>
      </div>

      {/* Score Display */}
      <div className="score-display" data-testid="score-display">
        {playerSide === 'b' ? (
          // Player is black (top), AI is white (bottom)
          <>
            <div className="score-item">
              <div className="score-stone stone-black" />
              <span className="score-label">プレーヤー</span>
              <span className="score-value">{blackCount}</span>
            </div>
            <div className="score-divider">vs</div>
            <div className="score-item">
              <div className="score-stone stone-white" />
              <span className="score-label">AI</span>
              <span className="score-value">{whiteCount}</span>
            </div>
          </>
        ) : (
          // Player is white (bottom), AI is black (top)
          <>
            <div className="score-item">
              <div className="score-stone stone-black" />
              <span className="score-label">AI</span>
              <span className="score-value">{blackCount}</span>
            </div>
            <div className="score-divider">vs</div>
            <div className="score-item">
              <div className="score-stone stone-white" />
              <span className="score-label">プレーヤー</span>
              <span className="score-value">{whiteCount}</span>
            </div>
          </>
        )}
      </div>

      {/* Board Display */}
      <BoardDisplay board={board} />

      {/* Share Buttons */}
      <ShareButtonsWrapper
        result={
          {
            side: playerSide,
            winner,
            blackCount,
            whiteCount,
            encodedMoves,
          } satisfies ShareResult
        }
        serverBaseUrl={getBaseUrl()}
      />

      {/* Action Buttons */}
      <div className="result-actions">
        <Link href="/" className="play-again-button">
          もう一度遊ぶ
        </Link>
      </div>
    </div>
  );
}
