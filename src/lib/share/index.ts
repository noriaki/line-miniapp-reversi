/**
 * Share functionality module exports
 * Provides move encoding/decoding and board replay for game result sharing
 */

// Move encoder
export {
  encodeMoves,
  decodeMoves,
  replayMoves,
  positionToWthor,
  wthorToPosition,
  countStones,
  determineWinner,
} from './move-encoder';

export type { DecodeResult, ReplayResult } from './move-encoder';
