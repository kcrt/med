import { useState } from "react";

/**
 * Custom hook for clipboard operations with visual feedback.
 *
 * Provides a simple interface for copying text to the clipboard
 * with automatic state management for showing "copied" feedback.
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

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  };

  return { copied, copy };
}
