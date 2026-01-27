import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isValidLocale } from "./lib/locale";
import { deepMerge } from "./lib/translation-utils";
import { sharedMessages } from "./messages/shared";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !isValidLocale(locale)) {
    locale = DEFAULT_LOCALE;
  }

  const localeMessages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages: deepMerge(sharedMessages, localeMessages),
  };
});
