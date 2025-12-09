/**
 * BoardDisplay Component
 * Read-only board display for the result page
 * No interactive elements - just displays the final board state
 */

import React from 'react';
import type { Board, Cell } from '@/lib/game/types';
import './BoardDisplay.css';

export interface BoardDisplayProps {
  /** The board state to display */
  readonly board: Board;
}

/**
 * Renders a single cell of the board
 */
function BoardCell({
  cell,
  row,
  col,
}: {
  cell: Cell;
  row: number;
  col: number;
}) {
  return (
    <div
      className="board-display-cell"
      data-row={row}
      data-col={col}
      data-stone={cell || undefined}
    >
      {cell === 'black' && <div className="board-display-stone stone-black" />}
      {cell === 'white' && <div className="board-display-stone stone-white" />}
    </div>
  );
}

/**
 * BoardDisplay - Read-only board display component
 * Used on the result page to show the final game state
 */
export function BoardDisplay({ board }: BoardDisplayProps) {
  return (
    <div
      className="board-display-grid"
      data-testid="board-display"
      aria-label="リバーシ盤面"
      role="img"
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <BoardCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            row={rowIndex}
            col={colIndex}
          />
        ))
      )}
    </div>
  );
}
