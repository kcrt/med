import type {
  CalculationFormula,
  FormulaInputValues,
  FormulaOutputValues,
} from "@/lib/formula";
import { hasFormulaProperty } from "@/lib/formula";

/**
 * Build human-readable calculation result string
 * Used for QR code export and copy result functionality
 */
export function buildHumanReadableData(
  formula: CalculationFormula,
  formulaId: string,
  inputValues: FormulaInputValues,
  outputResults: FormulaOutputValues,
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

  // Add outputs
  for (const [key, value] of Object.entries(outputResults)) {
    const outputDef = formula.output[key];
    if (outputDef && hasFormulaProperty(outputDef)) {
      const unit = outputDef.unit ? ` ${outputDef.unit}` : "";
      lines.push(`${outputDef.label}: ${value}${unit}`);
    }
  }

  return lines.join("\n");
}
