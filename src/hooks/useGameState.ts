import { useState, useCallback, useEffect, useRef } from 'react';
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
 * Load E2E injected game state from sessionStorage
 * Returns null if no valid state is found or if in production
 * This function is designed to be called once per component mount
 */
function loadE2EInjectedState(): E2EGameStateSnapshot | null {
  if (!isE2EStateInjectionEnabled()) {
    return null;
  }

  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return null;
  }

  try {
    const stored = sessionStorage.getItem(E2E_GAME_STATE_KEY);
    if (!stored) {
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
      return null;
    }

    // Clear the injected state from sessionStorage after loading (one-time use)
    sessionStorage.removeItem(E2E_GAME_STATE_KEY);

    // Set global flag to indicate E2E injection is supported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__E2E_STATE_INJECTION_ENABLED__ = true;

    return parsed;
  } catch {
    return null;
  }
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
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [gameStatus, setGameStatus] = useState<GameStatus>({ type: 'playing' });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [consecutivePassCount, setConsecutivePassCount] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<Position | null>(null);

  // Track if E2E state has been applied for this component instance
  const e2eStateAppliedRef = useRef(false);

  // Load E2E injected state after mount (client-side only)
  // This is intentionally setting state from an external source (sessionStorage)
  // after hydration, which is a valid use case for E2E testing.
  // The cascading render is acceptable here as it only happens once on mount.
  useEffect(() => {
    if (e2eStateAppliedRef.current) {
      return;
    }

    const injectedState = loadE2EInjectedState();
    if (injectedState) {
      e2eStateAppliedRef.current = true;
      // E2E testing: intentionally sync external state (sessionStorage) after hydration
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBoard(injectedState.board);
      setCurrentPlayer(injectedState.currentPlayer);
      setGameStatus(injectedState.gameStatus);
    }
  }, []);

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
