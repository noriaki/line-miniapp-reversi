import { useEffect, useRef, useCallback } from 'react';
import type { Board, Player, Position } from '@/lib/game/types';
import { selectRandomValidMove } from '@/lib/ai/ai-fallback';
import { calculateValidMoves } from '@/lib/game/game-logic';
import { createAIWorker } from './worker-factory';

export function useAIPlayer() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Check if running in test environment
    if (process.env.NODE_ENV === 'test') {
      // Skip worker initialization in tests
      return;
    }

    // Initialize worker on mount
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        workerRef.current = createAIWorker();
      } catch (error) {
        console.error('Failed to initialize AI worker:', error);
      }
    }

    // Cleanup on unmount
    return () => {
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

        // Set up timeout (3 seconds per requirement)
        const timeout = setTimeout(() => {
          // AI calculation timeout - use random fallback
          console.warn('AI calculation timeout (>3s), using random fallback');
          workerRef.current?.removeEventListener('message', handleMessage);
          const validMoves = calculateValidMoves(board, player);
          try {
            const fallbackMove = selectRandomValidMove(validMoves);
            resolve(fallbackMove);
          } catch {
            reject(new Error('AI calculation timeout and fallback failed'));
          }
        }, 3000);

        // Set up message listener
        const handleMessage = (event: MessageEvent) => {
          clearTimeout(timeout);
          workerRef.current?.removeEventListener('message', handleMessage);

          if (event.data.type === 'success') {
            resolve(event.data.payload.move);
          } else {
            // WASM error - use random fallback
            console.warn(
              'AI calculation error, using random fallback:',
              event.data.payload.error
            );
            const validMoves = calculateValidMoves(board, player);
            try {
              const fallbackMove = selectRandomValidMove(validMoves);
              resolve(fallbackMove);
            } catch {
              reject(new Error('AI calculation failed and fallback failed'));
            }
          }
        };

        workerRef.current.addEventListener('message', handleMessage);

        // Send calculation request to worker
        workerRef.current.postMessage({
          type: 'calculate',
          payload: { board, currentPlayer: player, timeoutMs: 3000 },
        });
      });
    },
    []
  );

  return { calculateMove };
}
