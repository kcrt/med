"use client";

import { useState } from "react";
import { Modal, ActionIcon, Stack, Text, Box } from "@mantine/core";
import { IconQrcode } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";
import type { FormulaInputValues, FormulaOutputValues } from "@/lib/formula";
import { isCalculationFormula, hasFormulaProperty } from "@/lib/formula";

interface QRCodeExportProps {
  formula: Formula;
  formulaId: string;
  inputValues: FormulaInputValues;
  outputResults: FormulaOutputValues;
}

interface QRCodeData {
  formulaId: string;
  formulaName: string;
  timestamp: string;
  inputs: Record<
    string,
    { label: string; value: number | string }
  >;
  outputs: Record<
    string,
    { label: string; value: number | string; unit?: string }
  >;
}

export function QRCodeExport({
  formula,
  formulaId,
  inputValues,
  outputResults,
}: QRCodeExportProps) {
  const [opened, setOpened] = useState(false);
  const t = useTranslations("qrcode");

  // Only show QR code button for calculation formulas with valid inputs and results
  if (!isCalculationFormula(formula)) {
    return null;
  }

  const hasInputs = Object.keys(inputValues).length > 0;
  const hasResults = Object.keys(outputResults).length > 0;

  if (!hasInputs || !hasResults) {
    return null;
  }

  // Build QR code data
  const buildQRCodeData = (): QRCodeData => {
    const data: QRCodeData = {
      formulaId,
      formulaName: formula.name ?? formulaId,
      timestamp: new Date().toISOString(),
      inputs: {},
      outputs: {},
    };

    // Add input values with their labels and units
    for (const [key, value] of Object.entries(inputValues)) {
      const inputDef = formula.input[key];
      if (inputDef) {
        data.inputs[key] = {
          label: inputDef.label,
          value,
        };
      }
    }

    // Add output values with their labels and units
    for (const [key, value] of Object.entries(outputResults)) {
      const outputDef = formula.output[key];
      if (outputDef && hasFormulaProperty(outputDef)) {
        data.outputs[key] = {
          label: outputDef.label,
          value,
          unit: outputDef.unit,
        };
      }
    }

    return data;
  };

  const qrData = buildQRCodeData();
  const qrDataString = JSON.stringify(qrData, null, 2);

  return (
    <>
      {/* Floating Action Button */}
      <Box
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
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
          <IconQrcode size={28} />
        </ActionIcon>
      </Box>

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
