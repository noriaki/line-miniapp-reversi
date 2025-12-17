/**
 * Move history encoder/decoder for game result sharing
 * Implements Base64URL direct encoding for URL-safe transmission
 * Each position (0-63) maps directly to a Base64URL character
 */

import type { Board, Position, Player } from '@/lib/game/types';
import {
  createInitialBoard,
  applyMove,
  calculateValidMoves,
  countStones as countStonesFromBoard,
} from '@/lib/game';

/** Base64URL character set (maps index 0-63 to URL-safe characters) */
const BASE64URL_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Decode result type */
export type DecodeResult<T> =
  | { success: true; value: T }
  | {
      success: false;
      error: 'invalid_length' | 'invalid_characters' | 'invalid_position';
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
 * Convert Position to Base64URL character
 * Position(row, col) -> index (row * 8 + col, 0-63) -> Base64URL char
 *
 * @example
 * positionToChar({ row: 0, col: 0 }) // "A" (index 0)
 * positionToChar({ row: 3, col: 3 }) // "b" (index 27)
 * positionToChar({ row: 4, col: 5 }) // "l" (index 37)
 * positionToChar({ row: 7, col: 7 }) // "_" (index 63)
 */
export function positionToChar(position: Position): string {
  const index = position.row * 8 + position.col;
  return BASE64URL_CHARS[index];
}

/**
 * Convert Base64URL character to Position
 *
 * @example
 * charToPosition("A") // { success: true, value: { row: 0, col: 0 } }
 * charToPosition("b") // { success: true, value: { row: 3, col: 3 } }
 */
export function charToPosition(char: string): DecodeResult<Position> {
  // Validate length (must be exactly 1 character)
  if (char.length !== 1) {
    return { success: false, error: 'invalid_length' };
  }

  // Find index in Base64URL character set
  const index = BASE64URL_CHARS.indexOf(char);
  if (index === -1) {
    return { success: false, error: 'invalid_characters' };
  }

  // Convert index to row and col
  const row = Math.floor(index / 8);
  const col = index % 8;

  return { success: true, value: { row, col } };
}

/**
 * Encode moves array to Base64URL direct string
 * Each position is converted to a single character (1 move = 1 char)
 * Empty array returns empty string
 *
 * @param moves - Array of Position objects
 * @returns Concatenated Base64URL characters (URL-safe, max 60 chars for 60 moves)
 */
export function encodeMoves(moves: readonly Position[]): string {
  if (moves.length === 0) {
    return '';
  }

  // Convert each position to a Base64URL character and join
  return moves.map(positionToChar).join('');
}

/**
 * Decode Base64URL string to moves array
 * Each character is converted back to a position
 * Empty string returns empty array
 *
 * @param encoded - Base64URL encoded string (1 char per move)
 * @returns DecodeResult with Position array or error
 */
export function decodeMoves(encoded: string): DecodeResult<Position[]> {
  if (encoded === '') {
    return { success: true, value: [] };
  }

  const positions: Position[] = [];

  // Parse each character
  for (const char of encoded) {
    const result = charToPosition(char);

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
