import { DEFAULT_LOCALE } from "./locale";

/**
 * Shared utility functions for translation and message handling.
 * Used by both client-side (formula-translation.ts) and server-side (API routes) code.
 */

/**
 * Placeholder used to escape dots in translation keys.
 * next-intl treats dots as path separators, so we replace them with this safe placeholder.
 */
export const DOT_PLACEHOLDER = "{{dot}}";

/**
 * Escape dots in translation keys to avoid next-intl's dot-splitting behavior.
 *
 * @param key - The translation key that may contain dots
 * @returns The escaped key with dots replaced by placeholder
 */
export function escapeTranslationKey(key: string): string {
  return key.replace(/\./g, DOT_PLACEHOLDER);
}

/**
 * Get translated label without hooks.
 * Works in any context - components, utilities, API routes, tests.
 *
 * @param messages - The messages object from useMessages() or getMessages()
 * @param locale - The current locale (e.g., "ja", "zh-Hans")
 * @param englishLabel - The English label to translate (used as key)
 * @returns The translated label, or English if no translation found or locale is default
 */
export function getLabelTranslation(
  messages: Record<string, unknown> | undefined,
  locale: string,
  englishLabel: string,
): string {
  if (locale === DEFAULT_LOCALE || !messages) {
    return englishLabel;
  }

  const labels = messages.labels as Record<string, unknown> | undefined;
  const escapedKey = escapeTranslationKey(englishLabel);
  return getTranslationDirect(labels, escapedKey) ?? englishLabel;
}

/**
 * Get translated formula name without hooks.
 * Uses the English formula name as the translation key (same pattern as useFormulaName).
 *
 * @param messages - The messages object from useMessages() or getMessages()
 * @param locale - The current locale
 * @param formulaId - The formula ID (unused in key lookup, kept for consistency)
 * @param englishName - The English formula name used as translation key
 * @returns The translated formula name, or English if no translation found
 */
export function getFormulaNameTranslation(
  messages: Record<string, unknown> | undefined,
  locale: string,
  _formulaId: string,
  englishName: string,
): string {
  return getLabelTranslation(messages, locale, englishName);
}

/**
 * Get translated option label (for select inputs) without hooks.
 *
 * @param messages - The messages object from useMessages() or getMessages()
 * @param locale - The current locale
 * @param englishLabel - The English option label to translate
 * @returns The translated option label, or English if no translation found
 */
export function getOptionTranslation(
  messages: Record<string, unknown> | undefined,
  locale: string,
  englishLabel: string,
): string {
  return getLabelTranslation(messages, locale, englishLabel);
}

/**
 * Deep merge two objects. The `overrides` take precedence over `base`.
 *
 * @param base - The base object
 * @param overrides - The overrides to apply
 * @returns The merged object
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<Record<keyof T, unknown>>,
): T {
  const result = { ...base };

  for (const key in overrides) {
    if (Object.hasOwn(overrides, key)) {
      const baseValue = result[key];
      const overrideValue = overrides[key];

      if (
        typeof baseValue === "object" &&
        baseValue !== null &&
        !Array.isArray(baseValue) &&
        typeof overrideValue === "object" &&
        overrideValue !== null &&
        !Array.isArray(overrideValue)
      ) {
        result[key] = deepMerge(
          baseValue as Record<string, unknown>,
          overrideValue as Record<string, unknown>,
        ) as T[typeof key];
      } else {
        result[key] = overrideValue as T[typeof key];
      }
    }
  }

  return result;
}

/**
 * Helper function to safely get translation from the labels namespace.
 * Tries the given key directly without any path interpretation.
 *
 * @param labels - The labels object from messages
 * @param key - The escaped translation key
 * @returns The translated string if found, undefined otherwise (labels[key] or undefined)
 */
export function getTranslationDirect(
  labels: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  if (!labels) {
    return undefined;
  }

  const value = labels[key];
  return typeof value === "string" ? value : undefined;
}
