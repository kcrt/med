import { getRequestConfig } from "next-intl/server";
import { sharedMessages } from "./messages/shared";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !["en", "ja"].includes(locale)) {
    locale = "en";
  }

  const localeMessages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages: deepMerge(sharedMessages, localeMessages),
  };
});

/**
 * Deep merge two objects. The `overrides` take precedence over `base`.
 */
function deepMerge<T extends Record<string, unknown>>(
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
