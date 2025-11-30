/**
 * Flex Message type definitions for LIFF shareTargetPicker
 *
 * These types are compatible with @line/liff shareTargetPicker API
 * which uses @line/bot-sdk types internally.
 *
 * Note: Actions in LIFF shareTargetPicker must be URI actions with labels.
 */

/**
 * URI Action for Flex Message buttons
 */
export interface URIAction {
  readonly type: 'uri';
  readonly label: string;
  readonly uri: string;
}

/**
 * Flex Text component
 */
export interface FlexText {
  readonly type: 'text';
  readonly text: string;
  readonly size?:
    | 'xxs'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'xxl'
    | '3xl'
    | '4xl'
    | '5xl';
  readonly weight?: 'regular' | 'bold';
  readonly color?: string;
  readonly align?: 'start' | 'end' | 'center';
  readonly flex?: number;
  readonly margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly wrap?: boolean;
}

/**
 * Flex Image component
 */
export interface FlexImage {
  readonly type: 'image';
  readonly url: string;
  readonly size?:
    | 'xxs'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | 'xxl'
    | '3xl'
    | '4xl'
    | '5xl'
    | 'full';
  readonly aspectRatio?: string;
  readonly aspectMode?: 'cover' | 'fit';
  readonly flex?: number;
}

/**
 * Flex Separator component
 */
export interface FlexSeparator {
  readonly type: 'separator';
  readonly margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly color?: string;
}

/**
 * Flex Button component
 */
export interface FlexButton {
  readonly type: 'button';
  readonly action: URIAction;
  readonly style?: 'primary' | 'secondary' | 'link';
  readonly color?: string;
  readonly height?: 'sm' | 'md';
  readonly flex?: number;
  readonly margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

/**
 * Flex component union type
 */
export type FlexComponent =
  | FlexText
  | FlexImage
  | FlexSeparator
  | FlexButton
  | FlexBox;

/**
 * Flex Box component
 */
export interface FlexBox {
  readonly type: 'box';
  readonly layout: 'horizontal' | 'vertical' | 'baseline';
  readonly contents: FlexComponent[];
  readonly flex?: number;
  readonly spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly paddingAll?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly paddingTop?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly paddingBottom?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly paddingStart?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly paddingEnd?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly backgroundColor?: string;
  readonly cornerRadius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  readonly alignItems?: 'flex-start' | 'center' | 'flex-end';
}

/**
 * Flex Bubble container
 */
export interface FlexBubble {
  readonly type: 'bubble';
  readonly hero?: FlexImage;
  readonly body?: FlexBox;
  readonly footer?: FlexBox;
  readonly action?: URIAction;
}

/**
 * Flex Message for LIFF shareTargetPicker
 */
export interface FlexMessage {
  readonly type: 'flex';
  readonly altText: string;
  readonly contents: FlexBubble;
}
