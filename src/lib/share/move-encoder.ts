/**
 * Move history encoder/decoder for game result sharing
 * Implements WTHOR format encoding with Base64URL for URL-safe transmission
 */

import type { Board, Position, Player } from '@/lib/game/types';
import {
  createInitialBoard,
  applyMove,
  calculateValidMoves,
  countStones as countStonesFromBoard,
} from '@/lib/game';

/** Decode result type */
export type DecodeResult<T> =
  | { success: true; value: T }
  | {
      success: false;
      error:
        | 'invalid_length'
        | 'invalid_characters'
        | 'invalid_base64'
        | 'invalid_position';
    };

/** Board replay result type */
export type ReplayResult =
  | { success: true; board: Board; blackCount: number; whiteCount: number }
  | {
      success: false;
      error: 'invalid_move' | 'decode_error';
      moveIndex?: number;
    };

/**
 * Convert Position to WTHOR format 2-digit string
 * WTHOR format: tens digit = row + 1, ones digit = col + 1
 *
 * @example
 * positionToWthor({ row: 0, col: 0 }) // "11"
 * positionToWthor({ row: 3, col: 3 }) // "44"
 * positionToWthor({ row: 7, col: 7 }) // "88"
 */
export function positionToWthor(position: Position): string {
  const row = position.row + 1;
  const col = position.col + 1;
  return `${row}${col}`;
}

/**
 * Convert WTHOR format 2-digit string to Position
 *
 * @example
 * wthorToPosition("11") // { success: true, value: { row: 0, col: 0 } }
 * wthorToPosition("44") // { success: true, value: { row: 3, col: 3 } }
 */
export function wthorToPosition(wthor: string): DecodeResult<Position> {
  // Validate length
  if (wthor.length !== 2) {
    return { success: false, error: 'invalid_length' };
  }

  // Validate characters (must be digits)
  if (!/^\d{2}$/.test(wthor)) {
    return { success: false, error: 'invalid_characters' };
  }

  const row = parseInt(wthor[0], 10) - 1;
  const col = parseInt(wthor[1], 10) - 1;

  // Validate range (0-7)
  if (row < 0 || row > 7 || col < 0 || col > 7) {
    return { success: false, error: 'invalid_position' };
  }

  return { success: true, value: { row, col } };
}

/**
 * Encode moves array to WTHOR format + Base64URL string
 * Empty array returns empty string
 *
 * @param moves - Array of Position objects
 * @returns Base64URL encoded string (URL-safe, no padding)
 */
export function encodeMoves(moves: readonly Position[]): string {
  if (moves.length === 0) {
    return '';
  }

  // Convert positions to WTHOR format string
  const wthorString = moves.map(positionToWthor).join('');

  // Encode to Base64URL (URL-safe variant)
  const base64 = btoa(wthorString);

  // Convert to Base64URL (replace +/= with -_)
  const base64url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return base64url;
}

/**
 * Decode Base64URL string to moves array
 * Empty string returns empty array
 *
 * @param encoded - Base64URL encoded string
 * @returns DecodeResult with Position array or error
 */
export function decodeMoves(encoded: string): DecodeResult<Position[]> {
  if (encoded === '') {
    return { success: true, value: [] };
  }

  // Convert Base64URL back to standard Base64
  let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  const paddingNeeded = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(paddingNeeded);

  // Decode Base64
  let wthorString: string;
  try {
    wthorString = atob(base64);
  } catch {
    return { success: false, error: 'invalid_base64' };
  }

  // Validate WTHOR string length (must be even)
  if (wthorString.length % 2 !== 0) {
    return { success: false, error: 'invalid_length' };
  }

  // Parse WTHOR string to positions
  const positions: Position[] = [];
  for (let i = 0; i < wthorString.length; i += 2) {
    const wthor = wthorString.slice(i, i + 2);
    const result = wthorToPosition(wthor);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    positions.push(result.value);
  }

  return { success: true, value: positions };
}

/**
 * Replay moves from initial board state
 * Uses existing game logic (applyMove) to validate and apply each move
 * Handles pass situations automatically when a player has no valid moves
 *
 * @param moves - Array of Position objects representing the game history
 * @returns ReplayResult with final board state or error
 */
export function replayMoves(moves: readonly Position[]): ReplayResult {
  let board = createInitialBoard();
  let currentPlayer: Player = 'black';

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    // Check if current player has valid moves
    const validMoves = calculateValidMoves(board, currentPlayer);

    if (validMoves.length === 0) {
      // Current player must pass, switch to opponent
      currentPlayer = currentPlayer === 'black' ? 'white' : 'black';

      // Check if opponent also has no moves (game should be over)
      const opponentMoves = calculateValidMoves(board, currentPlayer);
      if (opponentMoves.length === 0) {
        // Neither player can move - this shouldn't happen in valid game history
        return { success: false, error: 'invalid_move', moveIndex: i };
      }
    }

    // Apply the move
    const result = applyMove(board, move, currentPlayer);

    if (!result.success) {
      return { success: false, error: 'invalid_move', moveIndex: i };
    }

    board = result.value;
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
  }

  const stones = countStonesFromBoard(board);
  return {
    success: true,
    board,
    blackCount: stones.black,
    whiteCount: stones.white,
  };
}

/**
 * Count stones on a board
 * Re-export from game module for convenience
 */
export function countStones(board: Board): { black: number; white: number } {
  return countStonesFromBoard(board);
}

/**
 * Determine winner based on stone counts
 *
 * @param black - Number of black stones
 * @param white - Number of white stones
 * @returns 'black' | 'white' | 'draw'
 */
export function determineWinner(
  black: number,
  white: number
): 'black' | 'white' | 'draw' {
  if (black > white) {
    return 'black';
  } else if (white > black) {
    return 'white';
  } else {
    return 'draw';
  }
}
