import { useState } from "react";

/**
 * Custom hook for clipboard operations with visual feedback.
 *
 * Provides a simple interface for copying text to the clipboard
 * with automatic state management for showing "copied" feedback.
 *
 * Uses the modern Clipboard API with fallback to legacy methods
 * for older browsers or contexts where the API is unavailable.
 *
 * @param resetDelay - Time in milliseconds before resetting copied state (default: 2000)
 * @returns Object with copied state and copy function
 *
 * @example
 * ```tsx
 * const { copied, copy } = useClipboard();
 *
 * return (
 *   <button onClick={() => copy("Hello World")}>
 *     {copied ? "Copied!" : "Copy"}
 *   </button>
 * );
 * ```
 */
export function useClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  /**
   * Fallback method using document.execCommand for browsers
   * that don't support the Clipboard API.
   */
  const fallbackCopy = (text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        resolve(successful);
      } catch (err) {
        document.body.removeChild(textarea);
        console.error("Fallback copy failed:", err);
        resolve(false);
      }
    });
  };

  const copy = async (text: string): Promise<boolean> => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
        return true;
      }
      // Fall back to legacy method
      const success = await fallbackCopy(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      }
      return success;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  };

  return { copied, copy };
}
