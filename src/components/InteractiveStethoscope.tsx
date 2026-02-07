"use client";

import { ThemeIcon } from "@mantine/core";
import { IconStethoscope } from "@tabler/icons-react";
import { useState, useRef, useCallback } from "react";
import { SparkleEffect } from "./SparkleEffect";
import { useDebugMode } from "@/contexts/DebugModeContext";

/**
 * Interactive stethoscope icon that activates DEV MODE when clicked 10 times.
 *
 * Features:
 * - Click counter resets after 2 seconds of inactivity
 * - Visual feedback with scale animation during clicking
 * - Sparkle effect when DEV MODE is activated
 */
export function InteractiveStethoscope() {
  const [clickCount, setClickCount] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { setDebugMode, isDebug } = useDebugMode();

  const handleClick = useCallback(() => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newCount >= 10) {
      // Activate DEV MODE
      setDebugMode(true);
      setClickCount(0);
      setShowSparkle(true);
    } else {
      // Set new timeout to reset counter
      timeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }
  }, [clickCount, setDebugMode]);

  const handleSparkleComplete = useCallback(() => {
    setShowSparkle(false);
  }, []);

  // Scale increases quadratically with each click (x² style)
  const scale = 1 + Math.pow(Math.min(clickCount, 9) / 9, 2) * 2.7;

  return (
    <ThemeIcon
      size={64}
      radius="xl"
      color={isDebug ? "yellow" : "blue"}
      onClick={handleClick}
      style={{
        transform: `scale(${scale})`,
        transition: "transform 0.1s",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <IconStethoscope size={32} color={isDebug ? "black" : "white"} />
      {showSparkle && <SparkleEffect show={true} onComplete={handleSparkleComplete} />}
    </ThemeIcon>
  );
}
