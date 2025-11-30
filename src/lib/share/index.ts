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

// Image generation
export {
  generateImageBlob,
  type ImageGenerationResult,
} from './share-image-generator';

// Image upload
export { uploadImage, type UploadResult } from './image-uploader';
