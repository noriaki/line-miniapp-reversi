import { useEffect, useRef, useCallback } from 'react';
import type { Board, Player, Position } from '@/lib/game/types';
import type { AIWorkerResponse } from '@/lib/ai/types';
import { selectRandomValidMove } from '@/lib/ai/ai-fallback';
import { calculateValidMoves } from '@/lib/game/game-logic';
import { createAIWorker } from './worker-factory';

/**
 * AI calculation timeout in milliseconds
 * Per requirement: AI must respond within 3 seconds
 */
export const AI_CALCULATION_TIMEOUT_MS = 3000;

interface PendingRequest {
  resolve: (position: Position) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
  board: Board;
  player: Player;
}

export function useAIPlayer() {
  const workerRef = useRef<Worker | null>(null);
  const requestCounterRef = useRef(0);
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());

  useEffect(() => {
    // Initialize worker on mount
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        const worker = createAIWorker();
        workerRef.current = worker;

        if (worker) {
          // Set up single message listener for all requests
          const handleWorkerMessage = (
            event: MessageEvent<AIWorkerResponse>
          ) => {
            const { requestId, type, payload } = event.data;

            if (!requestId) {
              // Legacy response without requestId, ignore
              return;
            }

            const pendingRequest = pendingRequestsRef.current.get(requestId);
            if (!pendingRequest) {
              // Request already completed or timed out
              return;
            }

            // Remove from pending requests
            pendingRequestsRef.current.delete(requestId);
            clearTimeout(pendingRequest.timeout);

            if (type === 'success' && payload.move) {
              pendingRequest.resolve(payload.move);
            } else {
              // WASM error - use random fallback
              console.warn(
                'AI calculation error, using random fallback:',
                payload.error
              );
              const validMoves = calculateValidMoves(
                pendingRequest.board,
                pendingRequest.player
              );
              try {
                const fallbackMove = selectRandomValidMove(validMoves);
                pendingRequest.resolve(fallbackMove);
              } catch {
                pendingRequest.reject(
                  new Error('AI calculation failed and fallback failed')
                );
              }
            }
          };

          worker.addEventListener('message', handleWorkerMessage);
        }
      } catch (error) {
        console.error('Failed to initialize AI worker:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      // Capture current value for cleanup
      const pendingRequests = pendingRequestsRef.current;

      // Clear all pending requests
      pendingRequests.forEach(({ timeout }) => clearTimeout(timeout));
      pendingRequests.clear();

      workerRef.current?.terminate();
    };
  }, []);

  const calculateMove = useCallback(
    async (board: Board, player: Player): Promise<Position> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Fallback to random move if worker not initialized
          console.warn('AI Worker not initialized, using random fallback');
          const validMoves = calculateValidMoves(board, player);
          try {
            const fallbackMove = selectRandomValidMove(validMoves);
            resolve(fallbackMove);
          } catch (fallbackError) {
            reject(fallbackError);
          }
          return;
        }

        // Generate unique request ID
        const requestId = `req-${++requestCounterRef.current}`;

        // Set up timeout
        const timeout = setTimeout(() => {
          // Remove from pending requests
          pendingRequestsRef.current.delete(requestId);

          // AI calculation timeout - use random fallback
          console.warn(
            `AI calculation timeout (>${AI_CALCULATION_TIMEOUT_MS}ms), using random fallback`
          );
          const validMoves = calculateValidMoves(board, player);
          try {
            const fallbackMove = selectRandomValidMove(validMoves);
            resolve(fallbackMove);
          } catch {
            reject(new Error('AI calculation timeout and fallback failed'));
          }
        }, AI_CALCULATION_TIMEOUT_MS);

        // Store pending request
        pendingRequestsRef.current.set(requestId, {
          resolve,
          reject,
          timeout,
          board,
          player,
        });

        // Send calculation request to worker
        workerRef.current.postMessage({
          type: 'calculate',
          requestId,
          payload: {
            board,
            currentPlayer: player,
            timeoutMs: AI_CALCULATION_TIMEOUT_MS,
          },
        });
      });
    },
    []
  );

  return { calculateMove };
}
