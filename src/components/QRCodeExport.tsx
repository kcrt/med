"use client";

import { useState } from "react";
import { Modal, Stack, Text, Box, Tooltip } from "@mantine/core";
import { IconQrcode } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations, useLocale } from "next-intl";
import type { Formula } from "@/types/formula";
import type { FormulaInputValues, FormulaOutputValues } from "@/lib/formula";
import { isCalculationFormula } from "@/lib/formula";
import { buildHumanReadableData } from "@/lib/calculation-export";
import { FloatingActionButton } from "@/components/FloatingActionButton";

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
      );

  return (
    <>
      <Tooltip
        label={
          isDisabled
            ? t("disabledTooltip", { defaultValue: "Enter inputs to enable" })
            : t("buttonLabel")
        }
        position="top"
        zIndex={101}
      >
        <div>
          <FloatingActionButton
            icon={<IconQrcode size={28} />}
            onClick={() => setOpened(true)}
            ariaLabel={t("buttonLabel")}
            right={20}
            disabled={isDisabled}
          />
        </div>
      </Tooltip>

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
