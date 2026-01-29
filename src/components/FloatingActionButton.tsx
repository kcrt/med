"use client";

import { ActionIcon, type ActionIconProps, Box } from "@mantine/core";
import { type ReactNode } from "react";

interface FloatingActionButtonProps {
  /** Icon to display in the button */
  icon: ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Aria label for accessibility */
  ariaLabel: string;
  /** Position from bottom in pixels (default: 20) */
  bottom?: number;
  /** Position from right in pixels (default: undefined means not set) */
  right?: number;
  /** Position from left in pixels (default: undefined means not set) */
  left?: number;
  /** Whether button is disabled (default: false) */
  disabled?: boolean;
  /** Size of the button (default: 56) */
  size?: number;
  /** Color of the button (default: "blue") */
  color?: ActionIconProps["color"];
}

/**
 * Reusable floating action button component with hover effects.
 * Provides consistent styling and behavior for floating buttons across the app.
 *
 * @example
 * ```tsx
 * <FloatingActionButton
 *   icon={<IconShare3 size={28} />}
 *   onClick={handleShare}
 *   ariaLabel="Share"
 *   right={90}
 * />
 * ```
 */
export function FloatingActionButton({
  icon,
  onClick,
  ariaLabel,
  bottom = 20,
  right,
  left,
  disabled = false,
  size = 56,
  color = "blue",
}: FloatingActionButtonProps) {
  return (
    <Box
      style={{
        position: "fixed",
        bottom: `${bottom}px`,
        ...(right !== undefined ? { right: `${right}px` } : {}),
        ...(left !== undefined ? { left: `${left}px` } : {}),
        zIndex: 100,
      }}
    >
      <ActionIcon
        size={size}
        radius="xl"
        variant="filled"
        color={color}
        disabled={disabled}
        onClick={() => !disabled && onClick()}
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        }}
        aria-label={ariaLabel}
      >
        {icon}
      </ActionIcon>
    </Box>
  );
}
