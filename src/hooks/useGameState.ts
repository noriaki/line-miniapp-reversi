import { useState, useCallback } from 'react';
import type { Board, Player, Position, GameStatus } from '@/lib/game/types';
import { createInitialBoard, countStones } from '@/lib/game/board';
import { calculateValidMoves } from '@/lib/game/game-logic';
import {
  positionToNotation,
  generateNotationString,
} from '@/lib/game/move-history';

/**
 * E2E state injection key for testing
 * Only used in development/test environments
 */
const E2E_GAME_STATE_KEY = 'e2e-game-state';

/**
 * Check if E2E state injection is available
 * Only enabled in non-production environments
 */
function isE2EStateInjectionEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * E2E game state snapshot interface
 */
interface E2EGameStateSnapshot {
  readonly board: Board;
  readonly currentPlayer: Player;
  readonly validMoves: Position[];
  readonly gameStatus: GameStatus;
  readonly blackCount: number;
  readonly whiteCount: number;
}

/**
 * Initial game state interface for lazy initialization
 */
interface InitialGameState {
  board: Board;
  currentPlayer: Player;
  gameStatus: GameStatus;
}

/**
 * Cached E2E injected state (loaded once)
 */
let cachedE2EState: E2EGameStateSnapshot | null | undefined = undefined;
let e2eStateApplied = false;

/**
 * Load E2E injected game state from sessionStorage
 * Returns null if no valid state is found or if in production
 */
function loadE2EInjectedState(): E2EGameStateSnapshot | null {
  // Only load once
  if (e2eStateApplied) {
    return null;
  }

  // Return cached result if already loaded
  if (cachedE2EState !== undefined) {
    e2eStateApplied = true;
    return cachedE2EState;
  }

  if (!isE2EStateInjectionEnabled()) {
    cachedE2EState = null;
    return null;
  }

  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    cachedE2EState = null;
    return null;
  }

  try {
    const stored = sessionStorage.getItem(E2E_GAME_STATE_KEY);
    if (!stored) {
      cachedE2EState = null;
      return null;
    }

    const parsed = JSON.parse(stored) as E2EGameStateSnapshot;

    // Validate required fields
    if (
      !parsed.board ||
      !parsed.gameStatus ||
      typeof parsed.blackCount !== 'number' ||
      typeof parsed.whiteCount !== 'number'
    ) {
      cachedE2EState = null;
      return null;
    }

    // Clear the injected state from sessionStorage after loading (one-time use)
    sessionStorage.removeItem(E2E_GAME_STATE_KEY);

    // Set global flag to indicate E2E injection is supported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__E2E_STATE_INJECTION_ENABLED__ = true;

    // Cache the loaded state
    cachedE2EState = parsed;
    e2eStateApplied = true;
    return parsed;
  } catch {
    cachedE2EState = null;
    return null;
  }
}

/**
 * Get initial game state, checking for E2E injection
 * This is called once during lazy initialization of useState
 */
function getInitialGameState(): InitialGameState {
  if (typeof window !== 'undefined') {
    const injectedState = loadE2EInjectedState();
    if (injectedState) {
      return {
        board: injectedState.board,
        currentPlayer: injectedState.currentPlayer,
        gameStatus: injectedState.gameStatus,
      };
    }
  }

  return {
    board: createInitialBoard(),
    currentPlayer: 'black',
    gameStatus: { type: 'playing' },
  };
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  validMoves: Position[];
  gameStatus: GameStatus;
  blackCount: number;
  whiteCount: number;
  isAIThinking: boolean;
  consecutivePassCount: number;
  moveHistory: readonly string[];
  notationString: string;
  lastMove: Position | null;
  incrementPassCount: () => void;
  resetPassCount: () => void;
}

export function useGameState() {
  // Use lazy initialization to apply E2E state once
  const [initialState] = useState<InitialGameState>(getInitialGameState);
  const [board, setBoard] = useState<Board>(initialState.board);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(
    initialState.currentPlayer
  );
  const [gameStatus, setGameStatus] = useState<GameStatus>(
    initialState.gameStatus
  );
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [consecutivePassCount, setConsecutivePassCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<Position | null>(null);

  const validMoves = calculateValidMoves(board, currentPlayer);
  const { black: blackCount, white: whiteCount } = countStones(board);
  const notationString = generateNotationString(moveHistory);

  const updateBoard = useCallback((newBoard: Board, position?: Position) => {
    setBoard(newBoard);
    if (position) {
      const notation = positionToNotation(position);
      setMoveHistory((prev) => [...prev, notation]);
      setLastMove(position);
    }
  }, []);

  const switchPlayer = useCallback(() => {
    setCurrentPlayer((prev) => (prev === 'black' ? 'white' : 'black'));
  }, []);

  const updateGameStatus = useCallback((status: GameStatus) => {
    setGameStatus(status);
  }, []);

  const setAIThinking = useCallback((thinking: boolean) => {
    setIsAIThinking(thinking);
  }, []);

  const incrementPassCount = useCallback(() => {
    setConsecutivePassCount((prev) => Math.min(prev + 1, 2));
  }, []);

  const resetPassCount = useCallback(() => {
    setConsecutivePassCount(0);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentPlayer('black');
    setGameStatus({ type: 'playing' });
    setIsAIThinking(false);
    setConsecutivePassCount(0);
    setMoveHistory([]);
    setLastMove(null);
  }, []);

  return {
    board,
    currentPlayer,
    validMoves,
    gameStatus,
    blackCount,
    whiteCount,
    isAIThinking,
    consecutivePassCount,
    moveHistory,
    notationString,
    lastMove,
    updateBoard,
    switchPlayer,
    updateGameStatus,
    setAIThinking,
    incrementPassCount,
    resetPassCount,
    resetGame,
  };
}
