/**
 * Type definitions for share functionality
 */

import type { Cell, Player } from '@/lib/game/types';

/**
 * Game result value object for share content
 */
export interface GameResult {
  readonly winner: Player | 'draw';
  readonly blackCount: number;
  readonly whiteCount: number;
}

/**
 * Share operation state machine
 */
export interface ShareState {
  readonly status: 'idle' | 'preparing' | 'ready' | 'sharing';
  readonly imageUrl: string | null;
  readonly imageBlob: Blob | null;
  readonly error: ShareError | null;
  /** Flag for auto-share after login redirect */
  readonly hasPendingShare: boolean;
}

/**
 * Share error discriminated union
 */
export type ShareError =
  | { type: 'upload_failed'; message: string }
  | { type: 'share_failed'; message: string }
  | { type: 'image_too_large'; message: string }
  | { type: 'cancelled' }
  | { type: 'not_supported' };

/**
 * Pending share data persisted across login redirects
 * Stored in sessionStorage
 */
export interface PendingShareData {
  /** Final board state (Cell[][] format) */
  readonly board: Cell[][];
  /** Black stone count */
  readonly blackCount: number;
  /** White stone count */
  readonly whiteCount: number;
  /** Winner */
  readonly winner: 'black' | 'white' | 'draw';
  /** Save timestamp (Unix timestamp in milliseconds) */
  readonly timestamp: number;
}

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  /** Resolution scale (default: 2) */
  readonly scale?: number;
  /** Output format (default: 'image/png') */
  readonly format?: 'image/png' | 'image/jpeg';
  /** JPEG quality (0-1, default: 0.9) */
  readonly quality?: number;
  /** Maximum file size in bytes (default: 1MB = 1048576) */
  readonly maxSizeBytes?: number;
}
