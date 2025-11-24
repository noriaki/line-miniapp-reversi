/**
 * Board state management and initialization
 * Implements immutable board operations for Reversi game
 */

import { Board, Cell, Player, Position, StoneCount } from './types';

/**
 * Creates the initial board state with 4 stones in the center
 * Initial setup (standard Reversi):
 * - (3,3) = white, (3,4) = black
 * - (4,3) = black, (4,4) = white
 */
export function createInitialBoard(): Board {
  const rows: ReadonlyArray<Cell>[] = [];

  for (let row = 0; row < 8; row++) {
    const cols: Cell[] = [];
    for (let col = 0; col < 8; col++) {
      if (row === 3 && col === 3) {
        cols.push('white');
      } else if (row === 3 && col === 4) {
        cols.push('black');
      } else if (row === 4 && col === 3) {
        cols.push('black');
      } else if (row === 4 && col === 4) {
        cols.push('white');
      } else {
        cols.push(null);
      }
    }
    rows.push(Object.freeze(cols));
  }

  return Object.freeze(rows);
}

/**
 * Counts the number of black and white stones on the board
 */
export function countStones(board: Board): StoneCount {
  let black = 0;
  let white = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (cell === 'black') {
        black++;
      } else if (cell === 'white') {
        white++;
      }
    }
  }

  return { black, white };
}

/**
 * Creates a deep copy of the board
 * Returns a new immutable board
 */
export function cloneBoard(board: Board): Board {
  const rows = board.map((row) => Object.freeze([...row]));
  return Object.freeze(rows);
}

/**
 * Gets the cell value at the specified position
 * Throws error if position is out of bounds
 */
export function getCellAt(board: Board, position: Position): Cell {
  validatePosition(position);
  return board[position.row][position.col];
}

/**
 * Returns a new board with the cell at the specified position set to the given value
 * Does not modify the original board (immutable operation)
 * Throws error if position is out of bounds
 */
export function setCellAt(
  board: Board,
  position: Position,
  value: Cell
): Board {
  validatePosition(position);

  const rows = board.map((row, rowIndex) => {
    if (rowIndex === position.row) {
      const newRow = [...row];
      newRow[position.col] = value;
      return Object.freeze(newRow);
    }
    return row;
  });

  return Object.freeze(rows);
}

/**
 * Validates that a position is within board bounds
 * Throws error if position is out of bounds
 */
function validatePosition(position: Position): void {
  if (
    position.row < 0 ||
    position.row >= 8 ||
    position.col < 0 ||
    position.col >= 8
  ) {
    throw new Error(
      `Position out of bounds: (${position.row}, ${position.col})`
    );
  }
}

export type { Board, Cell, Player, Position, StoneCount };
