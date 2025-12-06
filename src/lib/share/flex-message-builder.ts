/**
 * FlexMessageBuilder for LINE share target picker
 */

import type { GameResult } from './types';
import type {
  FlexMessage,
  FlexBubble,
  FlexBox,
  FlexImage,
  FlexText,
  FlexButton,
  FlexSeparator,
  FlexComponent,
} from './flex-message-types';

/** LINE brand color for buttons */
const LINE_BRAND_COLOR = '#06C755';

/** Crown emoji for winner indication */
const CROWN_EMOJI = '\u{1F451}';

/**
 * Build the hero section with the share image
 */
function buildHeroSection(imageUrl: string): FlexImage {
  return {
    type: 'image',
    url: imageUrl,
    size: 'full',
    aspectRatio: '1200:630',
    aspectMode: 'fit',
  };
}

/**
 * Build the player (black) column
 */
function buildPlayerColumn(blackCount: number, isWinner: boolean): FlexBox {
  const headerContents: FlexComponent[] = isWinner
    ? [
        { type: 'text', text: CROWN_EMOJI, size: 'sm', flex: 0 } as FlexText,
        {
          type: 'text',
          text: 'プレーヤー',
          size: 'sm',
          flex: 0,
          margin: 'xs',
        } as FlexText,
      ]
    : [
        {
          type: 'text',
          text: 'プレーヤー',
          size: 'sm',
          align: 'center',
        } as FlexText,
      ];

  const headerBox: FlexBox = {
    type: 'box',
    layout: 'horizontal',
    contents: headerContents,
    justifyContent: 'center',
  };

  const scoreBox: FlexBox = {
    type: 'box',
    layout: 'horizontal',
    contents: [
      { type: 'text', text: '●', size: 'md', flex: 0 } as FlexText,
      {
        type: 'text',
        text: String(blackCount),
        size: 'xxl',
        weight: 'bold',
        flex: 0,
        margin: 'sm',
      } as FlexText,
    ],
    justifyContent: 'center',
    margin: 'sm',
    alignItems: 'center',
  };

  return {
    type: 'box',
    layout: 'vertical',
    contents: [headerBox, scoreBox],
    flex: 1,
    alignItems: 'center',
  };
}

/**
 * Build the center "vs" column
 */
function buildVsColumn(): FlexBox {
  return {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: 'vs',
        size: 'xs',
        color: '#888888',
        align: 'center',
      } as FlexText,
      {
        type: 'text',
        text: '-',
        size: 'xl',
        color: '#888888',
        align: 'center',
        margin: 'sm',
      } as FlexText,
    ],
    flex: 0,
    justifyContent: 'center',
    margin: 'lg',
  };
}

/**
 * Build the AI (white) column
 */
function buildAIColumn(whiteCount: number, isWinner: boolean): FlexBox {
  const headerContents: FlexComponent[] = isWinner
    ? [
        { type: 'text', text: CROWN_EMOJI, size: 'sm', flex: 0 } as FlexText,
        {
          type: 'text',
          text: 'AI',
          size: 'sm',
          flex: 0,
          margin: 'xs',
        } as FlexText,
      ]
    : [{ type: 'text', text: 'AI', size: 'sm', align: 'center' } as FlexText];

  const headerBox: FlexBox = {
    type: 'box',
    layout: 'horizontal',
    contents: headerContents,
    justifyContent: 'center',
  };

  const scoreBox: FlexBox = {
    type: 'box',
    layout: 'horizontal',
    contents: [
      {
        type: 'text',
        text: String(whiteCount),
        size: 'xxl',
        weight: 'bold',
        flex: 0,
      } as FlexText,
      {
        type: 'text',
        text: '○',
        size: 'md',
        flex: 0,
        margin: 'sm',
      } as FlexText,
    ],
    justifyContent: 'center',
    margin: 'sm',
    alignItems: 'center',
  };

  return {
    type: 'box',
    layout: 'vertical',
    contents: [headerBox, scoreBox],
    flex: 1,
    alignItems: 'center',
    margin: 'lg',
  };
}

/**
 * Build the body section with 3-column score display and invitation text
 */
function buildBodySection(result: GameResult): FlexBox {
  const isBlackWinner = result.winner === 'black';
  const isWhiteWinner = result.winner === 'white';

  const scoreRow: FlexBox = {
    type: 'box',
    layout: 'horizontal',
    contents: [
      buildPlayerColumn(result.blackCount, isBlackWinner),
      buildVsColumn(),
      buildAIColumn(result.whiteCount, isWhiteWinner),
    ],
    alignItems: 'center',
  };

  const separator: FlexSeparator = {
    type: 'separator',
    margin: 'xl',
  };

  const invitationText: FlexText = {
    type: 'text',
    text: 'AIに勝てるかな？',
    size: 'sm',
    align: 'center',
    color: '#888888',
    margin: 'lg',
  };

  return {
    type: 'box',
    layout: 'vertical',
    contents: [scoreRow, separator, invitationText],
    paddingAll: 'lg',
  };
}

/**
 * Build the footer section with the play button
 */
function buildFooterSection(appUrl: string): FlexBox {
  const playButton: FlexButton = {
    type: 'button',
    action: {
      type: 'uri',
      label: 'かんたんリバーシをプレイ',
      uri: appUrl,
    },
    style: 'primary',
    color: LINE_BRAND_COLOR,
  };

  return {
    type: 'box',
    layout: 'vertical',
    contents: [playButton],
  };
}

/**
 * Build the Flex Message bubble container
 */
function buildBubble(
  imageUrl: string,
  result: GameResult,
  appUrl: string
): FlexBubble {
  return {
    type: 'bubble',
    hero: buildHeroSection(imageUrl),
    body: buildBodySection(result),
    footer: buildFooterSection(appUrl),
  };
}

/**
 * Build a share Flex Message for LIFF shareTargetPicker
 *
 * @param imageUrl - URL of the share image (must be HTTPS)
 * @param result - Game result with winner and scores
 * @param appUrl - LIFF endpoint URL for the play button
 * @returns FlexMessage object for shareTargetPicker
 */
export function buildShareFlexMessage(
  imageUrl: string,
  result: GameResult,
  appUrl: string
): FlexMessage {
  return {
    type: 'flex',
    altText: 'リバーシの結果をシェア',
    contents: buildBubble(imageUrl, result, appUrl),
  };
}
