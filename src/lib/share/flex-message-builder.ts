/**
 * Flex Message Builder for LINE Share
 * Builds LINE Flex Message Bubble format for game result sharing
 */

/**
 * Flex Message type definitions for LIFF shareTargetPicker
 * Based on LINE Flex Message specification
 */

/** Flex Bubble container */
interface FlexBubble {
  type: 'bubble';
  hero?: {
    type: 'image';
    url: string;
    size?: string;
    aspectRatio?: string;
    aspectMode?: string;
  };
  body?: FlexBox;
  footer?: FlexBox;
}

/** Flex Box component */
interface FlexBox {
  type: 'box';
  layout: 'horizontal' | 'vertical';
  contents: FlexComponent[];
  flex?: number;
  margin?: string;
  paddingAll?: string;
  alignItems?: string;
  justifyContent?: string;
}

/** Flex Text component */
interface FlexText {
  type: 'text';
  text: string;
  size?: string;
  weight?: string;
  color?: string;
  flex?: number;
  margin?: string;
  align?: string;
}

/** Flex Button component */
interface FlexButton {
  type: 'button';
  action: {
    type: 'uri';
    label: string;
    uri: string;
  };
  style?: 'primary' | 'secondary' | 'link';
  color?: string;
}

/** Flex Separator component */
interface FlexSeparator {
  type: 'separator';
  margin?: string;
}

/** Union type for all Flex components */
type FlexComponent = FlexBox | FlexText | FlexButton | FlexSeparator;

/** Flex Message */
interface FlexMessage {
  type: 'flex';
  altText: string;
  contents: FlexBubble;
}

/** Share result data structure */
export interface ShareResult {
  readonly encodedMoves: string;
  readonly side: 'b' | 'w';
  readonly blackCount: number;
  readonly whiteCount: number;
  readonly winner: 'black' | 'white' | 'draw';
}

/**
 * Build a LINE Flex Message for sharing game results
 *
 * @param result - Game result data
 * @param baseUrl - Base URL for the application (must be HTTPS)
 * @returns FlexMessage object ready to be sent via shareTargetPicker
 */
export function buildFlexMessage(
  result: ShareResult,
  baseUrl: string
): FlexMessage {
  const { encodedMoves, side, blackCount, whiteCount, winner } = result;

  // Build URLs
  const resultPageUrl = `${baseUrl}/r/${side}/${encodedMoves}`;
  const ogImageUrl = `${resultPageUrl}/opengraph-image`;

  // Determine winner display
  const isPlayerWinner =
    (side === 'b' && winner === 'black') ||
    (side === 'w' && winner === 'white');
  const isAIWinner =
    (side === 'b' && winner === 'white') ||
    (side === 'w' && winner === 'black');

  // Build player and AI sections based on side
  const playerStone = side === 'b' ? '\u25cf' : '\u25cb'; // Black: ●, White: ○
  const playerCount = side === 'b' ? blackCount : whiteCount;

  const aiStone = side === 'b' ? '\u25cb' : '\u25cf'; // White: ○, Black: ●
  const aiCount = side === 'b' ? whiteCount : blackCount;

  // Build the Flex Bubble
  const bubble: FlexBubble = {
    type: 'bubble',
    hero: {
      type: 'image',
      url: ogImageUrl,
      size: 'full',
      aspectRatio: '1200:630',
      aspectMode: 'fit',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        // Score display row
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            // Player score section
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                // Player label with crown if winner
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    ...(isPlayerWinner
                      ? [
                          {
                            type: 'text' as const,
                            text: '\uD83D\uDC51',
                            size: 'sm' as const,
                            flex: 0,
                          },
                        ]
                      : []),
                    {
                      type: 'text' as const,
                      text: '\u30D7\u30EC\u30FC\u30E4\u30FC',
                      size: 'sm' as const,
                      flex: 0,
                      margin: isPlayerWinner
                        ? ('xs' as const)
                        : ('none' as const),
                    },
                  ],
                  justifyContent: 'center',
                },
                // Player score
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: playerStone,
                      size: 'md',
                      flex: 0,
                    },
                    {
                      type: 'text',
                      text: String(playerCount),
                      size: 'xxl',
                      weight: 'bold',
                      flex: 0,
                      margin: 'sm',
                    },
                  ],
                  justifyContent: 'center',
                  margin: 'sm',
                  alignItems: 'center',
                },
              ],
              flex: 1,
              alignItems: 'center',
            },
            // VS divider
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'vs',
                  size: 'xs',
                  color: '#888888',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: '-',
                  size: 'xl',
                  color: '#888888',
                  align: 'center',
                  margin: 'sm',
                },
              ],
              flex: 0,
              justifyContent: 'center',
              margin: 'lg',
            },
            // AI score section
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                // AI label with crown if winner
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    ...(isAIWinner
                      ? [
                          {
                            type: 'text' as const,
                            text: '\uD83D\uDC51',
                            size: 'sm' as const,
                            flex: 0,
                          },
                        ]
                      : []),
                    {
                      type: 'text' as const,
                      text: 'AI',
                      size: 'sm' as const,
                      flex: 0,
                      margin: isAIWinner ? ('xs' as const) : ('none' as const),
                    },
                  ],
                  justifyContent: 'center',
                },
                // AI score
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: String(aiCount),
                      size: 'xxl',
                      weight: 'bold',
                      flex: 0,
                    },
                    {
                      type: 'text',
                      text: aiStone,
                      size: 'md',
                      flex: 0,
                      margin: 'sm',
                    },
                  ],
                  justifyContent: 'center',
                  margin: 'sm',
                  alignItems: 'center',
                },
              ],
              flex: 1,
              alignItems: 'center',
              margin: 'lg',
            },
          ],
          alignItems: 'center',
        },
        // Separator
        {
          type: 'separator',
          margin: 'xl',
        },
        // Call to action text
        {
          type: 'text',
          text: 'AI\u306B\u52DD\u3066\u308B\u304B\u306A\uFF1F',
          size: 'sm',
          align: 'center',
          color: '#888888',
          margin: 'lg',
        },
      ],
      paddingAll: 'lg',
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'button',
          action: {
            type: 'uri',
            label:
              '\u304B\u3093\u305F\u3093\u30EA\u30D0\u30FC\u30B7\u3092\u30D7\u30EC\u30A4',
            uri: resultPageUrl,
          },
          style: 'primary',
          color: '#06C755',
        },
      ],
    },
  };

  // Build alt text
  const altText = `\u30EA\u30D0\u30FC\u30B7\u5BFE\u6226\u7D50\u679C: \u9ED2 ${blackCount} - \u767D ${whiteCount}`;

  return {
    type: 'flex',
    altText,
    contents: bubble,
  };
}
