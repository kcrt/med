# Code Review Report: Medicalculator (医療計算機)

**Review Date:** 2026-01-27
**Repository:** Medical calculation web application (Next.js-based)
**Reviewer:** Claude Code

---

## Executive Summary

This is a well-structured medical calculation web application built with modern React/Next.js stack. The codebase demonstrates strong TypeScript practices, good separation of concerns, and thoughtful internationalization support. Overall code quality is high, with some areas for improvement noted below.

**Overall Rating:** 8.5/10

---

## 1. Code Quality and Maintainability

### Strengths

#### 1.1 Excellent TypeScript Usage
- **Strict mode enabled** in `tsconfig.json` with comprehensive type checking
- **Zod schemas** for runtime validation of formula JSON data (`src/types/formula.ts`)
- Type guards used effectively (`isCalculationFormula`, `isHtmlFormula`, `hasFormulaProperty`)
- Path aliases (`@/*`) properly configured for clean imports

```typescript
// Good: Comprehensive Zod schema with refinement
export const FormulaDataSchema = z
  .object({ _meta: FormulaMetaSchema })
  .loose()
  .superRefine((data, ctx) => {
    // Validate all other keys as categories
    for (const [key, value] of Object.entries(data)) {
      if (key === "_meta") continue;
      const categoryResult = FormulaCategorySchema.safeParse(value);
      // ...
    }
  });
```

#### 1.2 Clean Architecture
- **Separation of concerns:** Formula logic, UI components, and translations are well-separated
- **Hooks pattern:** Custom hooks in `src/lib/formula-hooks.ts` provide clean abstractions
- **Modular formula structure:** JSON files organized by medical specialty

#### 1.3 DRY Principle Adherence
- Type guards defined once and reused across the codebase
- Translation helpers consolidated in `src/lib/formula-translation.ts`
- Formula evaluation logic centralized in `src/lib/formula.ts`

### Areas for Improvement

#### 1.4 Component Complexity
**Priority: Medium**

`FormulaCalculator.tsx` (447 lines) handles too many responsibilities:
- Form state management
- Input validation
- Formula evaluation
- UI rendering
- Query parameter handling

**Recommendation:** Extract smaller components:

```typescript
// Suggested structure:
- FormulaInputField.tsx      // Individual input rendering
- FormulaOutputDisplay.tsx   // Output rendering
- useFormulaForm.ts          // Form logic hook
- useFormulaEvaluation.ts    // Evaluation logic hook
```

#### 1.5 Duplicate Type Guard Definitions
**Priority: Low**

Type guards are defined both in `src/lib/formula.ts` and `src/components/FormulaCalculator.tsx`:

```typescript
// src/lib/formula.ts line 84-98
export function isCalculationFormula(formula: Formula): boolean

// src/components/FormulaCalculator.tsx line 49-55
function isCalculationFormula(formula: Formula): formula is Formula & { ... }
```

**Recommendation:** Remove the duplicate from FormulaCalculator and import from formula.ts.

---

## 2. Best Practices and Design Patterns

### Strengths

#### 2.1 Modern React Patterns
- **React Server Components** used appropriately (layout.tsx)
- **Client Components** marked explicitly with `"use client"`
- **React Compiler** enabled in Next.js config

#### 2.2 Internationalization (i18n) Done Right
- **next-intl** properly configured with locale detection
- Semantic translation keys with fallback mechanisms
- Smart dot-escaping for translation keys (`escapeTranslationKey`)

```typescript
// src/lib/formula-translation.ts line 12-19
const DOT_PLACEHOLDER = "{{dot}}";
function escapeTranslationKey(key: string): string {
  return key.replace(/\./g, DOT_PLACEHOLDER);
}
```

#### 2.3 Form Handling with Mantine
- Proper use of `@mantine/form` for form state
- Type-safe form values with TypeScript

### Areas for Improvement

#### 2.4 Hardcoded Strings in Components
**Priority: Medium**

Some UI strings remain hardcoded in Japanese/English:

```typescript
// src/components/FormulaCalculator.tsx lines 283, 356, 357
<Title order={3}>計算</Title>  // Should use t('calculate')
<Alert variant="light" color="red" title="入力エラー">  // Should use t('inputError')
```

**Recommendation:** Move all UI strings to translation files.

#### 2.5 Sex Input Type Implementation
**Priority: Medium**

The "sex" input type uses hardcoded English labels:

```typescript
// src/components/FormulaCalculator.tsx lines 307-308
<Radio value="true" label="Male" />
<Radio value="false" label="Female" />
```

**Recommendation:** Make labels translatable and consider more inclusive options.

---

## 3. Performance Optimization Opportunities

### 3.1 Formula Data Loading
**Priority: Medium**

All formula JSON files are imported statically at build time:

```typescript
// src/lib/formula.ts lines 11-30
import formulasIndex from "@/formulas/index.json";
import bodyStructureIndex from "@/formulas/body-structure-index.json";
// ... 17 more imports
```

**Impact:** Bundle size grows with each new formula category.

**Recommendation:** Consider dynamic imports for formula categories:

```typescript
// Lazy load formula categories
const loadFormulaCategory = async (category: string) => {
  return await import(`@/formulas/${category}.json`);
};
```

### 3.2 useMemo Opportunities
**Priority: Low**

`FormulaCalculator` recalculates on every render:

```typescript
// src/components/FormulaCalculator.tsx lines 250-257
const currentInputValues = form.values
  ? getInputValues(form.values as FormValues)
  : {};

const results = Object.keys(currentInputValues).length > 0
  ? evaluateFormulaOutputs(formula, currentInputValues)
  : {};
```

**Recommendation:** Wrap in `useMemo` to avoid recalculation on unrelated renders:

```typescript
const results = useMemo(() => {
  if (Object.keys(currentInputValues).length === 0) return {};
  return evaluateFormulaOutputs(formula, currentInputValues);
}, [formula, currentInputValues]);
```

### 3.3 Inline Styles in QRCodeExport and ShareButton
**Priority: Low**

Both components use inline style objects that are recreated on every render:

```typescript
// src/components/QRCodeExport.tsx lines 51-57, 65-76
<Box style={{ position: "fixed", bottom: "20px", ... }}>
```

**Recommendation:** Use CSS modules or Tailwind classes for static styles.

---

## 4. Security Concerns

### 4.1 HTML Formula Type - XSS Risk
**Priority: High**

HTML formulas use `dangerouslySetInnerHTML`:

```typescript
// src/app/[locale]/formula/[id]/page.tsx line 90
<div dangerouslySetInnerHTML={{ __html: formula.html }} />
```

**Risk:** If formula JSON is compromised, arbitrary HTML/JS could be injected.

**Recommendation:**
1. Sanitize HTML content using DOMPurify
2. Add Content Security Policy headers
3. Validate HTML formula content during build

```typescript
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(formula.html)
}} />
```

### 4.2 Formula Expression Injection
**Priority: Medium**

Formula expressions are evaluated using `expr-eval`:

```typescript
// src/lib/formula.ts line 394-400
export function evaluateFormula(formula: string, inputValues: FormulaInputValues) {
  const expr = parser.parse(formula);
  return expr.evaluate(inputValues);
}
```

**Assessment:** `expr-eval` is a safe expression evaluator that doesn't allow arbitrary code execution. However, review any custom functions added to the parser.

### 4.3 LocalStorage Data Validation
**Priority: Low**

Favorites data from localStorage is validated:

```typescript
// src/lib/favorites.ts lines 25-41
const parsed = JSON.parse(stored);
if (!Array.isArray(parsed)) {
  console.error("Invalid favorites data: not an array");
  return [];
}
const validated = parsed.filter((item) => typeof item === "string");
```

**Good:** Proper validation in place.

---

## 5. Error Handling and Edge Cases

### Strengths

#### 5.1 Comprehensive Error Handling in Favorites
`src/lib/favorites.ts` gracefully handles localStorage errors and corrupted data.

#### 5.2 Formula Evaluation Error Handling
`evaluateFormulaOutputs` handles missing variables gracefully:

```typescript
// src/lib/formula.ts lines 496-504
try {
  const value = evaluateFormula(outputDef.formula, context);
  results[outputKey] = formatOutput(value, outputDef.precision);
  progress = true;
} catch {
  // Variable not yet available, will retry in next iteration
}
```

### Areas for Improvement

#### 5.3 Missing Error Boundary
**Priority: High**

No error boundaries are implemented. A formula evaluation error could crash the entire application.

**Recommendation:** Add React Error Boundaries:

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to monitoring service
  }
  // ...
}
```

#### 5.4 Silent Failures in Translation
**Priority: Medium**

Translation failures silently fall back to English:

```typescript
// src/lib/formula-translation.ts lines 56-61
const translated = getTranslationDirect(labels, escapedKey);
if (translated) {
  return translated;
}
return englishName;  // Silent fallback
```

**Recommendation:** Log missing translations in development mode.

#### 5.5 Incomplete Input Handling
**Priority: Medium**

Date input parsing could fail with invalid dates:

```typescript
// src/components/FormulaCalculator.tsx lines 166-171
case "date":
  if (value instanceof Date) {
    inputValues[key] = Math.floor(value.getTime() / 1000);
  } else if (typeof value === "string" && value) {
    inputValues[key] = Math.floor(Date.parse(value) / 1000);
  }
  break;
```

**Issue:** `Date.parse(value)` returns `NaN` for invalid dates, which becomes `NaN` in the output.

**Recommendation:** Validate date parsing and handle NaN:

```typescript
const parsed = Date.parse(value);
if (!Number.isNaN(parsed)) {
  inputValues[key] = Math.floor(parsed / 1000);
}
```

---

## 6. Documentation and Code Comments

### Strengths

#### 6.1 Excellent JSDoc Comments
`src/lib/formula.ts` has comprehensive documentation:

```typescript
/**
 * Body Surface Area calculation using Du Bois formula.
 *
 * BSA = 0.007184 × height^0.725 × weight^0.425
 *
 * @param height - Height in centimeters
 * @param weight - Weight in kilograms
 * @returns Body Surface Area in square meters
 *
 * @example
 * BSA_DuBois(170, 70) // Returns approximately 1.81
 */
```

#### 6.2 API Documentation
Separate documentation files exist:
- `docs/API.md`
- `docs/LOCALE.md`

### Areas for Improvement

#### 6.3 Missing Component Documentation
**Priority: Low**

React components lack prop documentation:

```typescript
// src/components/FormulaCalculator.tsx lines 39-42
interface FormulaCalculatorProps {
  formula: Formula;
  formulaId: string;
}
```

**Recommendation:** Add JSDoc to component props:

```typescript
interface FormulaCalculatorProps {
  /** The formula definition to render */
  formula: Formula;
  /** Unique identifier for the formula */
  formulaId: string;
}
```

#### 6.4 Complex Logic Needs Comments
**Priority: Medium**

The iterative evaluation logic in `evaluateFormulaOutputs` needs explanation:

```typescript
// src/lib/formula.ts lines 476-513
// Why is maxIterations 10? What determines completion?
for (let iteration = 0; iteration < maxIterations; iteration++) {
  // ...
}
```

---

## 7. Testing Coverage

### Strengths

#### 7.1 Comprehensive Formula Tests
`src/lib/__tests__/formula.test.ts` tests:
- All embedded formula test cases
- Type guards
- Mathematical functions
- Validation logic

#### 7.2 Component Tests Exist
Navbar and ShareButton have basic tests.

### Areas for Improvement

#### 7.3 Low Test Coverage for Components
**Priority: High**

Only 2 out of 8 components have tests:
- ✅ Navbar.test.tsx
- ✅ ShareButton.test.tsx
- ❌ FormulaCalculator.test.tsx (missing - most critical component!)
- ❌ QRCodeExport.test.tsx
- ❌ CopyResultButton.test.tsx
- ❌ AppShellLayout.test.tsx

**Recommendation:** Prioritize testing `FormulaCalculator` with various formula types.

#### 7.4 Missing Integration Tests
**Priority: Medium**

No tests for:
- Formula page routing
- LocalStorage favorites persistence
- Locale switching
- Query parameter handling

#### 7.5 Missing Hook Tests
**Priority: Medium**

Custom hooks need testing:
- `useFormula` (basic, but should verify)
- `useTranslatedMenuItems` (complex filtering logic)

---

## 8. Specific Code Issues

### 8.1 Factorial Helper Function
**Priority: Low**

```typescript
// src/lib/formula.ts lines 279-285
function factorialHelper(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
```

**Issues:**
1. No input validation (negative numbers, non-integers)
2. Potential for stack overflow with large numbers (though loop-based, so just slow)
3. Only used by `erf()` which has fixed 50 iterations

### 8.2 Missing "hidden" Label Constant
**Priority: Low**

```typescript
// src/components/FormulaCalculator.tsx line 374
if ("label" in outputDef && outputDef.label === "hidden") return null;
```

**Recommendation:** Define a constant:

```typescript
const HIDDEN_OUTPUT_LABEL = "hidden";
```

### 8.3 Select Input Index Mapping
**Priority: Medium**

```typescript
// src/components/FormulaCalculator.tsx lines 158-163
case "select": {
  const selectedIndex = Number(value);
  const selectedOption = inputDef.options?.[selectedIndex];
  inputValues[key] = selectedOption?.value ?? 0;
  break;
}
```

**Issue:** Uses array index as value, which can break if options are reordered.

**Recommendation:** Use option value directly instead of index.

### 8.4 Unused Import
**Priority: Low**

```typescript
// src/components/AppShellLayout.tsx line 12
import "tailwindcss"
```

This import is unnecessary as Tailwind is configured via PostCSS.

---

## 9. Recommendations Summary

### High Priority
1. **Add Error Boundaries** - Prevent crashes from affecting entire app
2. **Sanitize HTML Formula Content** - XSS prevention with DOMPurify
3. **Add FormulaCalculator Tests** - Critical component needs coverage

### Medium Priority
4. **Extract FormulaCalculator Sub-components** - Reduce complexity
5. **Internationalize Hardcoded Strings** - Complete i18n coverage
6. **Add Missing Hook/Integration Tests** - Improve coverage
7. **Log Missing Translations in Dev** - Aid translation maintenance
8. **Validate Date Parsing** - Handle invalid date inputs

### Low Priority
9. **Use CSS Modules for Static Styles** - Performance optimization
10. **Dynamic Formula Loading** - Reduce bundle size
11. **Add useMemo for Expensive Calculations** - Micro-optimization
12. **Define Constants for Magic Strings** - Code quality

---

## 10. Positive Highlights

1. **Excellent TypeScript adoption** - Strict mode, proper generics
2. **Strong validation** - Zod schemas for all formula data
3. **Good separation of concerns** - Clean architecture
4. **Thoughtful i18n** - Proper locale handling with fallbacks
5. **Medical domain expertise** - Appropriate formulas and references
6. **Modern stack** - Next.js 16, React 19, latest patterns
7. **Documentation** - Good inline docs and separate guides
8. **Test infrastructure** - Vitest properly configured
9. **Accessibility** - ARIA labels on interactive elements
10. **Responsive design** - Mobile-first with Mantine

---

## Appendix: File Structure Health

| Directory | Assessment |
|-----------|------------|
| `src/app/` | ✅ Clean, follows Next.js conventions |
| `src/components/` | ⚠️ Good but needs more tests |
| `src/lib/` | ✅ Well-organized utility functions |
| `src/types/` | ✅ Comprehensive Zod schemas |
| `src/formulas/` | ✅ Good modular organization |
| `src/messages/` | ✅ Proper i18n structure |
| `docs/` | ✅ Good separate documentation |

---

*End of Review Report*
