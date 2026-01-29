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
