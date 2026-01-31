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

/**
 * Cached browser language code to locale mapping.
 * Generated once from languages.json to avoid redundant computation.
 */
let cachedBrowserLanguageMap: Record<string, Locale> | null = null;

/**
 * Get browser language code to locale mapping.
 * Automatically generated from languages.json.
 * Result is cached for performance.
 */
export function getBrowserLanguageMap(): Record<string, Locale> {
  if (cachedBrowserLanguageMap) {
    return cachedBrowserLanguageMap;
  }

  const map: Record<string, Locale> = {};
  for (const [locale, info] of Object.entries(languages)) {
    for (const code of info.browser_codes) {
      map[code] = locale as Locale;
    }
  }

  cachedBrowserLanguageMap = map;
  return map;
}

/**
 * Detect locale from browser language code.
 */
export function detectLocaleFromBrowser(browserLang: string): Locale {
  const map = getBrowserLanguageMap();
  // Try exact match first
  if (map[browserLang]) {
    return map[browserLang];
  }
  // Try first part (e.g., "en-US" -> "en")
  const langPrefix = browserLang.split("-")[0];
  if (map[langPrefix]) {
    return map[langPrefix];
  }
  return DEFAULT_LOCALE;
}
