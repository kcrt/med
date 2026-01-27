"use client";

import { useTranslations, useLocale, useMessages } from "next-intl";
import { getFormula, getMenuItems, type CategoryMenuItem } from "./formula";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";
import { DEFAULT_LOCALE } from "./locale";
import {
  DOT_PLACEHOLDER,
  escapeTranslationKey,
  getTranslationDirect,
} from "./translation-utils";

/**
 * Get translated label for a formula name.
 * Uses the English name as the translation key under "labels" namespace.
 * Falls back to English name if translation doesn't exist.
 */
export function useFormulaName(formulaId: string, formula: Formula): string {
  const locale = useLocale();
  const englishName = formula.name ?? formulaId;

  // For English, no translation needed
  if (locale === DEFAULT_LOCALE) {
    return englishName;
  }

  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;

  // Try with escaped dots for backward compatibility
  const escapedKey = escapeTranslationKey(englishName);
  const translated = getTranslationDirect(labels, escapedKey);
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
  if (locale === DEFAULT_LOCALE) {
    return englishLabel;
  }

  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;

  // Try with escaped dots for backward compatibility
  const escapedKey = escapeTranslationKey(englishLabel);
  const translated = getTranslationDirect(labels, escapedKey);
  if (translated) {
    return translated;
  }

  return englishLabel;
}

/**
 * Get translated label for a formula input option (for select inputs).
 * Uses the English label as the translation key under "labels" namespace.
 * Falls back to English label if translation doesn't exist.
 */
export function useOptionLabel(optionLabel: string): string {
  const locale = useLocale();

  // For English, no translation needed
  if (locale === DEFAULT_LOCALE) {
    return optionLabel;
  }

  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;

  // Try with escaped dots for backward compatibility
  const escapedKey = escapeTranslationKey(optionLabel);
  const translated = getTranslationDirect(labels, escapedKey);
  if (translated) {
    return translated;
  }

  return optionLabel;
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
  if (locale === DEFAULT_LOCALE) {
    return englishLabel;
  }

  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;

  // Try with escaped dots for backward compatibility
  const escapedKey = escapeTranslationKey(englishLabel);
  const translated = getTranslationDirect(labels, escapedKey);
  if (translated) {
    return translated;
  }

  return englishLabel;
}

/**
 * Get translated text for a formula output field.
 * For text entries, tries semantic key first (formulaId.outputKey.text)
 * then falls back to escaped English text as key, finally to English text itself.
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
  if (locale === DEFAULT_LOCALE) {
    return englishText;
  }

  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;

  // Try semantic key first for text entries (e.g., "abcd2i_note_text")
  // This is the recommended approach for long text with multiple sentences
  const semanticKey = `${formulaId}_${outputKey}_text`;
  const semanticTranslation = getTranslationDirect(labels, semanticKey);
  if (semanticTranslation) {
    return semanticTranslation;
  }

  // Fall back to escaped English text as key (for backward compatibility)
  const escapedKey = escapeTranslationKey(englishText);
  const translated = getTranslationDirect(labels, escapedKey);
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
  if (locale === DEFAULT_LOCALE) {
    return menuItems;
  }

  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;
  const categories = messages.category as Record<string, unknown> | undefined;

  // Map through menu items and translate labels
  return menuItems.map((category) => {
    // Translate the category label itself
    const categoryLabel = category.label;
    const translatedCategoryLabel = getTranslationDirect(
      categories,
      categoryLabel,
    );

    return {
      ...category,
      label: translatedCategoryLabel ?? categoryLabel,
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
    };
  });
}
