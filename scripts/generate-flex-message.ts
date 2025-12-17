/**
 * Flex Message JSON Generator
 *
 * Generates the Flex Message JSON that would be sent when a user shares
 * a game result from a specific result page URL.
 *
 * Usage:
 *   npx tsx scripts/generate-flex-message.ts
 *
 * Or with custom encodedMoves and side:
 *   npx tsx scripts/generate-flex-message.ts <side> <encodedMoves>
 *
 * Example:
 *   npx tsx scripts/generate-flex-message.ts b lt1dVenrTUzNWfXMGLFSDEKHmCZOBAPu3v_2s9-8706y54xRJIghiaYpw
 */

// Import path alias setup for tsx
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Dynamic import with path resolution
async function main() {
  // Default values from .env.local
  const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || '2008360924-2LG5QXmN';
  const BASE_URL = process.env.BASE_URL
    ? `https://${process.env.BASE_URL}`
    : 'https://aleta-bowlike-tyree.ngrok-free.dev';

  // Parse command line arguments or use defaults
  const args = process.argv.slice(2);
  const side: 'b' | 'w' = (args[0] as 'b' | 'w') || 'b';
  const encodedMoves =
    args[1] || 'lt1dVenrTUzNWfXMGLFSDEKHmCZOBAPu3v_2s9-8706y54xRJIghiaYpw';

  console.log('=== Flex Message Generator ===\n');
  console.log('Input:');
  console.log(`  Side: ${side === 'b' ? 'black' : 'white'}`);
  console.log(`  Encoded Moves: ${encodedMoves}`);
  console.log(`  LIFF ID: ${LIFF_ID}`);
  console.log(`  BASE_URL: ${BASE_URL}`);
  console.log('');

  // Import share modules
  const {
    decodeMoves,
    replayMoves,
    determineWinner,
    buildFlexMessage,
    buildPermalink,
    buildEndpointUrl,
    buildResultPath,
    buildOgImagePath,
  } = await import(resolve(projectRoot, 'src/lib/share/index.ts'));

  const { buildHomeUrl } = await import(
    resolve(projectRoot, 'src/lib/share/url-builder.ts')
  );

  // Step 1: Decode moves
  const decodeResult = decodeMoves(encodedMoves);
  if (!decodeResult.success) {
    console.error('Failed to decode moves:', decodeResult.error);
    process.exit(1);
  }

  console.log(`Decoded ${decodeResult.value.length} moves`);

  // Step 2: Replay moves to get final board state
  const replayResult = replayMoves(decodeResult.value);
  if (!replayResult.success) {
    console.error('Failed to replay moves:', replayResult.error);
    if (replayResult.moveIndex !== undefined) {
      console.error(`  at move index: ${replayResult.moveIndex}`);
    }
    process.exit(1);
  }

  const { blackCount, whiteCount } = replayResult;
  console.log(`Final Score: Black ${blackCount} - White ${whiteCount}`);

  // Step 3: Determine winner
  const winner = determineWinner(blackCount, whiteCount);
  console.log(`Winner: ${winner}`);
  console.log('');

  // Step 4: Build URLs
  const resultPath = buildResultPath(side, encodedMoves);
  const ogImagePath = buildOgImagePath(side, encodedMoves);

  const permalinkUrl = buildPermalink(LIFF_ID, resultPath);
  const ogImageUrl = buildEndpointUrl(BASE_URL, ogImagePath);
  const homeUrl = buildHomeUrl(LIFF_ID);

  console.log('URLs:');
  console.log(`  Permalink: ${permalinkUrl}`);
  console.log(`  OG Image: ${ogImageUrl}`);
  console.log(`  Home: ${homeUrl}`);
  console.log('');

  // Step 5: Build Flex Message
  const shareResult = {
    encodedMoves,
    side,
    blackCount,
    whiteCount,
    winner,
  };

  const flexMessage = buildFlexMessage(
    shareResult,
    permalinkUrl,
    ogImageUrl,
    homeUrl
  );

  // Output the Flex Message JSON
  console.log('=== Flex Message JSON ===\n');
  console.log(JSON.stringify(flexMessage, null, 2));

  // Also output just the bubble contents for LINE Flex Message Simulator
  console.log(
    '\n=== Bubble Contents Only (for LINE Flex Message Simulator) ===\n'
  );
  console.log(JSON.stringify(flexMessage.contents, null, 2));
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
