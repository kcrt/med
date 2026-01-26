"use client";

import { ActionIcon, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { isCalculationFormula } from "@/lib/formula";
import { buildHumanReadableData } from "@/lib/calculation-export";
import type { Formula } from "@/types/formula";
import type { FormulaInputValues, FormulaOutputValues } from "@/lib/formula";

interface CopyResultButtonProps {
  formula: Formula;
  formulaId: string;
  inputValues: FormulaInputValues;
  outputResults: FormulaOutputValues;
}

export function CopyResultButton({
  formula,
  formulaId,
  inputValues,
  outputResults,
}: CopyResultButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("copyResult");

  // Only show copy button for calculation formulas with valid inputs and results
  if (!isCalculationFormula(formula)) {
    return null;
  }

  const hasInputs = Object.keys(inputValues).length > 0;
  const hasResults = Object.keys(outputResults).length > 0;

  if (!hasInputs || !hasResults) {
    return null;
  }

  const handleCopy = async () => {
    try {
      const dataString = buildHumanReadableData(
        formula,
        formulaId,
        inputValues,
        outputResults,
      );
      await navigator.clipboard.writeText(dataString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Tooltip label={copied ? t("copied") : t("buttonLabel")} position="left">
      <ActionIcon
        variant="light"
        color={copied ? "teal" : "blue"}
        onClick={handleCopy}
        aria-label={t("buttonLabel")}
      >
        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
