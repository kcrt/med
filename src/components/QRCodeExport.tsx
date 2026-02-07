"use client";

import { Box, Modal, Stack, Text } from "@mantine/core";
import { IconQrcode } from "@tabler/icons-react";
import { useLocale, useTranslations, useMessages } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { buildHumanReadableData } from "@/lib/calculation-export";
import type { FormulaInputValues, FormulaOutputValues } from "@/lib/formula";
import { isCalculationFormula } from "@/lib/formula";
import type { Formula } from "@/types/formula";

interface QRCodeExportProps {
  formula: Formula;
  formulaId: string;
  inputValues: FormulaInputValues;
  outputResults: FormulaOutputValues;
}

export function QRCodeExport({
  formula,
  formulaId,
  inputValues,
  outputResults,
}: QRCodeExportProps) {
  const [opened, setOpened] = useState(false);
  const t = useTranslations("qrcode");
  const locale = useLocale();
  const messages = useMessages();

  const isCalculation = isCalculationFormula(formula);
  const hasInputs = Object.keys(inputValues).length > 0;
  const hasResults = Object.keys(outputResults).length > 0;
  const isDisabled = !isCalculation || !hasInputs || !hasResults;

  const qrDataString = isDisabled
    ? ""
    : buildHumanReadableData(
        formula,
        formulaId,
        inputValues,
        outputResults,
        locale,
        messages,
      );

  return (
    <>
      <FloatingActionButton
        icon={<IconQrcode size={28} />}
        onClick={() => setOpened(true)}
        ariaLabel={t("buttonLabel")}
        right={20}
        disabled={isDisabled}
        tooltip={
          isDisabled
            ? t("disabledTooltip", { defaultValue: "Enter inputs to enable" })
            : t("buttonLabel")
        }
        tooltipPosition="top"
      />

      {/* QR Code Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t("title")}
        centered
        size="md"
      >
        <Stack gap="md" align="center">
          <Text size="sm" c="dimmed" ta="center">
            {t("description")}
          </Text>

          {/* QR Code */}
          <Box
            style={{
              padding: "20px",
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            <QRCodeSVG
              value={qrDataString}
              size={256}
              level="M"
              includeMargin={false}
            />
          </Box>

          {/* Optional: Show formula name */}
          <Text size="sm" fw={500} ta="center">
            {formula.name ?? formulaId}
          </Text>
        </Stack>
      </Modal>
    </>
  );
}
