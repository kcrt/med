/**
 * Shared configuration that is common across all languages.
 * Language names themselves are intentionally not translated as they
 * should be displayed consistently (e.g., "English" shown to all users).
 * 
 * Language labels are automatically generated from src/lib/languages.json
 * to maintain a single source of truth.
 */

import languagesJson from "../lib/languages.json";

// Generate language labels from languages.json
const languageLabels = Object.entries(languagesJson).reduce(
  (acc, [locale, info]) => {
    acc[locale] = info.local_name;
    return acc;
  },
  {} as Record<string, string>,
);

export const sharedMessages = {
  config: {
    language: {
      label: "Language",
      auto: "Auto (Browser language)",
      ...languageLabels,
    },
  },
} as const;

export type SharedMessages = typeof sharedMessages;
