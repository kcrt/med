"use client";

import { Button, Modal, Stack, Text, TextInput } from "@mantine/core";
import { IconShare3 } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { isCalculationFormula } from "@/lib/formula";
import type { Formula } from "@/types/formula";
import { ShareButtonsGrid } from "@/components/ShareButtonsGrid";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useShareHandler } from "@/hooks/useShareHandler";
import { useClipboard } from "@/hooks/useClipboard";
import { useShareUrl } from "@/hooks/useShareUrl";
import { useAutoSelectInput } from "@/hooks/useAutoSelectInput";

interface ShareButtonProps {
  formula: Formula;
  inputValues: Record<string, number | string | boolean | Date | null>;
}

export function ShareButton({ formula, inputValues }: ShareButtonProps) {
  const [opened, setOpened] = useState(false);
  const { copied, copy } = useClipboard();
  const t = useTranslations("share");
  const tApp = useTranslations("app");
  const inputRef = useAutoSelectInput(opened);

  // Check if native share is supported
  const supportsNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  // Only show share button for calculation formulas with valid inputs
  if (!isCalculationFormula(formula)) {
    return null;
  }

  const hasInputs = Object.values(inputValues).some((value) => {
    // Consider any non-null, non-undefined value as valid input
    // This includes zero, false, and empty strings
    return value !== null && value !== undefined;
  });

  if (!hasInputs) {
    return null;
  }

  // Build shareable URL with query parameters
  const shareUrl = useShareUrl(inputValues);
  const shareTitle = `${formula.name || tApp("title")} - ${tApp("title")}`;

  const handleCopy = async () => {
    await copy(shareUrl);
  };

  const { handleNativeShare, handlePlatformShare } = useShareHandler({
    shareUrl,
    shareTitle,
    supportsNativeShare,
    onShareComplete: () => setOpened(false),
  });

  return (
    <>
      <FloatingActionButton
        icon={<IconShare3 size={28} />}
        onClick={() => setOpened(true)}
        ariaLabel={t("buttonLabel")}
        right={90}
        tooltip={t("buttonLabel")}
        tooltipPosition="top"
      />

      {/* Share URL Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t("title")}
        centered
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("description")}
          </Text>

          {/* URL Display */}
          <TextInput
            ref={inputRef}
            value={shareUrl}
            readOnly
            onClick={(e) => e.currentTarget.select()}
            styles={{
              input: {
                fontFamily: "monospace",
                fontSize: "0.875rem",
              },
            }}
          />

          {/* Copy Button */}
          <Button onClick={handleCopy} fullWidth variant="light">
            {copied ? t("copied") : t("copyButton")}
          </Button>

          {/* SNS Share Buttons */}
          <div>
            <Text size="sm" fw={500} mb="xs">
              {t("snsShare")}
            </Text>
            <ShareButtonsGrid
              shareUrl={shareUrl}
              shareTitle={shareTitle}
              supportsNativeShare={supportsNativeShare}
              onNativeShare={handleNativeShare}
              onPlatformShare={handlePlatformShare}
              nativeShareLabel={t("nativeShare")}
              getPlatformShareLabel={(platformName) =>
                t("shareOn", { platform: platformName })
              }
              tooltipPosition="bottom"
            />
          </div>
        </Stack>
      </Modal>
    </>
  );
}
