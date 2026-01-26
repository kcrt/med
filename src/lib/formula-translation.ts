"use client";

import { useTranslations, useLocale } from "next-intl";
import { getFormula, getMenuItems, type CategoryMenuItem } from "./formula";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";

/**
 * Get translated label for a formula name.
 * Uses the English name as the translation key under "labels" namespace.
 * Falls back to English name if translation doesn't exist.
 */
export function useFormulaName(formulaId: string, formula: Formula): string {
  const locale = useLocale();
  const englishName = formula.name ?? formulaId;
  
  // For English, no translation needed
  if (locale === "en") {
    return englishName;
  }
  
  const t = useTranslations("labels");
  
  // Try to get translation using English name as key
  try {
    const translated = t(englishName);
    // Check if translation exists (next-intl returns the key if translation doesn't exist)
    if (translated && translated !== englishName) {
      return translated;
    }
  } catch {
    // Translation not found, use English
  }
  
  return englishName;
}

/**
 * Get translated label for a formula input field.
 * Uses the English label as the translation key under "labels" namespace.
 * Falls back to English label if translation doesn't exist.
 */
export function useInputLabel(
  formulaId: string,
  inputKey: string,
  input: FormulaInput,
): string {
  const locale = useLocale();
  const englishLabel = input.label ?? inputKey;
  
  // For English, no translation needed
  if (locale === "en") {
    return englishLabel;
  }
  
  const t = useTranslations("labels");
  
  // Try to get translation using English label as key
  try {
    const translated = t(englishLabel);
    if (translated && translated !== englishLabel) {
      return translated;
    }
  } catch {
    // Translation not found, use English
  }
  
  return englishLabel;
}

/**
 * Get translated label for a formula output field.
 * Uses the English label as the translation key under "labels" namespace.
 * Falls back to English label if translation doesn't exist.
 */
export function useOutputLabel(
  formulaId: string,
  outputKey: string,
  output: FormulaOutput,
): string {
  const locale = useLocale();
  const englishLabel = output.label ?? outputKey;
  
  // For English, no translation needed
  if (locale === "en") {
    return englishLabel;
  }
  
  const t = useTranslations("labels");
  
  // Try to get translation using English label as key
  try {
    const translated = t(englishLabel);
    if (translated && translated !== englishLabel) {
      return translated;
    }
  } catch {
    // Translation not found, use English
  }
  
  return englishLabel;
}

/**
 * Get translated text for a formula output field.
 * Uses the English text as the translation key under "labels" namespace.
 * Falls back to English text if translation doesn't exist.
 */
export function useOutputText(
  formulaId: string,
  outputKey: string,
  output: FormulaOutput,
): string | undefined {
  if (!("text" in output) || !output.text) return undefined;
  
  const locale = useLocale();
  const englishText = output.text;
  
  // For English, no translation needed
  if (locale === "en") {
    return englishText;
  }
  
  const t = useTranslations("labels");
  
  // Try to get translation using English text as key
  try {
    const translated = t(englishText);
    if (translated && translated !== englishText) {
      return translated;
    }
  } catch {
    // Translation not found, use English
  }
  
  return englishText;
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
  const locale = useLocale();
  
  // For English, no translation needed
  if (locale === "en") {
    return menuItems;
  }
  
  const t = useTranslations("labels");
  
  // Map through menu items and translate labels
  return menuItems.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      // Use the English label as the translation key
      const englishLabel = item.label;
      try {
        const translated = t(englishLabel);
        // Check if translation exists
        if (translated && translated !== englishLabel) {
          return {
            ...item,
            label: translated,
          };
        }
      } catch {
        // Translation not found, use English
      }
      return item;
    }),
  }));
}
