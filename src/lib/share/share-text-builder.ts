/**
 * Share text builder for game results
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import type { GameResult } from './types';

/**
 * Result text based on winner
 */
function getResultText(winner: GameResult['winner']): string {
  switch (winner) {
    case 'black':
      return 'AIに勝ちました!';
    case 'white':
      return 'AIに負けました...';
    case 'draw':
      return '引き分けでした';
  }
}

/**
 * Build share text containing game result, score, invitation, and app URL
 *
 * @param result - Game result with winner and scores
 * @param appUrl - LIFF endpoint URL
 * @returns Formatted share text string
 */
export function buildShareText(result: GameResult, appUrl: string): string {
  const resultText = getResultText(result.winner);
  const scoreText = `黒 ${result.blackCount} vs 白 ${result.whiteCount}`;
  const invitationText = 'あなたもAIに勝てるかな?';

  return `${resultText}\n${scoreText}\n\n${invitationText}\n${appUrl}`;
}
