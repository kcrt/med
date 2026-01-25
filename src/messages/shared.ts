/**
 * Shared configuration that is common across all languages.
 * Language names themselves are intentionally not translated as they
 * should be displayed consistently (e.g., "English" shown to all users).
 */

export const sharedMessages = {
  config: {
    language: {
      label: "Language",
      auto: "Auto (Browser language)",
      en: "English",
      ja: "日本語",
    },
  },
} as const;

export type SharedMessages = typeof sharedMessages;
