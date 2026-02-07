"use client";

import { Tooltip, type TooltipProps } from "@mantine/core";

/**
 * Debug-only tooltip with yellow-black striped border.
 * Only renders when debug mode is enabled.
 */
export function DebugTooltip({
  children,
  ...props
}: TooltipProps & { children: React.ReactNode }) {
  return (
    <Tooltip
      {...props}
      styles={{
        tooltip: {
          background: "#ffffff",
          color: "#000000",
          border: "4px solid",
          borderImage: "repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #000000 10px, #000000 20px) 4",
        },
      }}
    >
      {children}
    </Tooltip>
  );
}
