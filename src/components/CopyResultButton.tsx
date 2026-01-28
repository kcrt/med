"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
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
  const locale = useLocale();

  const isCalculation = isCalculationFormula(formula);
  const hasInputs = Object.keys(inputValues).length > 0;
  const hasResults = Object.keys(outputResults).length > 0;
  const isDisabled = !isCalculation || !hasInputs || !hasResults;

  const handleCopy = async () => {
    if (isDisabled) return;
    try {
      const dataString = buildHumanReadableData(
        formula,
        formulaId,
        inputValues,
        outputResults,
        locale,
      );
      await navigator.clipboard.writeText(dataString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getTooltipLabel = () => {
    if (isDisabled) {
      return t("disabledTooltip", { defaultValue: "Enter inputs to enable" });
    }
    return copied ? t("copied") : t("buttonLabel");
  };

  return (
    <Tooltip label={getTooltipLabel()} position="left">
      <ActionIcon
        variant="light"
        color={copied ? "teal" : "blue"}
        disabled={isDisabled}
        onClick={handleCopy}
        aria-label={t("buttonLabel")}
      >
        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
      </ActionIcon>
    </Tooltip>
  );
}
