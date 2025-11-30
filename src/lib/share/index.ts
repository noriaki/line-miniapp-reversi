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

// Share text builder
export { buildShareText } from './share-text-builder';

// Flex Message builder
export { buildShareFlexMessage } from './flex-message-builder';
export type {
  FlexMessage,
  FlexBubble,
  FlexBox,
  FlexImage,
  FlexText,
  FlexButton,
  FlexSeparator,
  FlexComponent,
  URIAction,
} from './flex-message-types';

// Share service
export {
  prepareShareImage,
  shareViaLine,
  shareViaWebShare,
  type ShareServiceResult,
  type PreparedShareImage,
} from './share-service';
