/**
 * Cell ID generation utilities for HTML element IDs
 * Converts board indices to chess notation format ([a-h][1-8])
 *
 * This module provides functions to generate unique IDs for board cells
 * that match the chess notation format used in move history.
 *
 * Important: This codebase uses the following mapping:
 *   - colIndex (0-7) → column letter (a-h) (horizontal, left→right)
 *   - rowIndex (0-7) → row number (1-8) (vertical, top→bottom)
 *
 * This follows standard chess notation where columns are horizontal (a-h) and rows are vertical (1-8)
 */

/**
 * Generates a unique ID for a board cell in chess notation format
 *
 * @param rowIndex - Row index (0-7) which maps to row numbers (1-8, vertical position)
 * @param colIndex - Column index (0-7) which maps to column letters (a-h, horizontal position)
 * @returns Chess notation ID (e.g., "a1", "d3", "h8")
 *
 * @example
 * generateCellId(0, 0) // returns "a1" (top-left corner)
 * generateCellId(7, 7) // returns "h8" (bottom-right corner)
 * generateCellId(2, 3) // returns "d3" (middle cell)
 *
 * @preconditions
 * - rowIndex is an integer in the range [0, 7]
 * - colIndex is an integer in the range [0, 7]
 *
 * @postconditions
 * - Returns a string matching the pattern /^[a-h][1-8]$/
 * - Same input always produces same output (idempotent)
 *
 * @invariants
 * - board[0][0] → "a1"
 * - board[7][7] → "h8"
 */
export function generateCellId(rowIndex: number, colIndex: number): string {
  const column = String.fromCharCode(97 + colIndex);
  const row = rowIndex + 1;
  return `${column}${row}`;
}
