/**
 * E2E Test Fixtures
 *
 * Test game state constants for various game end scenarios.
 * These fixtures are used with game state injection for E2E testing.
 */

import type {
  Board,
  Cell,
  Player,
  Position,
  GameStatus,
} from '../../src/lib/game/types';

/**
 * Game state snapshot for E2E testing
 * Matches the GameStateSnapshot type expected by useGameState
 */
export interface GameStateSnapshot {
  /** 8x8 board state */
  readonly board: Board;
  /** Current player turn */
  readonly currentPlayer: Player;
  /** List of valid move positions */
  readonly validMoves: Position[];
  /** Game status (playing/finished) */
  readonly gameStatus: GameStatus;
  /** Black stone count */
  readonly blackCount: number;
  /** White stone count */
  readonly whiteCount: number;
}

/**
 * Create an empty 8x8 board
 */
function createEmptyBoard(): Cell[][] {
  return Array(8)
    .fill(null)
    .map(() => Array(8).fill(null) as Cell[]);
}

/**
 * Black (Player) wins scenario
 * Black: 36, White: 28
 */
export function createBlackWinsBoard(): Cell[][] {
  const board = createEmptyBoard();

  // Fill with a realistic end-game position where black wins
  // Black stones (36 total)
  const blackPositions = [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [3, 5],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [5, 0],
    [5, 1],
    [5, 2],
    [5, 3],
    [6, 0],
    [6, 1],
    [6, 2],
    [6, 3],
  ];

  // White stones (28 total)
  const whitePositions = [
    [0, 6],
    [0, 7],
    [1, 6],
    [1, 7],
    [2, 6],
    [2, 7],
    [3, 6],
    [3, 7],
    [4, 4],
    [4, 5],
    [4, 6],
    [4, 7],
    [5, 4],
    [5, 5],
    [5, 6],
    [5, 7],
    [6, 4],
    [6, 5],
    [6, 6],
    [6, 7],
    [7, 0],
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
    [7, 6],
    [7, 7],
  ];

  blackPositions.forEach(([row, col]) => {
    board[row][col] = 'black';
  });

  whitePositions.forEach(([row, col]) => {
    board[row][col] = 'white';
  });

  return board;
}

/**
 * White (AI) wins scenario
 * Black: 28, White: 36
 */
export function createWhiteWinsBoard(): Cell[][] {
  const board = createEmptyBoard();

  // Fill with a realistic end-game position where white wins
  // Black stones (28 total)
  const blackPositions = [
    [0, 6],
    [0, 7],
    [1, 6],
    [1, 7],
    [2, 6],
    [2, 7],
    [3, 6],
    [3, 7],
    [4, 4],
    [4, 5],
    [4, 6],
    [4, 7],
    [5, 4],
    [5, 5],
    [5, 6],
    [5, 7],
    [6, 4],
    [6, 5],
    [6, 6],
    [6, 7],
    [7, 0],
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
    [7, 6],
    [7, 7],
  ];

  // White stones (36 total)
  const whitePositions = [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [2, 5],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [3, 5],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [5, 0],
    [5, 1],
    [5, 2],
    [5, 3],
    [6, 0],
    [6, 1],
    [6, 2],
    [6, 3],
  ];

  blackPositions.forEach(([row, col]) => {
    board[row][col] = 'black';
  });

  whitePositions.forEach(([row, col]) => {
    board[row][col] = 'white';
  });

  return board;
}

/**
 * Draw scenario
 * Black: 32, White: 32
 */
export function createDrawBoard(): Cell[][] {
  const board = createEmptyBoard();

  // Fill with equal stones (32 each)
  // Black stones - left half of board (32 total)
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      board[row][col] = 'black';
    }
  }

  // White stones - right half of board (32 total)
  for (let row = 0; row < 8; row++) {
    for (let col = 4; col < 8; col++) {
      board[row][col] = 'white';
    }
  }

  return board;
}

/**
 * Pre-defined game state snapshots for E2E testing
 */
export const TEST_GAME_STATES = {
  /**
   * Black (Player) wins: 36 vs 28
   */
  blackWins: {
    board: createBlackWinsBoard(),
    currentPlayer: 'black' as Player,
    validMoves: [],
    gameStatus: { type: 'finished', winner: 'black' } as GameStatus,
    blackCount: 36,
    whiteCount: 28,
  } as GameStateSnapshot,

  /**
   * White (AI) wins: 28 vs 36
   */
  whiteWins: {
    board: createWhiteWinsBoard(),
    currentPlayer: 'black' as Player,
    validMoves: [],
    gameStatus: { type: 'finished', winner: 'white' } as GameStatus,
    blackCount: 28,
    whiteCount: 36,
  } as GameStateSnapshot,

  /**
   * Draw: 32 vs 32
   */
  draw: {
    board: createDrawBoard(),
    currentPlayer: 'black' as Player,
    validMoves: [],
    gameStatus: { type: 'finished', winner: 'draw' } as GameStatus,
    blackCount: 32,
    whiteCount: 32,
  } as GameStateSnapshot,
} as const;

/**
 * Storage key for E2E game state injection
 * Only works in development environment
 */
export const E2E_GAME_STATE_KEY = 'e2e-game-state';
