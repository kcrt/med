"use client";

import { Badge } from "@mantine/core";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useDebugMode } from "@/contexts/DebugModeContext";

export function RightToolBar() {
  const { isDebug, setDebugMode } = useDebugMode();

  const handleBadgeClick = () => {
    // Switch from DEV MODE to Release mode
    setDebugMode(false);
  };

  return (
    <div className={isDebug ? "dev-mode-toolbar" : "right-toolbar"}>
      <LanguageSwitcher />
      {isDebug && (
        <Badge
          color="red"
          size="lg"
          radius="sm"
          onClick={handleBadgeClick}
          style={{ cursor: "pointer" }}
        >
          DEV MODE
        </Badge>
      )}
    </div>
  );
}
