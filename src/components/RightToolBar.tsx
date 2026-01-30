"use client";

import { Badge, Group } from "@mantine/core";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface RightToolBarProps {
  isDebug: boolean;
}

export function RightToolBar({ isDebug }: RightToolBarProps) {
  return (
    <div className={isDebug ? "dev-mode-toolbar" : "right-toolbar"}>
      <LanguageSwitcher />
      {isDebug && (
        <Badge color="red" size="lg" radius="sm">
          DEV MODE
        </Badge>
      )}
    </div>
  );
}
