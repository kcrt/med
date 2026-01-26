"use client";

import { useTranslations, useLocale, useMessages } from "next-intl";
import { getFormula, getMenuItems, type CategoryMenuItem } from "./formula";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";

/**
 * Placeholder used to escape dots in translation keys.
 * next-intl treats dots as path separators, so we replace them with this safe placeholder.
 */
const DOT_PLACEHOLDER = "{{dot}}";

/**
 * Escape dots in translation keys to avoid next-intl's dot-splitting behavior.
 * next-intl treats dots as path separators, so we replace them with a placeholder.
 */
function escapeTranslationKey(key: string): string {
  return key.replace(/\./g, DOT_PLACEHOLDER);
}

/**
 * Helper function to safely get translation for keys that may contain dots.
 * next-intl interprets dots as path separators, but we're using English text as keys.
 * This function escapes dots before lookup to avoid path parsing errors.
 */
function getTranslationDirect(
  labels: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!labels) {
    return undefined;
  }
  
  // Escape dots in the key before lookup
  const escapedKey = escapeTranslationKey(key);
  
  // Direct property access with escaped key
  const value = labels[escapedKey];
  return typeof value === "string" ? value : undefined;
}

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
  
  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;
  
  // Get translation directly to handle keys with dots
  const translated = getTranslationDirect(labels, englishName);
  if (translated) {
    return translated;
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
  
  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;
  
  // Get translation directly to handle keys with dots
  const translated = getTranslationDirect(labels, englishLabel);
  if (translated) {
    return translated;
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
  
  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;
  
  // Get translation directly to handle keys with dots
  const translated = getTranslationDirect(labels, englishLabel);
  if (translated) {
    return translated;
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
  
  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;
  
  // Get translation directly to handle keys with dots
  const translated = getTranslationDirect(labels, englishText);
  if (translated) {
    return translated;
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
  
  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;
  
  // Map through menu items and translate labels
  return menuItems.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      // Use the English label as the translation key
      const englishLabel = item.label;
      
      // Get translation directly to handle keys with dots
      const translated = getTranslationDirect(labels, englishLabel);
      if (translated) {
        return {
          ...item,
          label: translated,
        };
      }
      
      return item;
    }),
  }));
}
