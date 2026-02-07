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
      let displayValue: string | number = value;

      // Convert value based on input type
      switch (inputDef.type) {
        case "onoff":
          // Display as Yes/No instead of 1/0
          // Treat 1 as Yes, all other values (0, null, undefined) as No
          displayValue = value === 1 ? "Yes" : "No";
          break;
        case "sex":
          // Display as Male/Female instead of 1/0
          // Treat 1 as Male, all other values (0, null, undefined) as Female
          displayValue = value === 1 ? "Male" : "Female";
          break;
        case "select": {
          // Display the option label instead of the value
          const selectedOption = inputDef.options?.find(
            (opt) => opt.value === value,
          );
          if (selectedOption) {
            displayValue = selectedOption.label;
          }
          // If no matching option found, keep the original value
          break;
        }
        // For other types (float, int, string, date), keep the original value
        default:
          displayValue = value;
      }

      lines.push(`${inputDef.label}: ${displayValue}`);
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
