Locale Configuration
====================

The Medicalculator supports four languages with centralized locale management using next-intl.

Supported Languages
-------------------

- **English** (`en`) - Default locale
- **Japanese** (`ja`)
- **Chinese (Simplified)** (`zh-Hans`)
- **Chinese (Traditional)** (`zh-Hant`)

Locale detection is automatic based on browser settings, with manual selection available via the `/config` page.

**URL Structure**: Language-specific URLs are used for SEO purposes:
- English: `/en/` (e.g., `/en/formula/bmi_adult`)
- Japanese: `/ja/` (e.g., `/ja/formula/bmi_adult`)
- Simplified Chinese: `/zh-Hans/` (e.g., `/zh-Hans/formula/bmi_adult`)
- Traditional Chinese: `/zh-Hant/` (e.g., `/zh-Hant/formula/bmi_adult`)

Configuration Files
-------------------

### `src/lib/locale.ts`

Central locale configuration - single source of truth for supported languages.

```typescript
// Type-safe locale values
type Locale = "en" | "ja" | "zh-Hans" | "zh-Hant";

// Language metadata
interface LanguageInfo {
  english_name: string;  // e.g., "Japanese"
  local_name: string;    // e.g., "日本語"
}

// Constants
export const SUPPORTED_LOCALES: Locale[] = ["en", "ja", "zh-Hans", "zh-Hant"];
export const DEFAULT_LOCALE: Locale = "en";

// Validation
function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in languages;
}
```

### `src/lib/languages.json`

**Single source of truth** for language metadata and configuration:

```json
{
  "en": {
    "english_name": "English",
    "local_name": "English",
    "browser_codes": ["en"]
  },
  "ja": {
    "english_name": "Japanese",
    "local_name": "日本語",
    "browser_codes": ["ja"]
  },
  "zh-Hans": {
    "english_name": "Chinese (Simplified)",
    "local_name": "中文 (简体)",
    "browser_codes": ["zh-CN", "zh-SG", "zh"]
  },
  "zh-Hant": {
    "english_name": "Chinese (Traditional)",
    "local_name": "中文 (繁體)",
    "browser_codes": ["zh-TW", "zh-HK", "zh-MO"]
  }
}
```

**Fields:**
- `english_name`: Language name in English (for documentation and fallbacks)
- `local_name`: Native language name displayed in UI components
- `browser_codes`: Browser language codes that map to this locale

### `src/lib/locale.ts`

Central locale utilities that build upon `languages.json`:

```typescript
import languagesJson from "./languages.json";

export type Locale = keyof typeof languagesJson;
export type LanguageInfo = (typeof languagesJson)[Locale];

export const languages = languagesJson as Record<Locale, LanguageInfo>;
export const SUPPORTED_LOCALES = Object.keys(languages) as Locale[];
export const DEFAULT_LOCALE: Locale = "en";

// Utility functions
export function isValidLocale(value: unknown): value is Locale;
export function getBrowserLanguageMap(): Record<string, Locale>;
export function detectLocaleFromBrowser(browserLang: string): Locale;
```

**All components and utilities automatically derive locale data from `languages.json`**, ensuring consistency across the application.

### `src/middleware.ts`

next-intl middleware configuration for routing and locale detection:

**Note:** This file is referenced in the documentation but does not currently exist in the repository. If needed, create it with:

```typescript
import createMiddleware from "next-intl/middleware";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./lib/locale";

export default createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",           // Show locale prefix in URLs for SEO
  localeDetection: true,            // Auto-detect from browser
});
```

### `src/lib/navigation.ts`

Locale-aware navigation utilities that automatically handle locale prefixes:

```typescript
import { createNavigation } from "next-intl/navigation";
import { SUPPORTED_LOCALES } from "./locale";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: SUPPORTED_LOCALES,
  localePrefix: "always",
});
```

Usage
------

### Type-Safe Locale Values

Import types and utilities for type-safe locale handling:

```typescript
import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale } from "@/lib/locale";

// Type narrowing
function processLocale(value: unknown) {
  if (isValidLocale(value)) {
    // value is typed as Locale ("en" | "ja" | "zh-Hans" | "zh-Hant")
    console.log(value);
  }
}
```

### Getting Current Locale

Use next-intl hooks in components:

```typescript
import { useLocale } from "next-intl";

function Component() {
  const locale = useLocale(); // "en" | "ja" | "zh-Hans" | "zh-Hant"
}
```

### Navigation

**Always use the locale-aware navigation utilities** from `@/lib/navigation`:

```typescript
import { Link, useRouter, usePathname } from "@/lib/navigation";

function Component() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Links automatically include locale prefix
  return (
    <Link href="/formula/bmi_adult">BMI Calculator</Link>
  );
  
  // Programmatic navigation
  router.push("/config");
  
  // Switch locale while staying on same page
  router.replace(pathname, { locale: "ja" });
}
```

**Do not use** `next/link` or `next/navigation` directly for locale-aware routing.

### Config Page (`/config`)

Users can manually select language preference at `/config`:

- **Auto**: Browser-based detection (default)
- **English**: Force English locale
- **Japanese**: Force Japanese locale
- **Chinese (Simplified)**: Force Simplified Chinese locale
- **Chinese (Traditional)**: Force Traditional Chinese locale

Selection is persisted via `NEXT_LOCALE` cookie (1 year expiry).

### Development Locale Switcher

The `<DevModeBar />` component displays a quick locale switcher menu in development environments (localhost). It allows switching between English, Japanese, Simplified Chinese, and Traditional Chinese for easy translation testing.

```typescript
import { DevModeBar } from "@/components/DevModeBar";

// Automatically shows only in development
<DevModeBar />
```

Adding a New Language
---------------------

To add a new language, follow these steps:

1. **Add to `src/lib/languages.json`:**

Add the new language with its metadata, including browser language codes:

```json
{
  "ko": {
    "english_name": "Korean",
    "local_name": "한국어",
    "browser_codes": ["ko", "ko-KR"]
  }
}
```

The fields are:
- `english_name`: Name of the language in English (for documentation)
- `local_name`: Name of the language in its native script (displayed in UI components)
- `browser_codes`: Array of browser language codes that should map to this locale

2. **Add translation files:**

Create `src/messages/ko.json` with translations following the same structure as `en.json` and `ja.json`.

That's it! The centralized configuration in `languages.json` will automatically:
- Update `SUPPORTED_LOCALES` array
- Update the language switcher dropdown
- Update the config page language options
- Update browser language detection mapping
- Generate language labels in shared messages

**Note:** No need to manually update `LanguageSwitcher.tsx`, `config/page.tsx`, or `shared.ts` anymore - they automatically use the centralized definitions.

Translation System
------------------

### Label Translation (`src/lib/formula-translation.ts`)

Formula labels are translated using English text as the key:

```typescript
// Formula name translation
useFormulaName(formulaId, formula);

// Input label translation
useInputLabel(formulaId, inputKey, input);

// Output label translation
useOutputLabel(formulaId, outputKey, output);

// Option label translation (for select inputs)
useOptionLabel("Option label");

// Output text translation (for multi-sentence text)
useOutputText(formulaId, outputKey, output);
```

### Translation Key Format

In `src/messages/{locale}.json`:

```json
{
  "labels": {
    "BMI": "BMI",
    "Body Mass Index": "Body Mass Index",
    "Weight": "体重",
    "Height": "身長"
  },
  "category": {
    "Cardiology": "循環器",
    "Pediatrics": "小児科"
  }
}
```

### Handling Dots in Keys

Keys containing dots (e.g., "Apgar Score") are automatically escaped using `{{dot}}` placeholder internally.

### Semantic Keys for Long Text

For output text with multiple sentences, use semantic keys:

```json
{
  "labels": {
    "abcd2i_note_text": "生後日数が14日以内の新生児に対する補正..."
  }
}
```

The pattern is: `{formulaId}_{outputKey}_text`
