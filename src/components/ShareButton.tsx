"use client";

import {
  ActionIcon,
  Box,
  Button,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconShare } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { isCalculationFormula } from "@/lib/formula";
import type { Formula } from "@/types/formula";

interface ShareButtonProps {
  formula: Formula;
  inputValues: Record<string, number | string | boolean | Date | null>;
}

export function ShareButton({ formula, inputValues }: ShareButtonProps) {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = useTranslations("share");

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
  const buildShareUrl = (): string => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(inputValues)) {
      if (value !== null && value !== "" && value !== undefined) {
        params.append(key, String(value));
      }
    }
    // Check if window is available (client-side only)
    if (typeof window === "undefined") {
      return "";
    }
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?${params.toString()}`;
  };

  const shareUrl = buildShareUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Box
        style={{
          position: "fixed",
          bottom: "20px",
          right: "90px",
          zIndex: 100,
        }}
      >
        <ActionIcon
          size={56}
          radius="xl"
          variant="filled"
          color="blue"
          onClick={() => setOpened(true)}
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          }}
          aria-label={t("buttonLabel")}
        >
          <IconShare size={28} />
        </ActionIcon>
      </Box>

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
          <Button onClick={handleCopy} fullWidth>
            {copied ? t("copied") : t("copyButton")}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
