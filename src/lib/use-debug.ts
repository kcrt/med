import { useState, useEffect } from "react";

/**
 * Hook to detect if the app is running in debug mode
 * Checks if window.location.hostname contains "localhost"
 */
export function useDebug(): boolean {
  const [isDebug, setIsDebug] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      setIsDebug(window.location.hostname.includes("localhost"));
    }
  }, []);

  return isDebug;
}
