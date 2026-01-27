API Reference
=============

This document describes the main APIs and utilities available in the Medicalculator codebase.

Formula Hooks (`src/lib/formula-hooks.ts`)
-------------------------------------------

Client-side hooks for accessing formula data and translations.

### `useFormula(id: string): Formula | undefined`

Get a formula definition by ID.

```typescript
import { useFormula } from "@/lib/formula-hooks";

const formula = useFormula("bmi_adult");
if (formula) {
  console.log(formula.name); // "BMI"
}
```

### `useMenuItems(): CategoryMenuItem[]`

Get menu items with translated category and formula labels.

```typescript
import { useMenuItems } from "@/lib/formula-hooks";

const menuItems = useMenuItems();
// Returns: [
//   { label: "Cardiology", items: [{ id: "bmi_adult", label: "BMI" }] }
// ]
```

### `useFormulaData(): Record<string, FormulaData>`

Get all formula data organized by category.

```typescript
import { useFormulaData } from "@/lib/formula-hooks";

const data = useFormulaData();
// Returns: { cardiology: { formulas: {...} }, pediatrics: {...} }
```

### `useShouldDisplayForLocale(output: FormulaOutput): boolean`

Check if an output should be displayed for the current locale.

```typescript
import { useShouldDisplayForLocale } from "@/lib/formula-hooks";

if (useShouldDisplayForLocale(output)) {
  return <OutputDisplay {...output} />;
}
```

Translation Hooks (`src/lib/formula-translation.ts`)
----------------------------------------------------

Hooks for translating formula labels and text content. See [docs/LOCALE.md](LOCALE.md) for translation system details.

### `useFormulaName(formulaId: string, formula: Formula): string`

Get translated formula name. Falls back to English name if translation is missing.

```typescript
import { useFormulaName } from "@/lib/formula-translation";

const name = useFormulaName("bmi_adult", formula);
// Returns: "BMI" (en) or "BMI" (ja)
```

### `useInputLabel(formulaId: string, inputKey: string, input: FormulaInput): string`

Get translated input label. Uses English label as translation key.

```typescript
import { useInputLabel } from "@/lib/formula-translation";

const label = useInputLabel(formulaId, "weight", input);
// Returns: "Weight (kg)" (en) or "体重 (kg)" (ja)
```

### `useOptionLabel(optionLabel: string): string`

Get translated option label for select inputs.

```typescript
import { useOptionLabel } from "@/lib/formula-translation";

const label = useOptionLabel("Male");
// Returns: "Male" (en) or "男性" (ja)
```

### `useOutputLabel(formulaId: string, outputKey: string, output: FormulaOutput): string`

Get translated output label.

```typescript
import { useOutputLabel } from "@/lib/formula-translation";

const label = useOutputLabel(formulaId, "bmi", output);
// Returns: "BMI" (en) or "BMI" (ja)
```

### `useOutputText(formulaId: string, outputKey: string, output: FormulaOutput): string | undefined`

Get translated output text. For multi-sentence text, uses semantic keys.

```typescript
import { useOutputText } from "@/lib/formula-translation";

const text = useOutputText(formulaId, "note", output);
// Returns translated text or undefined
```

Utility Functions
------------------

### `buildHumanReadableData` (`src/lib/calculation-export.ts`)

Build a human-readable string of calculation results for copying or QR code export.

**Signature:**

```typescript
function buildHumanReadableData(
  formula: CalculationFormula,
  formulaId: string,
  inputValues: FormulaInputValues,
  outputResults: FormulaOutputValues
): string
```

**Example:**

```typescript
import { buildHumanReadableData } from "@/lib/calculation-export";

const text = buildHumanReadableData(
  formula,      // CalculationFormula
  "bmi_adult",  // string
  { weight: 70, height: 175 },  // FormulaInputValues
  { bmi: 22.86 }  // FormulaOutputValues
);
// Returns:
// "BMI
//
// Weight: 70
// Height: 175
//
// BMI: 22.86 kg/m²"
```

### `useDebug()` (`src/lib/use-debug.ts`)

Hook to detect if the app is running in development/localhost environment.

**Signature:**

```typescript
function useDebug(): boolean
```

**Example:**

```typescript
import { useDebug } from "@/lib/use-debug";

const isDebug = useDebug(); // true on localhost, false otherwise

if (isDebug) {
  // Show development-only features
}
```

Components
----------

### `<CopyResultButton />`

Button to copy calculation results to clipboard. Shows checkmark icon on successful copy.

**Props:**

```typescript
interface CopyResultButtonProps {
  formula: Formula;
  formulaId: string;
  inputValues: FormulaInputValues;
  outputResults: FormulaOutputValues;
}
```

**Example:**

```tsx
import { CopyResultButton } from "@/components/CopyResultButton";

<CopyResultButton
  formula={formula}
  formulaId="bmi_adult"
  inputValues={{ weight: 70, height: 175 }}
  outputResults={{ bmi: 22.86 }}
/>
```

**Behavior:**
- Only renders for calculation formulas with valid inputs and results
- Shows tooltip with button label
- Changes to teal color with checkmark icon for 2 seconds after copy
- Uses clipboard API via `navigator.clipboard.writeText()`

### `<ShareButton />`

Floating action button that generates a shareable URL with input values as query parameters.

**Props:**

```typescript
interface ShareButtonProps {
  formula: Formula;
  inputValues: Record<string, number | string | boolean | Date | null>;
}
```

**Example:**

```tsx
import { ShareButton } from "@/components/ShareButton";

<ShareButton
  formula={formula}
  inputValues={{ weight: 70, height: 175 }}
/>
```

**Behavior:**
- Fixed position: bottom-right (20px from bottom, 90px from right)
- Only renders for calculation formulas with at least one non-null input
- Opens modal with shareable URL containing query parameters
- URL format: `{baseUrl}?{key1}={value1}&{key2}={value2}`
- Copy button in modal to copy URL to clipboard

### `<DevModeBar />`

Development-only component showing a locale switcher button for testing translations.

**Example:**

```tsx
import { DevModeBar } from "@/components/DevModeBar";

<DevModeBar />
```

**Behavior:**
- Automatically visible only in localhost environments (uses `useDebug()` internally)
- Alternates between English and Japanese on click
- Uses compact button styling (size="xs", variant="light")

### `<QRCodeExport />`

Component that generates a QR code containing calculation results in human-readable format.

The QR code encodes the same format as `buildHumanReadableData()`, allowing users to scan and share calculation results.

Type Definitions
----------------

### `Locale` (`src/lib/locale.ts`)

Union type of supported locale codes.

```typescript
type Locale = "en" | "ja";
```

### `LanguageInfo` (`src/lib/locale.ts`)

Language metadata interface.

```typescript
interface LanguageInfo {
  english_name: string;  // English name of the language
  local_name: string;    // Native name of the language
}
```

### `Formula` (`src/types/formula.ts`)

Base formula type. Use `isCalculationFormula()` to narrow to `CalculationFormula`.

### `CalculationFormula` (`src/lib/formula.ts`)

Formula type with input/output definitions for calculations.

### `FormulaInput` (`src/types/formula.ts`)

Input field definition with label, type, unit, and options.

### `FormulaOutput` (`src/types/formula.ts`)

Output field definition with label, unit, formula expression, and optional text.

### `FormulaInputValues`

Record mapping input keys to their values.

```typescript
type FormulaInputValues = Record<string, number | string | boolean | Date | null>;
```

### `FormulaOutputValues`

Record mapping output keys to calculated values.

```typescript
type FormulaOutputValues = Record<string, number>;
```
