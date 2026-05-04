/**
 * Utility for measuring text pixel width using Canvas API
 */

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;

/**
 * Google SERP font specifications
 * Google uses Arial for rendering search results
 */
export const SERP_FONTS = {
  title: '20px Arial, sans-serif',
  description: '14px Arial, sans-serif',
} as const;

/**
 * Measures the pixel width of text using the specified font
 * @param text - The text to measure
 * @param font - CSS font specification (e.g., "20px Arial, sans-serif")
 * @returns The width in pixels
 */
export function measureTextWidth(text: string, font: string = SERP_FONTS.description): number {
  // Return 0 for empty text
  if (!text) return 0;

  // Initialize canvas and context if not already done (browser environment only)
  if (typeof window === 'undefined') return 0;

  if (!canvas) {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
  }

  if (!context) return 0;

  // Set font and measure
  context.font = font;
  const metrics = context.measureText(text);

  return Math.ceil(metrics.width);
}

/**
 * Resets the cached canvas context (useful for testing)
 */
export function resetCanvas(): void {
  canvas = null;
  context = null;
}
