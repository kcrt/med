"use client";

import { Box } from "@mantine/core";
import { useEffect, useState } from "react";

interface SparkleEffectProps {
  /** Whether to show the sparkle effect */
  show: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * Lightweight sparkle/confetti effect using pure CSS animations.
 * Displays small gold particles bursting from the center.
 */
export function SparkleEffect({ show, onComplete }: SparkleEffectProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  // Create 8 particles positioned radially
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 360) / 8;
    const radian = (angle * Math.PI) / 180;
    const distance = 20; // pixels to travel
    const endX = Math.cos(radian) * distance;
    const endY = Math.sin(radian) * distance;
    return { angle, endX, endY };
  });

  return (
    <Box
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {particles.map(({ angle }) => (
        <Box
          key={angle}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            backgroundColor: "gold",
            boxShadow: "0 0 3px gold",
            animation: `sparkle-burst-${angle} 600ms ease-out forwards`,
            left: "-2px",
            top: "-2px",
          }}
        />
      ))}
      <style>
        {particles
          .map(
            ({ angle, endX, endY }) => `
          @keyframes sparkle-burst-${angle} {
            0% {
              transform: translate(0, 0) scale(0);
              opacity: 1;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(${endX}px, ${endY}px) scale(1);
              opacity: 0;
            }
          }
        `,
          )
          .join("\n")}
      </style>
    </Box>
  );
}
