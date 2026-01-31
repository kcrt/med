import type {
  CalculationFormula,
  FormulaInputValues,
  FormulaOutputValues,
} from "@/lib/formula";
import {
  hasFormulaProperty,
  shouldDisplayOutputForLocale,
} from "@/lib/formula";

/**
 * Build human-readable calculation result string
 * Used for QR code export and copy result functionality
 */
export function buildHumanReadableData(
  formula: CalculationFormula,
  formulaId: string,
  inputValues: FormulaInputValues,
  outputResults: FormulaOutputValues,
  locale?: string,
): string {
  const lines: string[] = [];

  // Add formula name
  lines.push(formula.name ?? formulaId);
  lines.push("");

  // Add inputs
  for (const [key, value] of Object.entries(inputValues)) {
    const inputDef = formula.input[key];
    if (inputDef) {
      lines.push(`${inputDef.label}: ${value}`);
    }
  }

  lines.push("");

  // Add outputs (filtered by locale if specified)
  for (const [key, value] of Object.entries(outputResults)) {
    const outputDef = formula.output[key];
    if (outputDef && hasFormulaProperty(outputDef)) {
      // Skip if locale is specified and output should not be displayed for this locale
      if (locale && !shouldDisplayOutputForLocale(outputDef, locale)) {
        continue;
      }
      const unit = outputDef.unit ? ` ${outputDef.unit}` : "";
      lines.push(`${outputDef.label}: ${value}${unit}`);
    }
  }

  return lines.join("\n");
}
