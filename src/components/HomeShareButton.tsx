"use client";

import {
  Box,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconShare3 } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ShareButtonsGrid } from "@/components/ShareButtonsGrid";
import { useShareHandler } from "@/hooks/useShareHandler";
import { useShareUrl } from "@/hooks/useShareUrl";

export function HomeShareButton() {
  const t = useTranslations("homeShare");
  const tApp = useTranslations("app");

  const [supportsNativeShare, setSupportsNativeShare] = useState(false);

  // Get current page URL (no input values for home page)
  const shareUrl = useShareUrl();
  const shareTitle = tApp("title");

  // Initialize client-only values after hydration
  useEffect(() => {
    setSupportsNativeShare("share" in navigator);
  }, []);

  const { handleNativeShare, handlePlatformShare } = useShareHandler({
    shareUrl,
    shareTitle,
    supportsNativeShare,
  });

  return (
    <Box
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
      }}
    >
      <Stack gap="md" align="center" ta="center">
        <Group gap="xs">
          <IconShare3 size={24} color="var(--mantine-color-blue-6)" />
          <Text fw={500} size="lg">Share this site</Text>
        </Group>

        {/* SNS Share Buttons */}
        <ShareButtonsGrid
          shareUrl={shareUrl}
          shareTitle={shareTitle}
          supportsNativeShare={supportsNativeShare}
          onNativeShare={handleNativeShare}
          onPlatformShare={handlePlatformShare}
          nativeShareLabel={t("nativeShare")}
          getPlatformShareLabel={(platformName) => t("shareOn", { platform: platformName })}
          tooltipPosition="top"
        />
      </Stack>
    </Box>
  );
}
