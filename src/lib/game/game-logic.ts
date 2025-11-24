/**
 * Core game logic for Reversi
 * Handles move application and valid move calculation
 */

import { Board, Player, Position } from './types';
import { getCellAt, setCellAt } from './board';
import { validateMove, findAllFlips } from './move-validator';

export { validateMove } from './move-validator';

export interface MoveApplicationError {
  readonly type: 'move_application_error';
  readonly reason: string;
}

export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Applies a move to the board by placing a stone and flipping opponent stones
 * Returns a new board (immutable operation)
 * Returns error if move is invalid
 */
export function applyMove(
  board: Board,
  position: Position,
  player: Player
): Result<Board, MoveApplicationError> {
  const validationResult = validateMove(board, position, player);

  if (!validationResult.success) {
    return {
      success: false,
      error: {
        type: 'move_application_error',
        reason: `Invalid move: ${validationResult.error.reason}`,
      },
    };
  }

  const flips = findAllFlips(board, position, player);
  let newBoard = setCellAt(board, position, player);

  for (const flip of flips) {
    newBoard = setCellAt(newBoard, flip, player);
  }

  return { success: true, value: newBoard };
}

/**
 * Calculates all valid moves for a player on the current board
 * Returns array of positions where the player can place a stone
 * Returns empty array if no valid moves exist
 */
export function calculateValidMoves(board: Board, player: Player): Position[] {
  const validMoves: Position[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const position: Position = { row, col };
      const cell = getCellAt(board, position);

      if (cell === null) {
        const validationResult = validateMove(board, position, player);
        if (validationResult.success) {
          validMoves.push(position);
        }
      }
    }
  }

  return validMoves;
}
