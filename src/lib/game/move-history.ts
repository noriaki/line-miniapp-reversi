/**
 * Move history utilities for Reversi game
 * Converts board positions to chess notation format ([a-h][1-8])
 */

import type { Position } from './types';

/**
 * Converts a board position to chess notation format
 * @param position - Board position with row and col (0-7)
 * @returns Chess notation string (e.g., "e4", "a1", "h8")
 *          Returns "??" for out-of-range positions
 *
 * @example
 * positionToNotation({ row: 0, col: 0 }) // returns "a1"
 * positionToNotation({ row: 7, col: 7 }) // returns "h8"
 * positionToNotation({ row: 2, col: 6 }) // returns "g3"
 */
export function positionToNotation(position: Position): string {
  const { row, col } = position;

  if (row < 0 || row > 7 || col < 0 || col > 7) {
    console.error(`Invalid position: row=${row}, col=${col}`);
    return '??';
  }

  const columnLetter = String.fromCharCode('a'.charCodeAt(0) + col);
  const rowNumber = String(row + 1);

  return columnLetter + rowNumber;
}

/**
 * Generates a concatenated string from move history array
 * @param history - Array of move notation strings (e.g., ["e6", "f6", "f5"])
 * @returns Concatenated string without separators (e.g., "e6f6f5")
 *          Returns empty string for empty array
 *
 * @example
 * generateNotationString([]) // returns ""
 * generateNotationString(["e6"]) // returns "e6"
 * generateNotationString(["e6", "f6", "f5"]) // returns "e6f6f5"
 */
export function generateNotationString(history: readonly string[]): string {
  return history.join('');
}
