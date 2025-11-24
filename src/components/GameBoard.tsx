'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAIPlayer } from '@/hooks/useAIPlayer';
import { useGameErrorHandler } from '@/hooks/useGameErrorHandler';
import { useMessageQueue } from '@/hooks/useMessageQueue';
import { useLiff } from '@/hooks/useLiff';
import { MessageBox } from '@/components/MessageBox';
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
    getErrorMessage,
    getPassMessage,
    hasInconsistency,
    clearInconsistency,
    getInconsistencyMessage,
  } = useGameErrorHandler(); // handleInvalidMove, notifyPassはPhase 2で削除予定

  const { currentMessage, addMessage } = useMessageQueue();

  const { profile, isReady, isInClient, isLoggedIn, login } = useLiff();

  const [imageError, setImageError] = useState(false);

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

  const handlePass = useCallback(async () => {
    if (gameStatus.type !== 'playing') {
      console.error('Pass attempted while game is not in playing state', {
        gameStatus,
      });
      return;
    }

    // validMoves is recalculated on each render from board/currentPlayer,
    // so we access it directly rather than adding to dependencies
    const currentValidMoves = calculateValidMoves(board, currentPlayer);
    if (currentValidMoves.length > 0) {
      console.warn('Pass button clicked while valid moves exist');
      return;
    }

    // Task 4.2: Use unified message box with 3s timeout for pass notification
    addMessage({
      type: 'info',
      text: '有効な手がありません。パスしました。',
      timeout: 3000,
    });
    incrementPassCount();
    switchPlayer();
  }, [
    gameStatus,
    board,
    currentPlayer,
    addMessage,
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
        // Task 4.2: Use unified message box with 2s timeout for invalid move warning
        const errorText = (() => {
          switch (moveResult.error.reason) {
            case 'occupied':
              return 'そのマスには既に石が置かれています';
            case 'no_flips':
              return 'そのマスに置いても石を反転できません';
            case 'out_of_bounds':
              return '無効な位置です';
            default:
              return '無効な手です';
          }
        })();

        addMessage({
          type: 'warning',
          text: errorText,
          timeout: 2000,
        });
        return;
      }

      const applyResult = applyMove(board, position, currentPlayer);
      if (!applyResult.success) return;

      updateBoard(applyResult.value, position);
      resetPassCount();

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
      addMessage,
      resetPassCount,
    ]
  );

  useEffect(() => {
    if (gameStatus.type !== 'playing') {
      return;
    }

    if (consecutivePassCount < 0 || consecutivePassCount > 2) {
      console.error('Invalid consecutivePassCount value', {
        consecutivePassCount,
      });
      resetPassCount();
      return;
    }

    if (consecutivePassCount === 2) {
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

  useEffect(() => {
    if (
      gameStatus.type !== 'playing' ||
      currentPlayer !== 'white' ||
      isAIThinking
    ) {
      return;
    }

    if (validMoves.length === 0) {
      setAIThinking(true);

      setTimeout(() => {
        // Task 4.2: Use unified message box with 3s timeout for AI pass notification
        addMessage({
          type: 'info',
          text: 'AIに有効な手がありません。AIがパスしました。',
          timeout: 3000,
        });
        incrementPassCount();

        setTimeout(() => {
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
          resetPassCount();

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
          // AI returned invalid move - skip turn to prevent infinite loop
          console.error('AI returned invalid move, skipping turn');
          switchPlayer();
        }
      })
      .catch((error) => {
        console.error('AI calculation failed:', error);
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
    addMessage,
    incrementPassCount,
  ]);

  return (
    <div data-testid="game-board" className="game-board">
      {/* Task 4.1: Unified Message Box Integration */}
      <MessageBox message={currentMessage} />

      {/* Error Messages and Notifications */}
      {getErrorMessage() && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {getErrorMessage()}
        </div>
      )}
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
