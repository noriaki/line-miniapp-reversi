/**
 * Type declarations for html2canvas
 *
 * These are placeholder types until html2canvas is installed in Task 9.
 * Once installed, this file can be removed as the package includes its own types.
 */

declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    /** Resolution scale (default: 1) */
    scale?: number;
    /** Use CORS for external images */
    useCORS?: boolean;
    /** Enable logging */
    logging?: boolean;
    /** Background color */
    backgroundColor?: string | null;
    /** Canvas width */
    width?: number;
    /** Canvas height */
    height?: number;
  }

  /**
   * Renders an HTML element to a canvas
   */
  export default function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
}
