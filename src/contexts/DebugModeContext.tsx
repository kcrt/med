"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export const STORAGE_KEY = "med-dev-mode-override";

export interface DevModeOverride {
  enabled: boolean;
  timestamp: number;
}

interface DebugModeContextValue {
  isDebug: boolean;
  setDebugMode: (enabled: boolean) => void;
  toggleDebugMode: () => void;
}

const DebugModeContext = createContext<DebugModeContextValue | undefined>(undefined);

/**
 * Compute the initial debug state based on:
 * 1. Manual override (localStorage) - highest priority
 * 2. Hostname detection (localhost)
 * 3. Default (Release mode) - lowest priority
 */
export function computeDebugState(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const override = localStorage.getItem(STORAGE_KEY);
    if (override) {
      const { enabled } = JSON.parse(override) as DevModeOverride;
      return enabled;
    }
  } catch (error) {
    console.warn("localStorage unavailable, using hostname detection only");
  }

  return window.location.hostname.includes("localhost");
}

export function DebugModeProvider({ children }: { children: ReactNode }) {
  // Start with false to avoid hydration mismatch
  // Server and client will both start with false
  const [isDebug, setIsDebug] = useState<boolean>(false);

  // Update state after mount on client
  useEffect(() => {
    const actualState = computeDebugState();
    setIsDebug(actualState);
  }, []);

  const setDebugMode = (enabled: boolean) => {
    try {
      const override: DevModeOverride = {
        enabled,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(override));
    } catch (error) {
      console.warn("Failed to save debug mode to localStorage", error);
    }
    setIsDebug(enabled);
  };

  const toggleDebugMode = () => {
    setDebugMode(!isDebug);
  };

  // Always render the provider
  return (
    <DebugModeContext.Provider value={{ isDebug, setDebugMode, toggleDebugMode }}>
      {children}
    </DebugModeContext.Provider>
  );
}

/**
 * Hook to access debug mode state and controls
 * Throws error if used outside DebugModeProvider
 */
export function useDebugMode(): DebugModeContextValue {
  const context = useContext(DebugModeContext);
  if (context === undefined) {
    throw new Error("useDebugMode must be used within a DebugModeProvider");
  }
  return context;
}
