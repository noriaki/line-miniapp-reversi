/**
 * Share functionality module exports
 */

// Types
export type {
  GameResult,
  ShareState,
  ShareError,
  PendingShareData,
  ImageGenerationOptions,
} from './types';

// Storage
export { pendingShareStorage, STORAGE_KEY } from './pending-share-storage';
