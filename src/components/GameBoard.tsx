'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import { useGameErrorHandler } from '@/hooks/useGameErrorHandler';
import { useLiff } from '@/hooks/useLiff';
import {
  applyMove,
  validateMove,
  calculateValidMoves,
} from '@/lib/game/game-logic';
import { checkGameEnd } from '@/lib/game/game-end';
import { generateCellId } from '@/lib/game/cell-id';
import type { Position } from '@/lib/game/types';
import './GameBoard.css';

export interface GameBoardProps {
  initialSettings?: Record<string, unknown>; // Future settings can be added here
}

/**
 * GameBoard Client Component
 * Manages the entire game UI and user interaction
 */
export default function GameBoard(): JSX.Element {
  const {
    board,
    currentPlayer,
    validMoves,
    gameStatus,
    blackCount,
    whiteCount,
    isAIThinking,
    consecutivePassCount,
    notationString,
    lastMove,
    updateBoard,
    switchPlayer,
    updateGameStatus,
    setAIThinking,
    incrementPassCount,
    resetPassCount,
    resetGame,
  } = useGameState();

  const { calculateMove } = useAIPlayer();

  const {
    handleInvalidMove,
    getErrorMessage,
    notifyPass,
    getPassMessage,
    hasInconsistency,
    clearInconsistency,
    getInconsistencyMessage,
  } = useGameErrorHandler();

  // LIFF integration for profile icon display (Task 4.1, 4.2, 4.3)
  const { profile, isReady, isInClient, isLoggedIn, login } = useLiff();

  // State for handling image load errors (Task 4.1)
  const [imageError, setImageError] = useState(false);

  // Handle LINE login (Task 4.2)
  const handleLineLogin = useCallback(async () => {
    try {
      await login();
    } catch (error) {
      console.error('LINE login failed:', error);
    }
  }, [login]);

  // Check if position is a valid move
  const isValidMove = useCallback(
    (position: Position): boolean => {
      return validMoves.some(
        (move) => move.row === position.row && move.col === position.col
      );
    },
    [validMoves]
  );

  // Handle pass operation (Task 3.1, Task 5.1, Task 5.2)
  const handlePass = useCallback(async () => {
    // Task 5.2: Validate game state
    if (gameStatus.type !== 'playing') {
      console.error('Pass attempted while game is not in playing state', {
        gameStatus,
      });
      return;
    }

    // Task 5.1: Validate no valid moves exist
    // validMoves is recalculated on each render from board/currentPlayer,
    // so we access it directly rather than adding to dependencies
    const currentValidMoves = calculateValidMoves(board, currentPlayer);
    if (currentValidMoves.length > 0) {
      console.warn('Pass button clicked while valid moves exist');
      return;
    }

    // Notify pass
    notifyPass(currentPlayer);

    // Increment pass count
    incrementPassCount();

    // Switch player
    switchPlayer();
  }, [
    gameStatus,
    board,
    currentPlayer,
    notifyPass,
    incrementPassCount,
    switchPlayer,
  ]);

  // Handle cell click
  const handleCellClick = useCallback(
    async (position: Position) => {
      if (gameStatus.type !== 'playing' || isAIThinking) return;
      if (currentPlayer !== 'black') return; // Only allow user moves

      const moveResult = validateMove(board, position, currentPlayer);
      if (!moveResult.success) {
        // Show error feedback with specific reason
        handleInvalidMove(position, moveResult.error.reason);
        return;
      }

      const applyResult = applyMove(board, position, currentPlayer);
      if (!applyResult.success) return;

      updateBoard(applyResult.value, position);

      // Reset pass count on valid move (Task 3.3)
      resetPassCount();

      // Check game end - calculate valid moves for both players on new board
      const blackValidMovesAfter = calculateValidMoves(
        applyResult.value,
        'black'
      );
      const whiteValidMovesAfter = calculateValidMoves(
        applyResult.value,
        'white'
      );
      const endResult = checkGameEnd(
        applyResult.value,
        blackValidMovesAfter,
        whiteValidMovesAfter
      );

      if (endResult.ended) {
        updateGameStatus({
          type: 'finished',
          winner: endResult.winner,
        });
        return;
      }

      // Switch to AI turn
      switchPlayer();
    },
    [
      board,
      currentPlayer,
      gameStatus,
      isAIThinking,
      updateBoard,
      switchPlayer,
      updateGameStatus,
      handleInvalidMove,
      resetPassCount,
    ]
  );

  // Consecutive pass detection (Task 4.2, Task 5.3)
  useEffect(() => {
    if (gameStatus.type !== 'playing') {
      return;
    }

    // Task 5.3: Validate consecutivePassCount range
    if (consecutivePassCount < 0 || consecutivePassCount > 2) {
      console.error('Invalid consecutivePassCount value', {
        consecutivePassCount,
      });
      resetPassCount(); // Reset to safe state
      return;
    }

    // Task 4.2: Check for consecutive pass (both players passed)
    if (consecutivePassCount === 2) {
      // Both players have no valid moves - end game
      const blackValidMoves = calculateValidMoves(board, 'black');
      const whiteValidMoves = calculateValidMoves(board, 'white');
      const endResult = checkGameEnd(board, blackValidMoves, whiteValidMoves);

      if (endResult.ended) {
        updateGameStatus({
          type: 'finished',
          winner: endResult.winner,
        });
      }
    }
  }, [
    consecutivePassCount,
    gameStatus,
    board,
    updateGameStatus,
    resetPassCount,
  ]);

  // AI turn handling (with auto-pass support - Task 4.1)
  useEffect(() => {
    if (
      gameStatus.type !== 'playing' ||
      currentPlayer !== 'white' ||
      isAIThinking
    ) {
      return;
    }

    // Task 4.1: Check if AI has valid moves
    if (validMoves.length === 0) {
      // AI has no valid moves - auto-pass
      setAIThinking(true);

      // Show AI thinking indicator briefly
      setTimeout(() => {
        // Notify AI pass
        notifyPass('white');

        // Increment pass count
        incrementPassCount();

        // Wait 1 second for user to see notification
        setTimeout(() => {
          // Switch back to user
          switchPlayer();
          setAIThinking(false);
        }, 1000);
      }, 100);

      return;
    }

    setAIThinking(true);

    calculateMove(board, currentPlayer)
      .then((move) => {
        const applyResult = applyMove(board, move, currentPlayer);
        if (applyResult.success) {
          updateBoard(applyResult.value, move);

          // Reset pass count on valid move (Task 3.3)
          resetPassCount();

          // Check game end - calculate valid moves for both players on new board
          const blackValidMovesAfter = calculateValidMoves(
            applyResult.value,
            'black'
          );
          const whiteValidMovesAfter = calculateValidMoves(
            applyResult.value,
            'white'
          );
          const endResult = checkGameEnd(
            applyResult.value,
            blackValidMovesAfter,
            whiteValidMovesAfter
          );
          if (endResult.ended) {
            updateGameStatus({
              type: 'finished',
              winner: endResult.winner,
            });
          } else {
            switchPlayer();
          }
        } else {
          // Fix: AI returned invalid move - skip AI turn to prevent infinite loop
          console.error('AI returned invalid move, skipping turn');
          switchPlayer();
        }
      })
      .catch((error) => {
        console.error('AI calculation failed:', error);
        // Fallback: skip AI turn
        switchPlayer();
      })
      .finally(() => {
        setAIThinking(false);
      });
  }, [
    currentPlayer,
    gameStatus,
    board,
    validMoves,
    isAIThinking,
    calculateMove,
    updateBoard,
    switchPlayer,
    updateGameStatus,
    setAIThinking,
    resetPassCount,
    notifyPass,
    incrementPassCount,
  ]);

  return (
    <div data-testid="game-board" className="game-board">
      {/* Error Messages and Notifications */}
      {getErrorMessage() && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {getErrorMessage()}
        </div>
      )}
      {/* Fixed-height container to prevent layout shift (Task 2, Requirement 2.1) */}
      <div className="h-16 flex items-center justify-center">
        <div
          className={`notification-message bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded transition-opacity duration-200 ${
            getPassMessage() ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {getPassMessage() || '\u00A0'}
        </div>
      </div>
      {hasInconsistency && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {getInconsistencyMessage()}
          <button
            onClick={() => {
              clearInconsistency();
              resetGame();
            }}
            className="ml-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            ゲームをリセット
          </button>
        </div>
      )}

      {/* LINE Login Button for External Browser (Task 4.2) */}
      {isReady && isInClient === false && isLoggedIn === false && (
        <div className="bg-green-100 border border-green-400 px-4 py-3 rounded mb-4 text-center">
          <button
            onClick={handleLineLogin}
            data-testid="liff-login-button"
            className="bg-line-green text-white font-bold py-2 px-6 rounded hover:bg-green-600"
          >
            LINEでログイン
          </button>
          <p className="text-sm text-gray-600 mt-2">
            ログインするとLINEプロフィールアイコンが表示されます
          </p>
        </div>
      )}

      {/* Game Status Display */}
      <div className="game-status">
        {/* Turn Indicator */}
        <div className="turn-indicator">
          {gameStatus.type === 'playing' && (
            <div className="flex items-center justify-center gap-2">
              <span
                className={`inline-block w-6 h-6 rounded-full ${
                  currentPlayer === 'black'
                    ? 'bg-gray-900 ring-2 ring-line-green'
                    : 'bg-gray-300'
                }`}
              />
              <p className="text-xl font-bold">
                {currentPlayer === 'black' ? 'あなたのターン' : 'AI のターン'}
                {isAIThinking && ' (思考中...)'}
              </p>
              <span
                className={`inline-block w-6 h-6 rounded-full ${
                  currentPlayer === 'white'
                    ? 'bg-white ring-2 ring-line-green'
                    : 'bg-gray-300'
                }`}
              />
            </div>
          )}
          {gameStatus.type === 'finished' && (
            <p className="text-xl font-bold game-finished-text">
              ゲーム終了！
              {gameStatus.winner === 'draw'
                ? '引き分け'
                : gameStatus.winner === 'black'
                  ? 'あなたの勝ち!'
                  : 'AI の勝ち!'}
            </p>
          )}
        </div>

        {/* Stone Count */}
        <div className="stone-count">
          <div className="stone-count-item">
            {/* Profile icon for black player (Task 4.1) */}
            {profile?.pictureUrl && !imageError ? (
              <img
                src={profile.pictureUrl}
                alt={profile.displayName}
                data-testid="profile-icon"
                className="w-10 h-10 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className="stone-display stone-display-black"
                data-testid="default-profile-icon"
              />
            )}
            <span
              className="text-2xl font-bold"
              aria-label={`Black score: ${blackCount}`}
            >
              {blackCount}
            </span>
          </div>
          <div className="stone-count-divider">vs</div>
          <div className="stone-count-item stone-count-item--reversed">
            <div className="stone-display stone-display-white" />
            <span
              className="text-2xl font-bold"
              aria-label={`White score: ${whiteCount}`}
            >
              {whiteCount}
            </span>
          </div>
        </div>
      </div>

      {/* Board Grid */}
      <div className="board-grid">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const position: Position = { row: rowIndex, col: colIndex };
            const isValid = isValidMove(position);
            const isLastMove =
              lastMove !== null &&
              position.row === lastMove.row &&
              position.col === lastMove.col;

            const cellId = generateCellId(rowIndex, colIndex);

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                id={cellId}
                className={`board-cell ${isValid ? 'valid-move' : ''}`}
                onClick={() => handleCellClick(position)}
                disabled={
                  gameStatus.type !== 'playing' || currentPlayer !== 'black'
                }
                aria-label={`セル ${cellId}`}
                data-stone={cell || undefined}
                data-row={rowIndex}
                data-col={colIndex}
                data-valid={isValid || undefined}
                data-last-move={isLastMove || undefined}
              >
                {cell === 'black' && <div className="stone stone-black" />}
                {cell === 'white' && <div className="stone stone-white" />}
                {cell === null && isValid && <div className="valid-hint" />}
              </button>
            );
          })
        )}
      </div>

      {/* Pass Button (Task 2.1) */}
      {gameStatus.type === 'playing' && (
        <button
          className="pass-button"
          onClick={handlePass}
          disabled={
            validMoves.length > 0 || currentPlayer !== 'black' || isAIThinking
          }
          aria-label="ターンをパスする"
          aria-disabled={
            validMoves.length > 0 || currentPlayer !== 'black' || isAIThinking
          }
        >
          パス
        </button>
      )}

      {/* Move History Display (Task 4) - Visually hidden for users (Task 1) */}
      {gameStatus.type === 'playing' && (
        <div
          id="history"
          data-testid="move-history"
          aria-label="着手履歴"
          aria-hidden="true"
          className="sr-only"
        >
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {notationString || '\u00A0'}
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameStatus.type === 'finished' && (
        <div className="game-result" data-testid="game-result">
          <button onClick={resetGame} className="reset-button">
            新しいゲームを開始
          </button>
        </div>
      )}
    </div>
  );
}
