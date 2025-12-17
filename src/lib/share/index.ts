/**
 * Share functionality module exports
 * Provides move encoding/decoding, board replay, and sharing services for game result sharing
 */

// Move encoder
export {
  encodeMoves,
  decodeMoves,
  replayMoves,
  positionToChar,
  charToPosition,
  countStones,
  determineWinner,
} from './move-encoder';

export type { DecodeResult, ReplayResult } from './move-encoder';

// Flex Message builder
export { buildFlexMessage } from './flex-message-builder';

export type { ShareResult } from './flex-message-builder';

// Share service
export {
  canShareToLine,
  canShareToWeb,
  shareToLine,
  shareToWeb,
} from './share-service';

export type { ShareOutcome } from './share-service';

// URL builder
export {
  buildPermalink,
  buildEndpointUrl,
  buildResultPath,
  buildOgImagePath,
} from './url-builder';
