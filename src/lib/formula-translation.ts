"use client";

import { useTranslations } from "next-intl";
import { getFormula, getMenuItems, type CategoryMenuItem } from "./formula";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";

/**
 * Get translated label for a formula name.
 * Falls back to English name if translation doesn't exist.
 */
export function useFormulaName(formulaId: string, formula: Formula): string {
  const t = useTranslations(`formulas.${formulaId}`);
  const translated = t("name");
  // Check if translation exists (next-intl returns the key if translation doesn't exist)
  if (translated && translated !== "name" && !translated.startsWith("formulas.")) {
    return translated;
  }
  return formula.name ?? formulaId;
}

/**
 * Get translated label for a formula input field.
 * Falls back to English label if translation doesn't exist.
 */
export function useInputLabel(
  formulaId: string,
  inputKey: string,
  input: FormulaInput,
): string {
  const t = useTranslations(`formulas.${formulaId}.input.${inputKey}`);
  const translated = t("label");
  // Check if translation exists
  if (translated && translated !== "label" && !translated.startsWith("formulas.")) {
    return translated;
  }
  return input.label ?? inputKey;
}

/**
 * Get translated label for a formula output field.
 * Falls back to English label if translation doesn't exist.
 */
export function useOutputLabel(
  formulaId: string,
  outputKey: string,
  output: FormulaOutput,
): string {
  const t = useTranslations(`formulas.${formulaId}.output.${outputKey}`);
  const translated = t("label");
  // Check if translation exists
  if (translated && translated !== "label" && !translated.startsWith("formulas.")) {
    return translated;
  }
  return output.label ?? outputKey;
}

/**
 * Get translated text for a formula output field.
 * Falls back to English text if translation doesn't exist.
 */
export function useOutputText(
  formulaId: string,
  outputKey: string,
  output: FormulaOutput,
): string | undefined {
  if (!("text" in output) || !output.text) return undefined;
  
  const t = useTranslations(`formulas.${formulaId}.output.${outputKey}`);
  const translated = t("text");
  // Check if translation exists
  if (translated && translated !== "text" && !translated.startsWith("formulas.")) {
    return translated;
  }
  return output.text;
}

/**
 * Get translated formula with all labels translated.
 * This is a convenience hook that returns a formula with translated labels.
 */
export function useTranslatedFormula(formulaId: string): Formula | undefined {
  const formula = getFormula(formulaId);
  // Note: This returns the base formula structure.
  // Use the individual translation hooks (useFormulaName, useInputLabel, etc.)
  // in your components to get translated labels.
  return formula;
}

/**
 * Get menu items with translated labels.
 * Returns menu structure where labels are translated using next-intl.
 */
export function useTranslatedMenuItems(): CategoryMenuItem[] {
  const menuItems = getMenuItems();
  const t = useTranslations("formulas");
  
  // Map through menu items and translate labels
  return menuItems.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      // Extract formula ID from path
      const formulaId = item.path.replace("/formula/", "");
      const translatedName = t(`${formulaId}.name`);
      // Check if translation exists (not just the key being returned)
      if (translatedName && !translatedName.includes(".name") && !translatedName.startsWith("formulas.")) {
        return {
          ...item,
          label: translatedName,
        };
      }
      return item;
    }),
  }));
}
