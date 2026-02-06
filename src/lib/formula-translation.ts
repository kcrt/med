"use client";

import { useLocale, useMessages } from "next-intl";
import { getMenuItems, type CategoryMenuItem } from "./formula";
import type { Formula, FormulaInput, FormulaOutput } from "@/types/formula";
import { DEFAULT_LOCALE } from "./locale";
import {
  escapeTranslationKey,
  getTranslationDirect,
} from "./translation-utils";

type MessageNamespace = "labels" | "category" | "formula_info" | "formula_metadata";

/**
 * Core translation helper. Returns translation from a message namespace or falls back to English.
 */
function useMessageTranslation(
  namespace: MessageNamespace,
  englishValue: string,
  options?: { escapeKey?: boolean; customKey?: string },
): string {
  const locale = useLocale();

  if (locale === DEFAULT_LOCALE) {
    return englishValue;
  }

  const messages = useMessages();
  const section = messages[namespace] as Record<string, unknown> | undefined;
  const key = options?.customKey ?? englishValue;
  const finalKey = options?.escapeKey ? escapeTranslationKey(key) : key;

  return getTranslationDirect(section, finalKey) ?? englishValue;
}

/**
 * Get translated label for a formula name.
 * Uses the English name as the translation key under "labels" namespace.
 * Falls back to English name if translation doesn't exist.
 */
export function useFormulaName(formulaId: string, formula: Formula): string {
  const englishName = formula.name ?? formulaId;
  return useMessageTranslation("labels", englishName, { escapeKey: true });
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
  const englishLabel = input.label ?? inputKey;
  return useMessageTranslation("labels", englishLabel, { escapeKey: true });
}

/**
 * Get translated label for a formula input option (for select inputs).
 * Uses the English label as the translation key under "labels" namespace.
 * Falls back to English label if translation doesn't exist.
 */
export function useOptionLabel(optionLabel: string): string {
  return useMessageTranslation("labels", optionLabel, { escapeKey: true });
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
  const englishLabel = output.label ?? outputKey;
  return useMessageTranslation("labels", englishLabel, { escapeKey: true });
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
  return getTranslationDirect(labels, escapedKey) ?? englishText;
}

/**
 * Get translated text for a formula info field.
 * Tries semantic key pattern in formula_info section (e.g., "bmi_adult")
 * then falls back to English text if translation not found.
 */
export function useFormulaInfo(
  formulaId: string,
  formula: Formula,
): string | undefined {
  const englishInfo = formula.info;
  if (!englishInfo) return englishInfo;

  return useMessageTranslation("formula_info", englishInfo, {
    customKey: formulaId,
  });
}

/**
 * Get translated category name.
 * Uses the English category name as the translation key under "category" namespace.
 * Falls back to English name if translation doesn't exist.
 */
export function useCategoryName(categoryName: string): string {
  return useMessageTranslation("category", categoryName);
}

/**
 * Get menu items with translated labels.
 * Returns menu structure where labels are translated using next-intl.
 * Filters formulas by locale automatically.
 */
export function useTranslatedMenuItems(): CategoryMenuItem[] {
  const locale = useLocale();
  const menuItems = getMenuItems(locale);

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
        return translated ? { ...item, label: translated } : item;
      }),
    };
  });
}

/**
 * Extended menu item with both English and translated labels for search.
 */
export interface SearchableMenuItem {
  label: string;
  path: string;
  englishLabel: string;
}

export interface SearchableCategoryMenuItem {
  label: string;
  path: string;
  englishLabel: string;
  items: SearchableMenuItem[];
}

/**
 * Get menu items with both English and translated labels for search functionality.
 * This allows searching in both English and the current language.
 * Filters formulas by locale automatically.
 */
export function useSearchableMenuItems(): SearchableCategoryMenuItem[] {
  const locale = useLocale();
  const menuItems = getMenuItems(locale);
  const messages = useMessages();
  const labels = messages.labels as Record<string, unknown> | undefined;
  const categories = messages.category as Record<string, unknown> | undefined;

  // Map through menu items and add both English and translated labels
  return menuItems.map((category) => {
    const categoryLabel = category.label;
    const translatedCategoryLabel =
      locale !== DEFAULT_LOCALE
        ? getTranslationDirect(categories, categoryLabel)
        : null;

    return {
      path: category.path,
      label: translatedCategoryLabel ?? categoryLabel,
      englishLabel: categoryLabel,
      items: category.items.map((item) => {
        const englishLabel = item.label;

        // Use escapeTranslationKey for consistency with useTranslatedMenuItems
        const escapedKey = escapeTranslationKey(englishLabel);
        const translated =
          locale !== DEFAULT_LOCALE
            ? getTranslationDirect(labels, escapedKey)
            : null;

        return {
          path: item.path,
          label: translated ?? englishLabel,
          englishLabel: englishLabel,
        };
      }),
    };
  });
}

/**
 * Get translated formula metadata (obsolete, caution, recommended).
 * Tries semantic key pattern in formula_metadata section (e.g., "bmi_for_age_obsolete")
 * then falls back to English text if translation not found.
 */
export function useFormulaMetadata(
  formulaId: string,
  metadataKey: "obsolete" | "caution" | "recommended",
  englishValue?: string,
): string | undefined {
  if (!englishValue) return undefined;

  return useMessageTranslation("formula_metadata", englishValue, {
    customKey: `${formulaId}_${metadataKey}`,
  });
}
