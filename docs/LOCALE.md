Locale Configuration
====================

The Medicalculator supports two languages with centralized locale management using next-intl.

Supported Languages
-------------------

- **English** (`en`) - Default locale
- **Japanese** (`ja`)

Locale detection is automatic based on browser settings, with manual selection available via the `/config` page.

**URL Structure**: Language-specific URLs are used for SEO purposes:
- English: `/en/` (e.g., `/en/formula/bmi_adult`)
- Japanese: `/ja/` (e.g., `/ja/formula/bmi_adult`)

Configuration Files
-------------------

### `src/lib/locale.ts`

Central locale configuration - single source of truth for supported languages.

```typescript
// Type-safe locale values
type Locale = "en" | "ja";

// Language metadata
interface LanguageInfo {
  english_name: string;  // e.g., "Japanese"
  local_name: string;    // e.g., "日本語"
}

// Constants
export const SUPPORTED_LOCALES: Locale[] = ["en", "ja"];
export const DEFAULT_LOCALE: Locale = "en";

// Validation
function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in languages;
}
```

### `src/lib/languages.json`

Language metadata storage for UI display:

```json
{
  "en": {
    "english_name": "English",
    "local_name": "English"
  },
  "ja": {
    "english_name": "Japanese",
    "local_name": "日本語"
  }
}
```

### `src/middleware.ts`

next-intl middleware configuration for routing and locale detection:

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
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { SUPPORTED_LOCALES } from "./locale";

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales: SUPPORTED_LOCALES });
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
    // value is typed as Locale ("en" | "ja")
    console.log(value);
  }
}
```

### Getting Current Locale

Use next-intl hooks in components:

```typescript
import { useLocale } from "next-intl";

function Component() {
  const locale = useLocale(); // "en" | "ja"
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

Selection is persisted via `NEXT_LOCALE` cookie (1 year expiry).

### Development Locale Switcher

The `<DevModeBar />` component displays a quick locale switcher button in development environments (localhost). It alternates between English and Japanese for easy translation testing.

```typescript
import { DevModeBar } from "@/components/DevModeBar";

// Automatically shows only in development
<DevModeBar />
```

Adding a New Language
---------------------

1. **Add to `languages.json`:**

```json
{
  "zh": {
    "english_name": "Chinese",
    "local_name": "中文"
  }
}
```

2. **Add translation files:**

Create `src/messages/zh.json` with translations following the same structure as `en.json` and `ja.json`.

3. **Update DevModeBar** (`src/components/DevModeBar.tsx`):

Add the new locale to the constants:

```typescript
const LOCALES = ["en", "ja", "zh"] as const;
const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ja: "日本語",
  zh: "中文",
};
```

4. **Add config page option** (`src/app/[locale]/config/page.tsx`):

```tsx
<Select
  data={[
    { label: t("language.auto"), value: "auto" },
    { label: t("language.en"), value: "en" },
    { label: t("language.ja"), value: "ja" },
    { label: t("language.zh"), value: "zh" }, // Add this
  ]}
/>
```

5. **Add translation for the new language in message files:**

Add `config.language.zh: "Chinese"` to all message files.

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
