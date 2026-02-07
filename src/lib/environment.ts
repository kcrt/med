/**
 * Browser detection utilities.
 * Provides safe client-side environment checking for SSR compatibility.
 */

/**
 * Check if code is running in a browser environment.
 * Safe for Server-Side Rendering (SSR) - returns false during server build.
 *
 * @returns true if running in a browser, false otherwise (server, build time, etc.)
 *
 * @example
 * ```ts
 * import { isBrowser } from '@/lib/environment';
 *
 * if (isBrowser()) {
 *   // Browser-only code (localStorage, navigator, window, etc.)
 *   const supportsNativeShare = 'share' in navigator;
 *   localStorage.setItem('key', 'value');
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Check if native Web Share API is supported.
 * Requires browser environment.
 *
 * @returns true if native share is supported, false otherwise
 *
 * @example
 * ```ts
 * import { doesSupportNativeShare } from '@/lib/environment';
 *
 * if (doesSupportNativeShare()) {
 *   // Use native share API
 *   navigator.share({ title, url });
 * }
 * ```
 */
export function doesSupportNativeShare(): boolean {
  return isBrowser() && "share" in navigator;
}

/**
 * Check if Clipboard API is supported.
 * Requires browser environment and secure context (HTTPS or localhost).
 *
 * @returns true if clipboard API is supported, false otherwise
 *
 * @example
 * ```ts
 * import { doesSupportClipboard } from '@/lib/environment';
 *
 * if (doesSupportClipboard()) {
 *   await navigator.clipboard.writeText(text);
 * }
 * ```
 */
export function doesSupportClipboard(): boolean {
  return isBrowser() && "clipboard" in navigator;
}
