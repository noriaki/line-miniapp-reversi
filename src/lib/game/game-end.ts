/**
 * Game end detection and winner determination for Reversi
 */

import { Board, Player, Position } from './types';
import { countStones } from './board';

export type GameEndResult =
  | { ended: false }
  | { ended: true; winner: Player | 'draw' };

/**
 * Checks if the game has ended and determines the winner
 *
 * Game ends when:
 * 1. Board is completely full (all 64 cells occupied)
 * 2. Both players have no valid moves
 *
 * Winner is determined by counting stones:
 * - Player with more stones wins
 * - Equal stones results in a draw
 */
export function checkGameEnd(
  board: Board,
  blackValidMoves: Position[],
  whiteValidMoves: Position[]
): GameEndResult {
  const bothPlayersStuck =
    blackValidMoves.length === 0 && whiteValidMoves.length === 0;

  const stones = countStones(board);
  const totalStones = stones.black + stones.white;
  const boardFull = totalStones === 64;

  if (!bothPlayersStuck && !boardFull) {
    return { ended: false };
  }

  if (stones.black > stones.white) {
    return { ended: true, winner: 'black' };
  } else if (stones.white > stones.black) {
    return { ended: true, winner: 'white' };
  } else {
    return { ended: true, winner: 'draw' };
  }
}
