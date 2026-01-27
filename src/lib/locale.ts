/**
 * Central locale configuration.
 * Single source of truth for supported languages.
 */

import languagesJson from "./languages.json";

export type Locale = keyof typeof languagesJson;
export type LanguageInfo = (typeof languagesJson)[Locale];

export const languages = languagesJson as Record<Locale, LanguageInfo>;
export const SUPPORTED_LOCALES = Object.keys(languages) as Locale[];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Check if a string is a valid supported locale.
 */
export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in languages;
}
