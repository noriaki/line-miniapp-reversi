/**
 * Flex Message Builder for LINE Share
 * Builds LINE Flex Message Bubble format for game result sharing
 */

/**
 * Flex Message type definitions for LIFF shareTargetPicker
 * Based on LINE Flex Message specification
 */

/** App branding constants */
export const APP_ICON_URL =
  'https://ch.line-scdn.net/0h13VXrO22bhxrIXCF_PERSzl8ZX5YQ3AXSRV6ewteRmUGQis6HxRqAgZxM0gPQkshHCZHOwheQkdHcE8qCxJEewdxViQCRE9KFjtXc09zRn4AanUQXztR/f256x256';
export const ARROW_ICON_URL =
  'https://vos.line-scdn.net/service-notifier/footer_go_btn.png';

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
  spacing?: string;
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
  gravity?: string;
  wrap?: boolean;
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
  margin?: string;
}

/** Flex Separator component */
interface FlexSeparator {
  type: 'separator';
  margin?: string;
  color?: string;
}

/** Flex Image component */
interface FlexImage {
  type: 'image';
  url: string;
  flex?: number;
  gravity?: string;
  size?: string;
  aspectRatio?: string;
  aspectMode?: string;
  action?: {
    type: 'uri';
    label: string;
    uri: string;
  };
}

/** Union type for all Flex components */
type FlexComponent =
  | FlexBox
  | FlexText
  | FlexButton
  | FlexSeparator
  | FlexImage;

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
 * @param permalinkUrl - Permalink URL for result page (miniapp.line.me)
 * @param ogImageUrl - OG image URL (endpoint URL for external access)
 * @param homeUrl - Home URL for new game navigation (miniapp.line.me)
 * @returns FlexMessage object ready to be sent via shareTargetPicker
 */
export function buildFlexMessage(
  result: ShareResult,
  permalinkUrl: string,
  ogImageUrl: string,
  homeUrl: string
): FlexMessage {
  const { side, blackCount, whiteCount, winner } = result;

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
        // Title box
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '\u304B\u3093\u305F\u3093\u30EA\u30D0\u30FC\u30B7\u5BFE\u5C40\u7D50\u679C',
              size: 'sm',
              color: '#777777',
              weight: 'bold',
              wrap: true,
              align: 'center',
            },
          ],
        },
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
          margin: 'md',
        },
        // Separator
        {
          type: 'separator',
          margin: 'xl',
        },
        // Button box
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            // Primary button: "対局結果を見る"
            {
              type: 'button',
              action: {
                type: 'uri',
                label: '\u5BFE\u5C40\u7D50\u679C\u3092\u898B\u308B',
                uri: permalinkUrl,
              },
              style: 'primary',
              color: '#06C755',
            },
            // Link button: "新しく対局する ● vs ○"
            {
              type: 'button',
              action: {
                type: 'uri',
                label:
                  '\u65B0\u3057\u304F\u5BFE\u5C40\u3059\u308B \u25CF vs \u25CB',
                uri: homeUrl,
              },
              style: 'link',
              color: '#06C755',
            },
            // AI challenge text
            {
              type: 'text',
              text: 'AI\u306B\u52DD\u3066\u308B\u304B\u306A\uFF1F',
              size: 'sm',
              align: 'center',
              color: '#888888',
            },
          ],
          margin: 'xl',
          spacing: 'xs',
        },
      ],
      paddingAll: 'lg',
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        // Separator
        {
          type: 'separator',
          color: '#f0f0f0',
        },
        // Branding box
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            // App icon
            {
              type: 'image',
              url: APP_ICON_URL,
              flex: 1,
              gravity: 'center',
              size: 'xxs',
              aspectMode: 'fit',
            },
            // App name
            {
              type: 'text',
              text: '\u304B\u3093\u305F\u3093\u30EA\u30D0\u30FC\u30B7',
              flex: 19,
              size: 'xs',
              color: '#999999',
              weight: 'bold',
              gravity: 'center',
              wrap: false,
            },
            // Arrow icon with action
            {
              type: 'image',
              url: ARROW_ICON_URL,
              flex: 1,
              gravity: 'center',
              size: 'xxs',
              action: {
                type: 'uri',
                label: 'action',
                uri: homeUrl,
              },
              aspectMode: 'fit',
            },
          ],
          flex: 1,
          spacing: 'md',
        },
      ],
      spacing: 'md',
    },
  };

  // Build alt text
  const altText = `\u30EA\u30D0\u30FC\u30B7\u5BFE\u5C40\u7D50\u679C: \u9ED2 ${blackCount} - \u767D ${whiteCount}`;

  return {
    type: 'flex',
    altText,
    contents: bubble,
  };
}
